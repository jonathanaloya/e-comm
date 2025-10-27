import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import ordersSlice from './ordersSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: ordersSlice
  }
})