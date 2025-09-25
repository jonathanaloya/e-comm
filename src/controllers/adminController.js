import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// Get all orders for admin
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email mobile')
            .populate('delivery_address')
            .sort({ createdAt: -1 });

        return res.json({
            message: "Orders fetched successfully",
            data: orders,
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

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { 
                order_status: status,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email mobile');

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
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