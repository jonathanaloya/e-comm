import flw from "../config/flutterwave.js";
import Cart from "../models/cartProductModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'; // <<< NEW: Import crypto for webhook verification

// Utility function for Flutterwave webhook signature verification
// <<< NEW: This function is now part of orderController.js
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
    const userId = request.userId; // from auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    const orderId = uuidv4(); // unique order ID
    const tx_ref = uuidv4(); // Flutterwave transaction reference

    // Create Order(s) in DB (one per product)
    const orderDocs = await Promise.all(
  list_items.map((item) =>
    Order.create({
      userId,
      orderId,
      productId: item.productId._id,
      product_details: {
        name: item.productId.name,
        image: Array.isArray(item.productId.image) 
                  ? item.productId.image 
                  : [item.productId.image],
      },
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
      payment_status: "pending",
    })
  )
    );


    // Prepare payload for Flutterwave
    const payload = {
      tx_ref,
      amount: totalAmt,
      currency: "UGX",
      redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
      payment_options: "card, mobilemoneyuganda",
      customer: {
        email: user.email,
        phonenumber: user.mobile || "N/A",
        name: user.name || "Customer",
      },
      customizations: {
        title: "Fresh Katale",
        description: "Payment for your order",
      },
      meta: {
        orderId, // important to match orders later
        userId,
      },
    };

    const responseData = await flw.Payment.create(payload);

    if (responseData && responseData.status === "success") {
      return response.status(200).json({
        message: "Payment initiated successfully",
        success: true,
        error: false,
        data: responseData.data.link, // Flutterwave checkout link
      });
    } else {
      return response.status(400).json({
        message: responseData.message || "Failed to initiate payment",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return response.status(500).json({
      message: error.message || "An unexpected error occurred",
      error: true,
      success: false,
    });
  }
}

export async function verifyPaymentController(request, response) {
  try {
    const { transaction_id } = request.body;
    if (!transaction_id) {
      return response.status(400).json({
        message: "Transaction ID is required",
        success: false,
        error: true,
      });
    }

    const verifyResponse = await flw.Transaction.verify({ id: transaction_id });

    const paymentData = verifyResponse.data;
    const { status, amount, currency, tx_ref, id } = paymentData;

    if (status === "successful") {
      // Update all orders with this tx_ref
      await Order.updateMany(
        { orderId: paymentData.meta.orderId },
        {
          payment_status: "paid",
          paymentId: id.toString(),
          invoice_receipt: paymentData.flw_ref,
        }
      );

      return response.status(200).json({
        message: "Payment verified successfully",
        success: true,
        error: false,
        data: paymentData,
      });
    } else {
      // Mark as failed
      await Order.updateMany(
        { orderId: paymentData.meta.orderId },
        { payment_status: "failed" }
      );

      return response.status(400).json({
        message: "Payment verification failed",
        success: false,
        error: true,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return response.status(500).json({
      message: error.message || "An unexpected error occurred",
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
    // ✅ Verify request signature
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
