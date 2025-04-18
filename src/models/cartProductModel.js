import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Schema.ObjectId,
        ref: 'product'
    },

    quantity : {
        type: Number,
        default: 1
    },
    userId : {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
})

const Cart = mongoose.model('cartProduct', cartProductSchema)

export default Cart