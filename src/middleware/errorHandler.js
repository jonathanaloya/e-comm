// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack)

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false
    })
  }

  // Development error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: true,
    success: false,
    stack: err.stack
  })
}

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: true,
    success: false
  })
}