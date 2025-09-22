import SupportTicket from '../models/supportTicketModel.js'
import { sendSupportTicketEmail } from '../services/emailService.js'

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

        // Send email to admin
        try {
            await sendSupportTicketEmail(savedTicket)
        } catch (emailError) {
            console.error('Failed to send support ticket email:', emailError)
        }

        return response.json({
            message: "Support ticket created successfully",
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