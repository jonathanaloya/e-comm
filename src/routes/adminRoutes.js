import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'

const adminRouter = Router()

// Admin login endpoint
adminRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        error: true,
        success: false
      })
    }

    const user = await User.findOne({ email })
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        message: 'Invalid admin credentials',
        error: true,
        success: false
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid admin credentials',
        error: true,
        success: false
      })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY_ACCESS_TOKEN,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Admin login successful',
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

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

// Alternative endpoint for all-orders
adminRouter.get('/all-orders', async (req, res) => {
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

// Get all users for admin
adminRouter.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -refresh_token')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      message: 'Users fetched successfully',
      success: true,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

// Get all products for admin
adminRouter.get('/all-products', async (req, res) => {
  try {
    const Product = (await import('../models/productModel.js')).default
    const products = await Product.find({})
      .populate('category')
      .populate('subCategory')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      message: 'Products fetched successfully',
      success: true,
      data: products
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

// Get notifications for admin (with category filter)
adminRouter.get('/notifications', async (req, res) => {
  try {
    const { type, limit = 50 } = req.query
    const Notification = (await import('../models/notificationModel.js')).default
    
    const query = type ? { type } : {}
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Get counts by category
    const counts = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } } } }
    ])

    const categoryCounts = {
      signup: { total: 0, unread: 0 },
      order: { total: 0, unread: 0 },
      support: { total: 0, unread: 0 }
    }

    counts.forEach(item => {
      if (categoryCounts[item._id]) {
        categoryCounts[item._id] = { total: item.count, unread: item.unread }
      }
    })

    res.json({
      message: 'Notifications fetched successfully',
      success: true,
      data: {
        notifications: notifications || [],
        categories: categoryCounts,
        total: notifications.length
      }
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
    await Notification.findByIdAndUpdate(req.params.id, { 
      read: true, 
      readAt: new Date() 
    })

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

// Mark all notifications as read for a category
adminRouter.patch('/notifications/mark-all-read', async (req, res) => {
  try {
    const { type } = req.body
    const Notification = (await import('../models/notificationModel.js')).default
    
    const query = type ? { type, read: false } : { read: false }
    await Notification.updateMany(query, { 
      read: true, 
      readAt: new Date() 
    })

    res.json({
      message: `All ${type || ''} notifications marked as read`,
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