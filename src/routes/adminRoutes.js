import { Router } from 'express'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'

const adminRouter = Router()

// Get all orders for admin
adminRouter.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      message: 'Orders fetched successfully',
      success: true,
      data: orders
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

// Get notifications for admin
adminRouter.get('/notifications', async (req, res) => {
  try {
    const Notification = (await import('../models/notificationModel.js')).default
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({
      message: 'Notifications fetched successfully',
      success: true,
      data: notifications
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

// Mark notification as read
adminRouter.patch('/notifications/:id/read', async (req, res) => {
  try {
    const Notification = (await import('../models/notificationModel.js')).default
    await Notification.findByIdAndUpdate(req.params.id, { read: true })

    res.json({
      message: 'Notification marked as read',
      success: true
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

export default adminRouter