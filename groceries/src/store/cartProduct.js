import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart : []
}

const cartSlice = createSlice({
    name : "cartItem",
    initialState : initialState,
    reducers : {
        handleAddItemCart : (state,action)=>{
           state.cart = [...action.payload]
        },
        handleClearCart : (state,action)=>{
            state.cart = []
        }
    }
})

export const { handleAddItemCart,handleClearCart } = cartSlice.actions

export default cartSlice.reducer