import SupportTicket from '../models/supportTicketModel.js'
import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'
import { sendSupportTicketEmail, sendSupportTicketReplyEmail } from '../services/emailService.js'

export const createSupportTicket = async (request, response) => {
    try {
        const { name, email, subject, message, priority = 'medium' } = request.body
        const userId = request.userId || null

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
            createdAt: new Date()
        }

        ticket.responses.push(newResponse)
        await ticket.save()

        // Send email to user
        try {
            await sendSupportTicketEmail(ticket, 'reply')
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

        const query = { userId }
        if (status) {
            query.status = status
        }

        const skip = (page - 1) * limit

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('ticketId subject status priority createdAt updatedAt responses')

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