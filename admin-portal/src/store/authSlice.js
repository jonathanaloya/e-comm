// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const TOKEN_KEY = 'adminToken'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = !!action.payload
    },
    setUser(state, action) {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem(TOKEN_KEY)
    }
  }
})

export const { setLoading, setUser, logout } = authSlice.actions

// Helper: read token from localStorage and return it (no side-effects)
export const getTokenFromStorage = () => {
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t || typeof t !== 'string' || t.length < 32) return null
    return t
  } catch {
    return null
  }
}

// Optional: a small bootstrap thunk to validate/initialize auth on app start.
// This example only hydrates user presence from token. For strong security,
// call a backend `/auth/validate` endpoint to confirm the token.
export const initializeAuth = () => (dispatch) => {
  const token = getTokenFromStorage()
  if (!token) {
    dispatch(logout())
    return
  }

  // Simple hydrate: mark loading true while you (optionally) validate.
  dispatch(setLoading(true))
  // If you have an endpoint to validate token, call it here and setUser with returned profile.
  // For now we just set isAuthenticated = true and leave user null until login fetch.
  dispatch(setUser({ token })) // consumer code can fetch full user profile later
  dispatch(setLoading(false))
}

export default authSlice.reducer