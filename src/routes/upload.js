import { Router } from 'express'
import uploadImageController from '../controllers/uploadImage.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { admin } from '../middleware/admin.js'
import upload from '../middleware/multer.js'

const uploadRouter = Router()

uploadRouter.post('/upload', authMiddleware, admin, upload.single('image'), uploadImageController)

export default uploadRouter