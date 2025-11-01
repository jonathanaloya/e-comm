import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Notification from "../models/notificationModel.js";
import bcrypt from 'bcryptjs';
import generateAccessToken from '../utilities/generateAccessToken.js';
import generateRefreshToken from '../utilities/generateRefreshToken.js';
import verifyRecaptcha from '../utilities/verifyRecaptcha.js';

// Admin login with reCAPTCHA
export const adminLoginController = async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                error: true,
                success: false
            });
        }

        if (!recaptchaToken) {
            return res.status(400).json({
                message: "reCAPTCHA verification is required",
                error: true,
                success: false
            });
        }

        // Verify reCAPTCHA
        const recaptchaResult = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaResult.success) {
            return res.status(400).json({
                message: 'reCAPTCHA verification failed. Please try again.',
                error: true,
                success: false,
                recaptchaErrors: recaptchaResult['error-codes']
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials',
                error: true,
                success: false
            });
        }

        if (user.status !== 'Active') {
            return res.status(400).json({
                message: 'Account is not active',
                error: true,
                success: false
            });
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            return res.status(400).json({
                message: 'Invalid credentials',
                error: true,
                success: false
            });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. This portal is for administrators only. Please use the main website for customer access.',
                error: true,
                success: false,
                adminOnly: true
            });
        }

        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        await User.findByIdAndUpdate(user._id, {
            last_login_date: Date.now(),
            refresh_token: refreshToken
        });

        const cookiesOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };

        res.cookie('accessToken', accessToken, cookiesOption);
        res.cookie('refreshToken', refreshToken, cookiesOption);

        return res.json({
            message: 'Admin login successful',
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get all orders for admin
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email mobile')
            .populate('delivery_address')
            .populate('items.productId', 'name price image category')
            .sort({ createdAt: -1 });

        // Group orders by mainOrderId for better display
        const groupedOrders = {};
        const ungroupedOrders = [];

        orders.forEach((order) => {
            if (order.mainOrderId) {
                if (!groupedOrders[order.mainOrderId]) {
                    groupedOrders[order.mainOrderId] = {
                        mainOrderId: order.mainOrderId,
                        createdAt: order.createdAt,
                        payment_status: order.payment_status,
                        order_status: order.order_status,
                        delivery_address: order.delivery_address,
                        paymentId: order.paymentId,
                        userId: order.userId,
                        items: [],
                        totalAmount: 0,
                        deliveryFee: order.deliveryFee || 0,
                    };
                }
                // Push each product in order.items to the grouped items array
                if (Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        groupedOrders[order.mainOrderId].items.push({
                            ...item._doc,
                            price: item.price ?? item.itemTotal / (item.quantity || 1),
                            itemTotal: item.itemTotal ?? item.price * item.quantity,
                        });
                        groupedOrders[order.mainOrderId].totalAmount +=
                            item.itemTotal || item.price * item.quantity || 0;
                    });
                }
            } else {
                ungroupedOrders.push(order);
            }
        });

        const formattedOrders = {
            groupedOrders: Object.values(groupedOrders),
            individualOrders: ungroupedOrders,
            totalOrders: orders.length,
        };

        return res.json({
            message: "Orders fetched successfully",
            data: formattedOrders,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update order status
export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                message: "Order ID and status are required",
                error: true,
                success: false
            });
        }

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                error: true,
                success: false
            });
        }

        // Find the order first to get user and address info for email
        const order = await Order.findById(orderId).populate('userId', 'name email mobile').populate('delivery_address');
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                order_status: status,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email mobile');

        // Send status update email to customer
        try {
            const { sendOrderStatusUpdateEmail } = await import("../services/emailService.js");
            await sendOrderStatusUpdateEmail(order, order.userId, status);
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // Don't fail the status update if email fails
        }

        return res.json({
            message: "Order status updated successfully",
            data: updatedOrder,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get all users for admin
export const getAllUsersController = async (req, res) => {
    try {
        const users = await User.find({}, '-password -refreshToken')
            .sort({ createdAt: -1 });

        return res.json({
            message: "Users fetched successfully",
            data: users,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get order tracking info
export const getOrderTrackingController = async (req, res) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
                error: true,
                success: false
            });
        }

        const order = await Order.findOne({ orderId: orderId })
            .populate('userId', 'name email mobile')
            .populate('delivery_address');

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Order tracking info fetched successfully",
            data: order,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get all notifications for admin
export const getNotificationsController = async (req, res) => {
    try {
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json({
            message: "Notifications fetched successfully",
            data: notifications,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Mark notification as read
export const markNotificationAsReadController = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Notification marked as read",
            data: notification,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Delete notification
export const deleteNotificationController = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Notification deleted successfully",
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};