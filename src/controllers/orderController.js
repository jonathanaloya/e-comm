import Flutterwave from "flutterwave-node-v3";
import Cart from "../models/cartProductModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'; // NEW: Import crypto for webhook verification

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
    const userId = request.userId; // Assuming userId is set by your auth middleware
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

    // Generate a single unique ID for the entire order group
    const mainOrderId = `ORD-${uuidv4().substring(0, 8)}-${Date.now()}`;
    const tx_ref = `FLW-${uuidv4().substring(0, 8)}-${Date.now()}`; // Unique Flutterwave transaction reference

    // Create individual Order documents for each product item
    // Each product in the order will have its own Order document,
    // but they will all share the same `mainOrderId` for grouping
    // and the `tx_ref` to link to the Flutterwave transaction.
    const orderPromises = list_items.map(async (item) => {
      // Basic validation for item structure
      if (!item.productId || !item.productId._id || !item.productId.name || !item.productId.image || !item.price || !item.quantity) {
          throw new Error("Invalid product item structure in list_items.");
      }

      return Order.create({
        userId,
        orderId: mainOrderId, // Use a single mainOrderId to group all items
        productId: item.productId._id, // Reference to the actual product
        product_details: {
          name: item.productId.name,
          image: Array.isArray(item.productId.image)
            ? item.productId.image
            : [item.productId.image],
        },
        delivery_address: addressId,
        // Store item-specific subtotal/total or leave as 0 if `totalAmt` is for the whole cart
        // For simplicity, let's use the cart's subTotalAmt and totalAmt for each order doc.
        // In a real scenario, you might want item.price * item.quantity here.
        subTotalAmt: item.price * item.quantity, // Amount for this specific item
        totalAmt: item.price * item.quantity,     // Amount for this specific item
        // The overall transaction amount is `totalAmt` from request.body
        paymentId: tx_ref, // Initially store the Flutterwave transaction reference
        payment_status: "pending", // Initial status
      });
    });

    const createdOrderDocs = await Promise.all(orderPromises);
    console.log(`Created ${createdOrderDocs.length} order documents for mainOrderId: ${mainOrderId}`);

    // Prepare payload for Flutterwave
    const payload = {
      tx_ref: tx_ref, // Use the generated tx_ref
      amount: totalAmt, // Total amount for the entire order (all list_items combined)
      currency: "UGX", // Ensure this is consistent with your system's currency
      redirect_url: `${process.env.FRONTEND_URL}/payment-status?tx_ref=${tx_ref}`, // Pass tx_ref for verification
      payment_options: "card,mobilemoneyuganda",
      customer: {
        email: user.email,
        phonenumber: user.mobile ? user.mobile.toString() : "N/A", // Ensure phonenumber is a string
        name: user.name || "Customer",
      },
      customizations: {
        title: "Fresh Katale",
        description: `Payment for Order ${mainOrderId}`,
      },
      meta: {
        mainOrderId: mainOrderId, // Important to match orders later
        userId: userId.toString(),
        // Potentially store totalAmt and currency here for initial verification
        expectedAmount: totalAmt,
        expectedCurrency: "UGX",
      },
    };

    const responseData = await flw.Payment.initiate(payload); // Use .initiate for consistency

    if (responseData && responseData.status === "success" && responseData.data && responseData.data.link) {
      // No need to update orders again here; paymentId already holds tx_ref
      return response.status(200).json({
        message: "Payment initiated successfully",
        success: true,
        error: false,
        data: responseData.data.link, // Flutterwave checkout link
        mainOrderId: mainOrderId, // Return your main order ID
        tx_ref: tx_ref // Return the Flutterwave reference
      });
    } else {
      // If Flutterwave initiation fails, mark all associated orders as 'failed'
      await Order.updateMany(
        { paymentId: tx_ref }, // Find by the tx_ref we stored
        { payment_status: "failed" }
      );
      return response.status(400).json({
        message: responseData.message || "Failed to initiate payment",
        error: true,
        success: false,
        flutterwaveResponse: responseData // Include Flutterwave's response for debugging
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


    const verifyResponse = await flw.Transaction.verify({ id: transaction_id });
    const paymentData = verifyResponse.data; // This is the actual transaction data from Flutterwave

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
            // You might want to store the full paymentData as well for auditing
          }
        );

        // --- FULFILLMENT LOGIC HERE ---
        // For example:
        // - Update inventory for each product in `pendingOrders`
        // - Send order confirmation emails to the user
        // - Add the mainOrderId to the user's `orderHistory` (if not done by reference)
        // You can use `user.orderHistory.push(firstOrder._id)` and `await user.save()`
        // Or better yet, loop through `pendingOrders` and add each `_id` to `user.orderHistory`

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
      .createHmac("sha256", process.env.FLW_SECRET_HASH) // set this in dashboard
      .update(JSON.stringify(request.body))
      .digest("hex");

    if (hash !== request.headers["verif-hash"]) {
      return response.status(401).json({ message: "Invalid signature" });
    }

    const event = request.body;
    console.log("Flutterwave Webhook Event:", event);

    if (event.event === "charge.completed") {
      const data = event.data;
      const { status, id, tx_ref, flw_ref, meta } = data;

      if (status === "successful") {
        // ✅ Update order(s) in DB
        await Order.updateMany(
          { orderId: meta.orderId },
          {
            payment_status: "paid",
            paymentId: id.toString(),
            invoice_receipt: flw_ref,
          }
        );
      } else {
        await Order.updateMany(
          { orderId: meta.orderId },
          { payment_status: "failed" }
        );
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
