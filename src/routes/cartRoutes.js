import { Router } from "express"
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cartController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { csrfProtection } from "../middleware/csrfProtection.js"

const cartRouter = Router()

cartRouter.post('/create', authMiddleware, addToCartItemController)
cartRouter.get("/get", authMiddleware, getCartItemController)
cartRouter.put('/update-qty', authMiddleware, updateCartItemQtyController)
cartRouter.delete('/delete-cart-item', authMiddleware, deleteCartItemQtyController)

export default cartRouter