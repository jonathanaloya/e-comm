import { Router } from 'express'
import { createSupportTicket } from '../controllers/supportController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const supportRouter = Router()

supportRouter.post('/create-ticket', authMiddleware, createSupportTicket)

export default supportRouter