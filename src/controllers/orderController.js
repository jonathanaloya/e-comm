import flutterwaveInstance from "../config/flutterwave.js";
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

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body 

        const user = await User.findById(userId)

        if (!user) {
            return response.status(404).json({
                message: "User not found.",
                error: true,
                success: false
            });
        }

        const transaction_id = uuidv4(); // Generate a unique transaction ID

        const amount = totalAmt; 

        // Pass original list_items for the webhook to reconstruct the order
        const meta = {
            userId: userId,
            addressId: addressId,
            // <<< IMPORTANT: Storing the full list_items for webhook to use
            // Ensure this doesn't exceed Flutterwave's metadata size limits if list_items can be very large.
            order_items_summary: list_items.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                image: item.productId.image, // Include image for order reconstruction
                quantity: item.quantity,
                price: item.productId.price, // Store original price for calculation at webhook
                discount: item.productId.discount // Store discount for calculation at webhook
            }))
        };

        const payload = {
            tx_ref: transaction_id, 
            amount: amount,
            currency: 'UGX', 
            redirect_url: `${process.env.FRONTEND_URL}/success`, 
            customer: {
                email: user.email,
                mobile: user.mobile || 'N/A', 
                name: user.name || 'Customer' 
            },
            customizations: {
                title: 'Fresh Katale',
                description: 'Payment for your order',
            },
            meta: meta,
            
            payment_options: 'card, mobilemoney'
        };

        const responseData = await flutterwaveInstance.Payment.create(payload);

        if (responseData && responseData.status === 'success') {
            return response.status(200).json({
                message: 'Payment initiated successfully',
                success: true,
                error: false,
                data: responseData.data.link 
            });
        } else {
            return response.status(400).json({
                message: responseData.message || 'Failed to initiate payment',
                error: true,
                success: false
            });
        }

    } catch (error) {
        console.error("Payment initiation error:", error);
        return response.status(500).json({
            message: error.message || 'An unexpected error occurred',
            error: true,
            success: false
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
    // Note: Raw body is captured by bodyParser in the route file and passed on req.rawBody.
    // Signature verification is also done in the route file before this controller is called.

    const payload = request.body;
    console.log(`Processing Flutterwave event in webhookFlutterwaveController: ${payload.event}, Status: ${payload.data?.status}, Tx_Ref: ${payload.data?.tx_ref}`);

    if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
        try {
            const transactionDetails = payload.data;
            const tx_ref = transactionDetails.tx_ref; 
            const flutterwavePaymentId = transactionDetails.id; 
            const paymentStatus = transactionDetails.status; 
            const totalAmountPaid = transactionDetails.amount; 
            const currency = transactionDetails.currency; 

            const userId = transactionDetails.meta?.userId;
            const addressId = transactionDetails.meta?.addressId;
            const originalListItems = transactionDetails.meta?.order_items_summary; // This is the key!

            if (!userId || !addressId || !originalListItems || originalListItems.length === 0) {
                console.error(`Missing critical metadata in Flutterwave webhook for tx_ref ${tx_ref}. userId: ${userId}, addressId: ${addressId}, originalListItems present: ${Boolean(originalListItems)}`);
                return response.status(200).send('Webhook Received, but essential data missing for order creation.');
            }

            const existingOrder = await Order.findOne({ tx_ref: tx_ref });
            if (existingOrder) {
                console.warn(`Order with tx_ref ${tx_ref} already exists. Skipping duplicate processing.`);
                return response.status(200).send('Order already processed');
            }

            // Use the now-exported getOrderProductItems function
            const orderProduct = await getOrderProductItems({
                originalListItems: originalListItems,
                userId: userId,
                addressId: addressId,
                paymentId: flutterwavePaymentId,
                payment_status: paymentStatus,
            });

            const newOrder = new Order({
                userId: userId,
                paymentId: flutterwavePaymentId,
                tx_ref: tx_ref,
                totalAmount: totalAmountPaid,
                currency: currency,
                items: orderProduct,
                deliveryAddress: addressId,
                status: 'completed',
                paymentDetails: transactionDetails,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await newOrder.save();
            console.log(`New Order ${newOrder._id} created successfully for tx_ref: ${tx_ref}`);

            const userUpdateResult = await User.findByIdAndUpdate(userId, {
                $set: { shopping_cart: [] }
            }, { new: true });
            console.log(`User ${userId} cart updated:`, userUpdateResult ? 'success' : 'failed');

            const cartDeleteResult = await Cart.deleteMany({ userId: userId });
            console.log(`Deleted ${cartDeleteResult.deletedCount} cart items for user ${userId}.`);

            response.status(200).send('Webhook received and order processed.');

        } catch (error) {
            console.error(`Error processing Flutterwave 'charge.completed' webhook for tx_ref ${payload.data?.tx_ref}:`, error);
            response.status(200).send('Webhook received, but internal error occurred.');
        }
    } else {
        console.log(`Unhandled Flutterwave event type or status: ${payload.event}, status: ${payload.data?.status}`);
        response.status(200).send('Webhook received, no action taken for this event type/status.');
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