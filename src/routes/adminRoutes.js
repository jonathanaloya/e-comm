import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import { sendOrderStatusUpdateEmail, sendAdminOrderResponseEmail } from '../services/emailService.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { admin } from '../middleware/admin.js'

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
adminRouter.get('/notifications', authMiddleware, admin, async (req, res) => {
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
      data: notifications || [],
      categories: categoryCounts,
      total: notifications.length
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
adminRouter.patch('/notifications/:id/read', authMiddleware, admin, async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required',
        error: true,
        success: false
      })
    }

    const Notification = (await import('../models/notificationModel.js')).default
    const notification = await Notification.findByIdAndUpdate(id, { 
      read: true, 
      readAt: new Date() 
    }, { new: true })

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        error: true,
        success: false
      })
    }

    res.json({
      message: 'Notification marked as read',
      success: true,
      data: notification
    })
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to mark notification as read',
      error: true,
      success: false
    })
  }
})

// Mark all notifications as read for a category
adminRouter.patch('/notifications/mark-all-read', authMiddleware, admin, async (req, res) => {
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

// Update order status and send email notification
adminRouter.patch('/orders/:orderId/status', authMiddleware, admin, async (req, res) => {
  try {
    const { orderId } = req.params
    const { status, adminMessage } = req.body

    if (!status) {
      return res.status(400).json({
        message: 'Status is required',
        error: true,
        success: false
      })
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        error: true,
        success: false
      })
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('delivery_address')
      .populate('items.productId', 'name price')

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false
      })
    }

    // Update order status
    order.order_status = status
    await order.save()

    // Send email notification to user
    if (order.userId && order.userId.email) {
      try {
        console.log('Sending status update email for order:', order._id)
        const emailResult = await sendOrderStatusUpdateEmail(order, order.userId, status)
        console.log('Email result:', emailResult)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
      }
    } else {
      console.log('No user email found for order:', order._id)
    }

    // Add admin message if provided
    if (adminMessage) {
      const adminUser = await User.findById(req.userId || req.user?.userId)
      order.admin_responses.push({
        adminId: adminUser?._id,
        adminName: adminUser?.name || 'Admin',
        message: adminMessage
      })
      await order.save()
    }

    res.json({
      message: 'Order status updated successfully',
      success: true,
      data: {
        orderId: order._id,
        status: order.order_status,
        adminMessage: adminMessage || null
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

// Add admin response to order
adminRouter.post('/orders/:orderId/response', authMiddleware, admin, async (req, res) => {
  try {
    const { orderId } = req.params
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: 'Response message is required',
        error: true,
        success: false
      })
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('delivery_address')

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false
      })
    }

    // Get admin user info
    const adminUser = await User.findById(req.userId || req.user?.userId)
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false
      })
    }

    // Add admin response
    const response = {
      adminId: adminUser._id,
      adminName: adminUser.name,
      message: message.trim(),
      createdAt: new Date()
    }

    order.admin_responses.push(response)
    await order.save()

    // Send email notification to user
    if (order.userId && order.userId.email) {
      try {
        await sendAdminOrderResponseEmail(order, order.userId, response)
      } catch (emailError) {
        console.error('Failed to send response email:', emailError)
      }
    }

    res.json({
      message: 'Response added successfully',
      success: true,
      data: {
        orderId: order._id,
        response: response
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

// Get order details with responses
adminRouter.get('/orders/:orderId', authMiddleware, admin, async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .populate('admin_responses.adminId', 'name email')

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false
      })
    }

    res.json({
      message: 'Order details fetched successfully',
      success: true,
      data: order
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    })
  }
})

// Test email configuration
adminRouter.post('/test-email', authMiddleware, admin, async (req, res) => {
  try {
    const { testEmailService } = await import('../services/emailService.js')
    const { email = process.env.EMAIL_USER } = req.body

    console.log('Testing email configuration:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      testEmail: email
    })

    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Test connection
    await transporter.verify()
    console.log('SMTP connection verified successfully')

    // Send test email
    const testResult = await transporter.sendMail({
      from: `"Fresh Katale Test" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Configuration Test - Fresh Katale',
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>From: Fresh Katale Admin System</p>
      `
    })

    res.json({
      message: 'Test email sent successfully',
      success: true,
      data: {
        messageId: testResult.messageId,
        testEmail: email
      }
    })
  } catch (error) {
    console.error('Email test failed:', error)
    res.status(500).json({
      message: 'Email test failed: ' + error.message,
      error: true,
      success: false,
      details: {
        errorType: error.name,
        errorCode: error.code,
        command: error.command
      }
    })
  }
})

export default adminRouter