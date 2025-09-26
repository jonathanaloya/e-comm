import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Clear any test authentication on load
  React.useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token === 'test-token') {
      localStorage.removeItem('adminToken')
      window.location.reload()
    }
  }, [])
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute