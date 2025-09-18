import { Router } from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  addTicketMessage,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  addInternalNote,
  submitTicketFeedback,
  getSupportStats,
  getSupportCategories
} from '../controllers/supportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { admin } from '../middleware/admin.js';

const supportRouter = Router();

// Public routes
supportRouter.get('/categories', getSupportCategories);

// Authenticated user routes
supportRouter.use(authMiddleware); // Apply auth to all routes below

supportRouter.post('/tickets', createSupportTicket);
supportRouter.get('/tickets', getSupportTickets);
supportRouter.get('/tickets/:ticketId', getSupportTicket);
supportRouter.post('/tickets/:ticketId/messages', addTicketMessage);
supportRouter.post('/tickets/:ticketId/feedback', submitTicketFeedback);

// Admin only routes
supportRouter.put('/tickets/:ticketId/status', admin, updateTicketStatus);
supportRouter.put('/tickets/:ticketId/assign', admin, assignTicket);
supportRouter.put('/tickets/:ticketId/priority', admin, updateTicketPriority);
supportRouter.post('/tickets/:ticketId/notes', admin, addInternalNote);
supportRouter.get('/stats', admin, getSupportStats);

export default supportRouter;