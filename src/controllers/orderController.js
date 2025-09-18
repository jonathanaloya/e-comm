import Flutterwave from "flutterwave-node-v3";
import Cart from "../models/cartProductModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'; // NEW: Import crypto for webhook verification
import dotenv from 'dotenv';
dotenv.config();

// Utility function for Flutterwave webhook signature verification
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
export function verifyFlutterwaveWebhook(signature, secretHash, rawBody) {
    if (!signature || !secretHash || !rawBody) {
        return false;
    }
    const hash = crypto
        .createHmac('sha256', secretHash)
        .update(rawBody)
        .digest('hex');
    return hash === signature;
}


export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body 

        // It's good practice to generate a unique ID for COD orders too,
        // and perhaps store the totalAmt/subTotalAmt from the request,
        // rather than recalculating line by line here if list_items is already aggregated.
        // However, sticking to the existing logic for now.
        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "", // No paymentId for COD
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt, // Assuming these are total sub/total amounts for the whole order
                totalAmt  :  totalAmt,      // You might want to store individual item totals as well.
                quantity: el.quantity // Ensure quantity is captured for COD items too
            })
        })

        const generatedOrder = await Order.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await Cart.deleteMany({ userId : userId })
        const updateInUser = await User.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price, dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request, response) {
  try {
    const userId = request.userId; // From auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    if (!userId || !list_items || list_items.length === 0 || !totalAmt || !addressId) {
      return response.status(400).json({
        message: "Missing required order details: userId, list_items, totalAmt, or addressId.",
        error: true,
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    // Unique transaction reference for Flutterwave
    const tx_ref = `FLW-${uuidv4().substring(0, 8)}-${Date.now()}`;

    // Group ID to link all items in this checkout
    const mainOrderId = `ORD-GROUP-${uuidv4()}`;

    // Create individual Order documents per item with unique orderId
    const orderPromises = list_items.map(async (item) => {
  if (!item.productId || !item.productId._id || !item.productId.name || !item.productId.image || !item.price || !item.quantity) {
    throw new Error("Invalid product item structure in list_items.");
  }

  const uniqueOrderId = `ORD-${uuidv4()}`; // Only use UUID

  return Order.create({
    userId,
    orderId: uniqueOrderId,      // guaranteed unique
    mainOrderId: mainOrderId,    // group ID
    productId: item.productId._id,
    product_details: {
      name: item.productId.name,
      image: Array.isArray(item.productId.image) ? item.productId.image : [item.productId.image],
    },
    delivery_address: addressId,
    subTotalAmt: item.price * item.quantity,
    totalAmt: item.price * item.quantity,
    paymentId: tx_ref,
    payment_status: "pending",
  });
    });


    const createdOrderDocs = await Promise.all(orderPromises);
    console.log(`Created ${createdOrderDocs.length} order documents for mainOrderId: ${mainOrderId}`);

    // Prepare payload for Flutterwave
    const payload = {
      tx_ref: tx_ref,
      amount: totalAmt,
      currency: "UGX",
      redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
      payment_options: "card,mobilemoneyuganda",
      customer: {
        email: user.email,
        phonenumber: user.mobile ? user.mobile.toString() : "N/A",
        name: user.name || "Customer",
      },
      customizations: {
        title: "Fresh Katale",
        description: `Payment for Order ${mainOrderId}`,
      },
      meta: {
        mainOrderId: mainOrderId,
        userId: userId.toString(),
        expectedAmount: totalAmt,
        expectedCurrency: "UGX",
        orderItems: list_items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          image: item.productId.image,
          quantity: item.quantity,
          price: item.price
        }))
      },
    };

    console.log("Initializing Flutterwave payment with payload:", {
      tx_ref,
      amount: totalAmt,
      currency: "UGX",
      customer: payload.customer,
      mainOrderId
    });

    const responseData = await flw.Payment.initialize(payload);
    console.log("Flutterwave response:", {
      status: responseData?.status,
      hasLink: !!responseData?.data?.link,
      message: responseData?.message
    });

    if (responseData && responseData.status === "success" && responseData.data?.link) {
      console.log(`Payment initiation successful for mainOrderId: ${mainOrderId}, tx_ref: ${tx_ref}`);
      return response.status(200).json({
        message: "Payment initiated successfully",
        success: true,
        error: false,
        data: responseData.data.link,
        mainOrderId: mainOrderId,
        tx_ref: tx_ref
      });
    } else {
      // Mark orders as failed if Flutterwave initiation fails
      console.error("Payment initiation failed:", {
        responseData,
        tx_ref,
        mainOrderId
      });
      await Order.updateMany(
        { paymentId: tx_ref },
        { payment_status: "failed" }
      );
      return response.status(400).json({
        message: responseData?.message || "Failed to initiate payment",
        error: true,
        success: false,
        flutterwaveResponse: responseData
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return response.status(500).json({
      message: error.message || "An unexpected error occurred during payment initiation",
      error: true,
      success: false,
    });
  }
}

export async function verifyPaymentController(request, response) {
  try {
    // transaction_id is from Flutterwave redirect (query param usually)
    // tx_ref is also from Flutterwave redirect (query param usually)
    const { transaction_id, tx_ref } = request.query; // IMPORTANT: Changed from body to query as per redirect_url

    if (!transaction_id || !tx_ref) {
      return response.status(400).json({
        message: "Transaction ID and Transaction Reference are required for verification.",
        success: false,
        error: true,
      });
    }

    // Find the associated orders using the tx_ref
    const pendingOrders = await Order.find({ paymentId: tx_ref });

    if (!pendingOrders || pendingOrders.length === 0) {
      console.warn("No pending orders found for tx_ref:", tx_ref);
      return response.status(404).json({
        message: "No pending orders found for this transaction reference.",
        success: false,
        error: true,
      });
    }

    // Check if any of these orders are already successful (to prevent double processing)
    const alreadySuccessful = pendingOrders.some(order => order.payment_status === "successful");
    if (alreadySuccessful) {
        console.log("Payment already verified for tx_ref:", tx_ref);
        return response.status(200).json({
            message: "Payment already successfully verified.",
            success: true,
            error: false,
            // You might return relevant order data here
        });
    }


    console.log(`Verifying payment with Flutterwave - transaction_id: ${transaction_id}, tx_ref: ${tx_ref}`);
    const verifyResponse = await flw.Transaction.verify({ id: transaction_id });
    const paymentData = verifyResponse.data; // This is the actual transaction data from Flutterwave
    
    console.log("Flutterwave verification response:", {
      status: verifyResponse.status,
      paymentStatus: paymentData?.status,
      amount: paymentData?.amount,
      currency: paymentData?.currency,
      tx_ref: paymentData?.tx_ref
    });

    if (verifyResponse.status === "success" && paymentData && paymentData.status === "successful") {
      // --- IMPORTANT SECURITY CHECKS ---
      // Get expected values from one of the orders (they all share the same totalAmt/currency for the entire transaction)
      const firstOrder = pendingOrders[0];
      const expectedAmount = firstOrder.totalAmt; // This is the totalAmt of an individual item
      const expectedCurrency = "UGX"; // Should be consistent with the currency sent in initiatePayment

      // The original `totalAmt` for the entire cart transaction was saved in `meta.expectedAmount`
      // We need to retrieve the original totalAmt that was passed to Flutterwave for the whole cart.
      // This is best retrieved from the `meta` object that Flutterwave sends back, or from a dedicated Payment model.
      // For now, let's assume `meta` contains `expectedAmount`.
      const expectedTotalAmountForCart = paymentData.meta ? paymentData.meta.expectedAmount : firstOrder.totalAmt; // Fallback, but meta is best

      if (
        paymentData.amount >= expectedTotalAmountForCart && // Compare actual paid amount vs. expected total cart amount
        paymentData.currency === expectedCurrency &&
        paymentData.tx_ref === tx_ref // Ensure the tx_ref matches
      ) {
        // Payment is successful and all security checks pass
        await Order.updateMany(
          { paymentId: tx_ref }, // Update all orders associated with this tx_ref
          {
            payment_status: "successful",
            paymentId: paymentData.id.toString(), // Store Flutterwave's actual transaction ID
            invoice_receipt: paymentData.flw_ref, // Flutterwave's reference
          }
        );

        // Clear user's cart after successful payment
        const userId = pendingOrders[0].userId;
        await Cart.deleteMany({ userId: userId });
        await User.updateOne({ _id: userId }, { shopping_cart: [] });
        console.log(`Cleared cart for user ${userId} after successful payment verification`);

        // --- FULFILLMENT LOGIC HERE ---
        // For example:
        // - Update inventory for each product in `pendingOrders`
        // - Send order confirmation emails to the user

        return response.status(200).json({
          message: "Payment verified successfully",
          success: true,
          error: false,
          data: paymentData,
        });
      } else {
        // Amount, currency, or tx_ref mismatch - potential fraud or error
        await Order.updateMany(
          { paymentId: tx_ref },
          { payment_status: "failed" }
        );
        console.warn("Payment verification failed (security check): Amount, currency, or tx_ref mismatch.", {
          flutterwaveData: paymentData,
          expectedAmount: expectedTotalAmountForCart,
          expectedCurrency: expectedCurrency,
          tx_refSent: tx_ref,
        });
        return response.status(400).json({
          message: "Payment verification failed: Amount, currency, or transaction reference mismatch.",
          success: false,
          error: true,
          flutterwaveData: paymentData,
        });
      }
    } else {
      // Flutterwave verification status is not 'successful'
      await Order.updateMany(
        { paymentId: tx_ref },
        { payment_status: "failed" }
      );
      console.warn("Payment not successful according to Flutterwave:", paymentData);
      return response.status(400).json({
        message: "Payment verification failed (Flutterwave status not successful)",
        success: false,
        error: true,
        flutterwaveData: paymentData,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    // If an error occurs, it's safer to mark as failed or investigate manually
    // If you encounter an error here, the payment status for orders might still be 'pending'
    // You might want to add a retry mechanism or alert for such cases.
    await Order.updateMany(
      { paymentId: request.query.tx_ref }, // Use tx_ref from query for fallback
      { payment_status: "failed" }
    ).catch(e => console.error("Error updating orders on verification catch:", e)); // Catch update errors too

    return response.status(500).json({
      message: error.message || "An unexpected error occurred during payment verification",
      success: false,
      error: true,
    });
  }
}


// <<< NEW: Exporting this helper function so the webhook handler can use it
export const getOrderProductItems = async({
    originalListItems, 
    userId,
    addressId,
    paymentId,         
    payment_status,
 })=>{
    const productList = []

    if(originalListItems && originalListItems.length > 0){
        for(const item of originalListItems){
            const itemPriceAfterDiscount = pricewithDiscount(item.price, item.discount); // Use item.price/discount from meta
            const subTotalForItem = itemPriceAfterDiscount * item.quantity; 

            const payload = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`, 
                productId : item.productId, // Directly use productId from meta
                product_details : {
                    name : item.name,      // Directly use name from meta
                    image : item.image,    // Directly use image from meta
                },
                paymentId : paymentId,          
                payment_status : payment_status, 
                delivery_address : addressId,
                subTotalAmt  : subTotalForItem, 
                totalAmt  : subTotalForItem,    
                quantity: item.quantity,         
                unitPriceCharged: itemPriceAfterDiscount
            }

            productList.push(payload)
        }
    }

    return productList
}


// <<< REMOVED: The old webhookStripe function is removed.
// <<< NEW: This is the combined Flutterwave webhook handler function.
export async function webhookFlutterwaveController(request, response) {
  try {
    // Verify request signature
    const hash = crypto
      .createHmac("sha256", process.env.FLUTTERWAVE_WEBHOOK_SECRET || process.env.FLW_SECRET_HASH) // Use consistent env var
      .update(JSON.stringify(request.body))
      .digest("hex");

    if (hash !== request.headers["verif-hash"]) {
      console.warn("Invalid webhook signature received");
      return response.status(401).json({ message: "Invalid signature" });
    }

    const event = request.body;
    console.log("Flutterwave Webhook Event:", event);

    if (event.event === "charge.completed") {
      const data = event.data;
      const { status, id, tx_ref, flw_ref, meta } = data;

      console.log("Processing charge.completed event:", {
        status,
        tx_ref,
        mainOrderId: meta?.mainOrderId
      });

      if (status === "successful") {
        // Update orders using tx_ref (paymentId) instead of orderId
        const updateResult = await Order.updateMany(
          { paymentId: tx_ref },
          {
            payment_status: "successful",
            paymentId: id.toString(),
            invoice_receipt: flw_ref,
          }
        );
        console.log(`Updated ${updateResult.modifiedCount} orders to successful status`);
        
        // Clear user's cart if payment is successful
        if (meta?.userId) {
          await Cart.deleteMany({ userId: meta.userId });
          await User.updateOne({ _id: meta.userId }, { shopping_cart: [] });
          console.log(`Cleared cart for user ${meta.userId}`);
        }
      } else {
        const updateResult = await Order.updateMany(
          { paymentId: tx_ref },
          { payment_status: "failed" }
        );
        console.log(`Updated ${updateResult.modifiedCount} orders to failed status`);
      }
    }

    return response.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return response.status(500).json({ message: "Webhook processing failed" });
  }
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await Order.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
