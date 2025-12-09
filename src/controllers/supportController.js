import SupportTicket from '../models/supportTicketModel.js'
import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'
import { sendSupportTicketEmail, sendSupportTicketReplyEmail } from '../services/emailService.js'

export const createSupportTicket = async (request, response) => {
    try {
        const { name, email, subject, message, priority = 'medium' } = request.body
        const userId = request.userId ? request.userId : null

        if (!name || !email || !subject || !message) {
            return response.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            })
        }

        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        const ticket = new SupportTicket({
            ticketId,
            userId,
            name,
            email,
            subject,
            message,
            priority
        })

        const savedTicket = await ticket.save()

        // Create notification for admin
        try {
            const notification = new Notification({
                type: 'support',
                title: `New Support Ticket: ${subject}`,
                message: `${name} (${email}) submitted a ${priority} priority support ticket: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                priority: priority,
                data: {
                    ticketId: savedTicket.ticketId,
                    userId: userId,
                    email: email
                }
            })
            await notification.save()
        } catch (notificationError) {
            console.error('Failed to create notification:', notificationError)
        }

        // Send confirmation email to user
        try {
            await sendSupportTicketEmail(savedTicket, 'user')
        } catch (emailError) {
            console.error('Failed to send user confirmation email:', emailError)
        }

        // Send notification email to admin
        try {
            await sendSupportTicketEmail(savedTicket, 'admin')
        } catch (emailError) {
            console.error('Failed to send admin notification email:', emailError)
        }

        return response.json({
            message: "Support ticket created successfully. You will receive a confirmation email and our team will respond shortly.",
            error: false,
            success: true,
            data: {
                ticketId: savedTicket.ticketId,
                status: savedTicket.status
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Reply to support ticket
export const replyToSupportTicket = async (request, response) => {
    try {
        const { ticketId, message } = request.body
        const adminId = request.userId

        if (!ticketId || !message) {
            return response.status(400).json({
                message: "Ticket ID and message are required",
                error: true,
                success: false
            })
        }

        // Get admin details
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Admin access required",
                error: true,
                success: false
            })
        }

        // Find and update ticket
        const ticket = await SupportTicket.findOne({ ticketId })
        if (!ticket) {
            return response.status(404).json({
                message: "Support ticket not found",
                error: true,
                success: false
            })
        }

        // Add response to ticket
        const newResponse = {
            adminId: admin._id,
            adminName: admin.name,
            message: message,
            createdAt: new Date(),
            readByUser: false
        }

        ticket.responses.push(newResponse)
        ticket.unreadRepliesCount = (ticket.unreadRepliesCount || 0) + 1
        await ticket.save()

        // Create notification for user if they have an account
        if (ticket.userId) {
            try {
                const notification = new Notification({
                    userId: ticket.userId,
                    type: 'support_reply',
                    title: `Reply to Support Ticket #${ticket.ticketId}`,
                    message: `Admin ${admin.name} replied to your support ticket: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                    data: {
                        ticketId: ticket.ticketId,
                        adminName: admin.name
                    }
                })
                await notification.save()
            } catch (notificationError) {
                console.error('Failed to create user notification:', notificationError)
            }
        }

        // Send email to user
        try {
            await sendSupportTicketReplyEmail(ticket, newResponse)
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError)
        }

        return response.json({
            message: "Reply sent successfully",
            error: false,
            success: true,
            data: {
                ticketId: ticket.ticketId,
                response: newResponse
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get support ticket details (for admin)
export const getSupportTicketDetails = async (request, response) => {
    try {
        const { ticketId } = request.params
        const adminId = request.userId

        // Verify admin access
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Admin access required",
                error: true,
                success: false
            })
        }

        const ticket = await SupportTicket.findOne({ ticketId }).populate('userId', 'name email')
        if (!ticket) {
            return response.status(404).json({
                message: "Support ticket not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "Ticket details retrieved successfully",
            error: false,
            success: true,
            data: ticket
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get all support tickets (for admin)
export const getAllSupportTickets = async (request, response) => {
    try {
        const adminId = request.userId
        const { status, page = 1, limit = 10 } = request.query

        // Verify admin access
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Admin access required",
                error: true,
                success: false
            })
        }

        const query = status ? { status } : {}
        const skip = (page - 1) * limit

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')

        const total = await SupportTicket.countDocuments(query)

        return response.json({
            message: "Support tickets retrieved successfully",
            error: false,
            success: true,
            data: {
                tickets,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalTickets: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Update support ticket status
export const updateSupportTicketStatus = async (request, response) => {
    try {
        const { ticketId, status } = request.body
        const adminId = request.userId

        if (!ticketId || !status) {
            return response.status(400).json({
                message: "Ticket ID and status are required",
                error: true,
                success: false
            })
        }

        // Verify admin access
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Admin access required",
                error: true,
                success: false
            })
        }

        const validStatuses = ['open', 'in-progress', 'resolved', 'closed']
        if (!validStatuses.includes(status)) {
            return response.status(400).json({
                message: "Invalid status. Must be one of: " + validStatuses.join(', '),
                error: true,
                success: false
            })
        }

        const ticket = await SupportTicket.findOneAndUpdate(
            { ticketId },
            { status },
            { new: true }
        )

        if (!ticket) {
            return response.status(404).json({
                message: "Support ticket not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: `Ticket status updated to ${status}`,
            error: false,
            success: true,
            data: ticket
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get user support tickets (for logged-in users)
export const getUserSupportTickets = async (request, response) => {
    try {
        const userId = request.userId
        const { page = 1, limit = 10, status } = request.query

        if (!userId) {
            return response.status(401).json({
                message: "Authentication required",
                error: true,
                success: false
            })
        }

        const query = { userId: userId }
        if (status) {
            query.status = status
        }

        const skip = (page - 1) * limit

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('ticketId subject status priority createdAt updatedAt responses unreadRepliesCount')

        const total = await SupportTicket.countDocuments(query)

        return response.json({
            message: "User support tickets retrieved successfully",
            error: false,
            success: true,
            data: {
                tickets,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalTickets: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get user support ticket details (for logged-in users)
export const getUserSupportTicketDetails = async (request, response) => {
    try {
        const userId = request.userId
        const { ticketId } = request.params

        const ticket = await SupportTicket.findOne({ ticketId, userId })
            .populate('userId', 'name email')

        if (!ticket) {
            return response.status(404).json({
                message: "Support ticket not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "Ticket details retrieved successfully",
            error: false,
            success: true,
            data: ticket
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Mark ticket replies as read
export const markTicketRepliesAsRead = async (request, response) => {
    try {
        const userId = request.userId
        const { ticketId } = request.params

        const ticket = await SupportTicket.findOne({ ticketId, userId })
        if (!ticket) {
            return response.status(404).json({
                message: "Support ticket not found",
                error: true,
                success: false
            })
        }

        ticket.responses.forEach(response => {
            response.readByUser = true
        })
        ticket.unreadRepliesCount = 0
        await ticket.save()

        return response.json({
            message: "Ticket replies marked as read",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get unread replies count for user
export const getUnreadRepliesCount = async (request, response) => {
    try {
        const userId = request.userId
        console.log('Getting unread count for userId:', userId);

        if (!userId) {
            return response.status(401).json({
                message: "Authentication required",
                error: true,
                success: false
            })
        }

        const totalUnreadReplies = await SupportTicket.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, totalUnread: { $sum: "$unreadRepliesCount" } } }
        ])

        console.log('Aggregation result:', totalUnreadReplies);
        const count = totalUnreadReplies.length > 0 ? totalUnreadReplies[0].totalUnread : 0
        console.log('Final unread count:', count);

        return response.json({
            message: "Unread replies count retrieved successfully",
            error: false,
            success: true,
            data: { unreadCount: count }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}