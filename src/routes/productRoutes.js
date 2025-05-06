import { Router } from "express"
import { createProduct, deleteProductDetails, getProduct, getProductByCategory, getProductByCategoryAndSubCategory, getProductDetails, updateProductDetails } from "../controllers/productController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { p } from "framer-motion/client"

const productRouter = Router()

productRouter.post('/create', authMiddleware, createProduct)

productRouter.post('/get', getProduct)

productRouter.post("/get-product-by-category",getProductByCategory)
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details',getProductDetails)

productRouter.delete('/delete', authMiddleware, deleteProductDetails)

productRouter.put('/update', authMiddleware, updateProductDetails)

export default productRouter