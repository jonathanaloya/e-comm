import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe } from '../controllers/orderController.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",authMiddleware, CashOnDeliveryOrderController)
orderRouter.post('/checkout',authMiddleware,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",authMiddleware,getOrderDetailsController)

export default orderRouter