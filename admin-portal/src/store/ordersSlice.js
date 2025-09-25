import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  loading: false,
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  }
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
      // Calculate stats
      state.stats.totalOrders = action.payload.length
      state.stats.pendingOrders = action.payload.filter(o => o.order_status === 'pending').length
      state.stats.totalRevenue = action.payload.reduce((sum, o) => sum + (o.totalAmt || 0), 0)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o._id === orderId)
      if (order) {
        order.order_status = status
      }
    }
  }
})

export const { setOrders, setLoading, updateOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer