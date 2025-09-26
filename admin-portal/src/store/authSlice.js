import { createSlice } from '@reduxjs/toolkit'

// Security: Remove any test tokens
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('adminToken')
  if (!token || token.length < 32) {
    localStorage.removeItem('adminToken')
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('adminToken')
    }
  }
})

export const { setUser, setLoading, logout } = authSlice.actions
export default authSlice.reducer