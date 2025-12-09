import { Router } from 'express'
import {
    createSupportTicket,
    replyToSupportTicket,
    getSupportTicketDetails,
    getAllSupportTickets,
    updateSupportTicketStatus,
    getUserSupportTickets,
    getUserSupportTicketDetails,
    markTicketRepliesAsRead,
    getUnreadRepliesCount
} from '../controllers/supportController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { admin } from '../middleware/admin.js'

const supportRouter = Router()

// Public routes
supportRouter.post('/create-ticket', createSupportTicket)

// User routes
supportRouter.get('/my-tickets', authMiddleware, getUserSupportTickets)
supportRouter.get('/my-tickets/:ticketId', authMiddleware, getUserSupportTicketDetails)
supportRouter.put('/my-tickets/:ticketId/mark-read', authMiddleware, markTicketRepliesAsRead)
supportRouter.get('/unread-count', authMiddleware, getUnreadRepliesCount)

// Admin routes
supportRouter.get('/tickets', authMiddleware, admin, getAllSupportTickets)
supportRouter.get('/tickets/:ticketId', authMiddleware, admin, getSupportTicketDetails)
supportRouter.post('/reply', authMiddleware, admin, replyToSupportTicket)
supportRouter.put('/status', authMiddleware, admin, updateSupportTicketStatus)

export default supportRouter