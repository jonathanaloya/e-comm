// src/components/ProtectedRoute.jsx
import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  // While we are initializing auth (e.g., checking token) show nothing or a spinner.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
      </div>
    )
  }

  // Only allow if authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute