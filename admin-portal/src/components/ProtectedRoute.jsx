import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Security: Validate token format
  React.useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token && token.length < 32) {
      localStorage.removeItem('adminToken')
      window.location.reload()
    }
  }, [])
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute