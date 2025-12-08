import { Router } from "express"
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cartController.js"
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js"
import { csrfProtection } from "../middleware/csrfProtection.js"

const cartRouter = Router()

cartRouter.post('/create', optionalAuthMiddleware, addToCartItemController)
cartRouter.get("/get", optionalAuthMiddleware, getCartItemController)
cartRouter.put('/update-qty', optionalAuthMiddleware, updateCartItemQtyController)
cartRouter.delete('/delete-cart-item', optionalAuthMiddleware, deleteCartItemQtyController)

export default cartRouter