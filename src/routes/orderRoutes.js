import { Router } from 'express'
import bodyParser from 'body-parser'
import authMiddleware from '../middleware/authMiddleware.js'
import { csrfProtection } from '../middleware/csrfProtection.js'
import {
    CashOnDeliveryOrderController,
    getOrderDetailsController,
    paymentController,
    // webhookStripe, // <<< REMOVED: Stripe webhook is gone
    verifyPaymentController,
    webhookFlutterwaveController, // <<< NEW: Import the Flutterwave webhook controller
    verifyFlutterwaveWebhook, // <<< NEW: Import the verification utility
    calculateDeliveryFeeController, // <<< NEW: Import delivery fee controller
    sendOrderNotificationController // <<< NEW: Import admin email notification controller
} from '../controllers/orderController.js' // All from the same controller file now

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",authMiddleware, CashOnDeliveryOrderController)
orderRouter.post('/checkout', authMiddleware, paymentController)
orderRouter.get('/verify-payment',authMiddleware, verifyPaymentController)
// This endpoint requires a specific body-parser setup to get the raw body
orderRouter.post('/webhook', bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Store the raw body for signature verification
    }
}), async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET || process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash']; // Flutterwave webhook signature header

    // First, verify the webhook signature using the utility from orderController
    if (!signature || !verifyFlutterwaveWebhook(signature, secretHash, req.rawBody)) {
        return res.status(401).send('Invalid webhook signature');
    }
    // If verification passes, pass control to the webhookFlutterwaveController
    await webhookFlutterwaveController(req, res); // Call your controller function
});

orderRouter.get("/order-list", authMiddleware, getOrderDetailsController)
orderRouter.post("/calculate-delivery-fee", calculateDeliveryFeeController)
orderRouter.get("/tracking/:orderId", authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const orderModel = (await import('../models/orderModel.js')).default;
        
        // Search by orderId field, not _id
        const order = await orderModel.findOne({ orderId: orderId })
            .populate('userId', 'name email mobile')
            .populate('delivery_address');
            
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }
        
        res.json({
            message: "Order found",
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
})

// Admin endpoint to send order notification email
orderRouter.post("/admin/send-notification", sendOrderNotificationController)

export default orderRouter
