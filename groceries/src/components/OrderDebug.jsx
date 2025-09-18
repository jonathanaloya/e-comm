import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const OrderDebug = () => {
  const user = useSelector(state => state.user)
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const testOrderFetch = async () => {
    setLoading(true)
    setDebugInfo(null)
    
    try {
      console.log('Current user from Redux:', user)
      
      // Test authentication by calling a protected endpoint
      const response = await Axios({
        ...SummaryApi.getOrderItems
      })
      
      
      setDebugInfo({
        success: true,
        user: user,
        response: response.data,
        orderCount: response.data?.data?.totalOrders || 0,
        groupedOrders: response.data?.data?.groupedOrders || [],
        individualOrders: response.data?.data?.individualOrders || []
      })
      
    } catch (error) {
      console.error('Order API Error:', error)
      
      setDebugInfo({
        success: false,
        user: user,
        error: error.response?.data || error.message,
        errorStatus: error.response?.status
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    try {
      // Test if user is authenticated by calling user details endpoint
      const response = await Axios({
        ...SummaryApi.getUserLoginDetails
      })
      
      console.log('User auth test response:', response.data)
      alert(`Auth test: ${response.data.success ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(response.data)}`)
      
    } catch (error) {
      console.error('Auth test error:', error)
      alert(`Auth test FAILED: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Order Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold mb-2">User Info from Redux:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Authentication
          </button>
          
          <button
            onClick={testOrderFetch}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Order Fetch'}
          </button>
        </div>

        {debugInfo && (
          <div className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">API Response:</h3>
            <div className="space-y-2">
              <p><strong>Success:</strong> {debugInfo.success ? 'YES' : 'NO'}</p>
              
              {debugInfo.success ? (
                <>
                  <p><strong>Total Orders:</strong> {debugInfo.orderCount}</p>
                  <p><strong>Grouped Orders:</strong> {debugInfo.groupedOrders.length}</p>
                  <p><strong>Individual Orders:</strong> {debugInfo.individualOrders.length}</p>
                </>
              ) : (
                <>
                  <p><strong>Error Status:</strong> {debugInfo.errorStatus}</p>
                  <p><strong>Error Message:</strong> {debugInfo.error?.message || JSON.stringify(debugInfo.error)}</p>
                </>
              )}
            </div>
            
            <details className="mt-4">
              <summary className="font-semibold cursor-pointer">Full Response Data</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto mt-2">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Check if user is logged in (user._id should exist)</li>
            <li>2. Verify JWT token is being sent with requests</li>
            <li>3. Check if orders exist in database for this user</li>
            <li>4. Ensure authentication middleware is working</li>
            <li>5. Check browser network tab for actual API calls</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default OrderDebug