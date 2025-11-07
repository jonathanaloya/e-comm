import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import ordersSlice from './ordersSlice'
import productsSlice from './productsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: ordersSlice,
    products: productsSlice
  }
})