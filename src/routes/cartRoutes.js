import { Router } from "express"
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cartController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { csrfProtection } from "../middleware/csrfProtection.js"

const cartRouter = Router()

cartRouter.post('/create', csrfProtection, addToCartItemController)
cartRouter.get("/get",authMiddleware,getCartItemController)
cartRouter.put('/update-qty',authMiddleware, csrfProtection, updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',authMiddleware, csrfProtection, deleteCartItemQtyController)

export default cartRouter