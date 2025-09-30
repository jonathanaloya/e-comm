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
    calculateDeliveryFeeController // <<< NEW: Import delivery fee controller
} from '../controllers/orderController.js' // All from the same controller file now

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",authMiddleware, csrfProtection, CashOnDeliveryOrderController)
orderRouter.post('/checkout', paymentController)
orderRouter.get('/verify-payment',authMiddleware, verifyPaymentController)
// This endpoint requires a specific body-parser setup to get the raw body
orderRouter.post('/webhook', bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Store the raw body for signature verification
    }
}), async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET || process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash']; // Flutterwave webhook signature header

    console.log("Received Flutterwave webhook. Attempting verification...");

    // First, verify the webhook signature using the utility from orderController
    if (!signature || !verifyFlutterwaveWebhook(signature, secretHash, req.rawBody)) {
        console.warn('Invalid Flutterwave webhook signature received. Request rejected.');
        return res.status(401).send('Invalid webhook signature');
    }

    console.log('Flutterwave webhook signature verified successfully. Calling controller...');
    // If verification passes, pass control to the webhookFlutterwaveController
    await webhookFlutterwaveController(req, res); // Call your controller function
});

orderRouter.get("/order-list", getOrderDetailsController)
orderRouter.post("/calculate-delivery-fee", calculateDeliveryFeeController)

export default orderRouter
