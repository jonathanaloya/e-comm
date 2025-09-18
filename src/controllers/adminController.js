import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import mongoose from "mongoose";

// Admin middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.userId; // from auth middleware
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        error: true,
        success: false
      });
    }
    
    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Admin verification failed",
      error: true,
      success: false
    });
  }
};

// Get admin dashboard statistics
export async function getAdminStats(request, response) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get various statistics
    const [
      totalOrders,
      todayOrders,
      monthlyOrders,
      yearlyOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfYear } }),
      User.countDocuments({ role: 'USER' }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { payment_status: { $in: ['successful', 'paid', 'CASH ON DELIVERY'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmt' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            payment_status: { $in: ['successful', 'paid', 'CASH ON DELIVERY'] },
            createdAt: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmt' } } }
      ]),
      Order.countDocuments({ order_status: { $in: ['pending', 'confirmed', 'processing'] } }),
      Order.countDocuments({ order_status: { $in: ['delivered'] } })
    ]);

    const stats = {
      orders: {
        total: totalOrders,
        today: todayOrders,
        monthly: monthlyOrders,
        yearly: yearlyOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      users: {
        total: totalUsers
      },
      products: {
        total: totalProducts
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      }
    };

    return response.json({
      message: "Admin statistics retrieved successfully",
      data: stats,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get admin statistics",
      error: true,
      success: false
    });
  }
}

// Get all orders with pagination and filters
export async function getAllOrders(request, response) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      payment_status,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = request.query;

    // Build filter query
    let filter = {};
    
    if (status) filter.order_status = status;
    if (payment_status) filter.payment_status = payment_status;
    
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { mainOrderId: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get orders with population
    const orders = await Order.find(filter)
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .populate('productId', 'name price image')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    return response.json({
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get orders",
      error: true,
      success: false
    });
  }
}

// Update order status
export async function updateOrderStatus(request, response) {
  try {
    const { orderId } = request.params;
    const { order_status, notes } = request.body;

    if (!order_status) {
      return response.status(400).json({
        message: "Order status is required",
        error: true,
        success: false
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
      return response.status(400).json({
        message: "Invalid order status",
        error: true,
        success: false
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        order_status,
        ...(notes && { notes })
      },
      { new: true }
    ).populate('userId', 'name email mobile')
     .populate('delivery_address');

    if (!updatedOrder) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Order status updated successfully",
      data: updatedOrder,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return response.status(500).json({
      message: error.message || "Failed to update order status",
      error: true,
      success: false
    });
  }
}

// Get single order details
export async function getOrderDetails(request, response) {
  try {
    const { orderId } = request.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .populate('productId');

    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Order details retrieved successfully",
      data: order,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get order details error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get order details",
      error: true,
      success: false
    });
  }
}

// Get all users
export async function getAllUsers(request, response) {
  try {
    const { page = 1, limit = 20, search, role, status } = request.query;

    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password -refresh_token -forgot_password_otp')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return response.json({
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get users",
      error: true,
      success: false
    });
  }
}

// Update user status or role
export async function updateUser(request, response) {
  try {
    const { userId } = request.params;
    const { status, role } = request.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -refresh_token -forgot_password_otp');

    if (!updatedUser) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "User updated successfully",
      data: updatedUser,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Update user error:', error);
    return response.status(500).json({
      message: error.message || "Failed to update user",
      error: true,
      success: false
    });
  }
}

// Get sales analytics
export async function getSalesAnalytics(request, response) {
  try {
    const { period = 'month' } = request.query; // day, week, month, year

    let groupBy, dateRange;
    const now = new Date();

    switch (period) {
      case 'day':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'week':
        groupBy = { $week: "$createdAt" };
        dateRange = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        break;
      case 'month':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateRange = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        break;
      case 'year':
        groupBy = { $year: "$createdAt" };
        dateRange = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateRange = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange },
          payment_status: { $in: ['successful', 'paid', 'CASH ON DELIVERY'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmt' },
          orderCount: { $sum: 1 },
          deliveryFees: { $sum: '$deliveryFee' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return response.json({
      message: "Sales analytics retrieved successfully",
      data: {
        period,
        analytics: salesData
      },
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Sales analytics error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get sales analytics",
      error: true,
      success: false
    });
  }
}