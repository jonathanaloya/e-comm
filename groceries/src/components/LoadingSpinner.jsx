import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Loading Fresh Katale...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner