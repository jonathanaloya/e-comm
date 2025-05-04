import { Router } from "express"
import { createProduct, deleteProductDetails, getProduct } from "../controllers/productController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { p } from "framer-motion/client"

const productRouter = Router()

productRouter.post('/create', authMiddleware, createProduct)

productRouter.post('/get', getProduct)

productRouter.delete('/delete', authMiddleware, deleteProductDetails)

export default productRouter