import { Router } from "express"
import { createProduct, deleteProductDetails, getProduct, getProductByCategory, getProductByCategoryAndSubCategory, getProductDetails, searchProduct, updateProductDetails } from "../controllers/productController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { admin } from '../middleware/admin.js'
import { csrfProtection } from '../middleware/csrfProtection.js'

const productRouter = Router()

productRouter.post('/create', authMiddleware, admin, csrfProtection, createProduct)

productRouter.post('/get', getProduct)

productRouter.post("/get-product-by-category",getProductByCategory)
productRouter.post('/get-product-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details',getProductDetails)

productRouter.delete('/delete', authMiddleware, admin, csrfProtection, deleteProductDetails)

productRouter.put('/update', authMiddleware, admin, csrfProtection, updateProductDetails)

productRouter.post('/search', searchProduct)

export default productRouter