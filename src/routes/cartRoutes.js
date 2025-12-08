import { Router } from "express"
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cartController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { csrfProtection } from "../middleware/csrfProtection.js"

const cartRouter = Router()

cartRouter.post('/create', addToCartItemController)
cartRouter.get("/get", getCartItemController)
cartRouter.put('/update-qty', updateCartItemQtyController)
cartRouter.delete('/delete-cart-item', deleteCartItemQtyController)

export default cartRouter