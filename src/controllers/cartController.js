import Cart from "../models/cartProductModel.js";
import User from "../models/userModel.js";

export const addToCartItemController = async(req,res)=>{
    try {
        const userId = req.userId // May be undefined for guest users
        const { productId } = req.body
        
        if(!productId){
            return res.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        // For guest users, return success (frontend will handle localStorage)
        if(!userId){
            return res.json({
                message : "Item added to cart (guest mode)",
                error : false,
                success : true,
                guest : true
            })
        }

        // For authenticated users, save to database
        const checkItemCart = await Cart.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return res.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new Cart({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await User.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        return res.json({
            data : save,
            message : "Item added successfully",
            error : false,
            success : true
        })

        
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getCartItemController = async(req,res)=>{
    try {
        const userId = req.userId

        // For guest users, return empty cart (frontend handles localStorage)
        if(!userId){
            return res.json({
                data : [],
                error : false,
                success : true,
                guest : true
            })
        }

        const cartItem =  await Cart.find({
            userId : userId
        }).populate('productId')

        return res.json({
            data : cartItem,
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateCartItemQtyController = async(req,res)=>{
    try {
        const userId = req.userId 
        const { _id,qty } = req.body

        if(!_id ||  !qty){
            return res.status(400).json({
                message : "Provide Cart id and quantity",
            })
        }

        // For guest users, return success (frontend handles localStorage)
        if(!userId){
            return res.json({
                message : "Cart updated successfully (guest mode)",
                success : true,
                error : false,
                guest : true
            })
        }

        const updateCartitem = await Cart.updateOne({
            _id : _id,
            userId : userId
        },{
            quantity : qty
        })

        return res.json({
            message : "Cart updated successfully",
            success : true,
            error : false, 
            data : updateCartitem
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(req,res)=>{
    try {
      const userId = req.userId // middleware
      const { _id } = req.body 
      
      if(!_id){
        return res.status(400).json({
            message : "Provide Cart id",
            error : true,
            success : false
        })
      }

      // For guest users, return success (frontend handles localStorage)
      if(!userId){
        return res.json({
          message : "Cart item deleted successfully (guest mode)",
          error : false,
          success : true,
          guest : true
        })
      }

      const deleteCartItem  = await Cart.deleteOne({_id : _id, userId : userId })

      return res.json({
        message : "Cart deleted successfully",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}