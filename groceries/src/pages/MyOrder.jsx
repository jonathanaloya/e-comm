import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import NoData from '../components/NoData'
import { setOrder } from '../store/orderSlice'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import SummaryApi from '../common/SummaryApi'
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaTimesCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'

const MyOrders = () => {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.orders.order)
  const [loading, setLoading] = useState(false)
  const [groupedOrders, setGroupedOrders] = useState([])
  const [individualOrders, setIndividualOrders] = useState([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getOrderItems
      })
      
      if (response.data.success) {
        const orderData = response.data.data
        
        // Store all orders in Redux
        const allOrders = [
          ...orderData.groupedOrders.flatMap(group => group.items),
          ...orderData.individualOrders
        ]
        dispatch(setOrder(allOrders))
        
        // Set grouped and individual orders for display
        setGroupedOrders(orderData.groupedOrders || [])
        setIndividualOrders(orderData.individualOrders || [])
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />
      case 'confirmed':
      case 'processing':
        return <FaBox className="text-blue-500" />
      case 'shipped':
        return <FaTruck className="text-purple-500" />
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaClock className="text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'shipped':
        return 'text-purple-600 bg-purple-50'
      case 'delivered':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <Loading />
        </div>
      </div>
    )
  }

  const hasOrders = groupedOrders.length > 0 || individualOrders.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Panel - Remove this in production */}
      <div className="mb-8">
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>

        {!hasOrders && (
          <div className="text-center py-12">
            <NoData />
            <p className="text-gray-600 mt-4">You haven't placed any orders yet.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Grouped Orders */}
          {groupedOrders.map((orderGroup, index) => (
            <div key={orderGroup.mainOrderId || index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{orderGroup.mainOrderId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDate(orderGroup.createdAt)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderGroup.order_status)}`}>
                    {getStatusIcon(orderGroup.order_status)}
                    {orderGroup.order_status?.toUpperCase() || 'PENDING'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Payment: <span className="font-medium">{orderGroup.payment_status}</span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {orderGroup.items?.map((item, itemIndex) => (
                  <div key={item._id || itemIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg">
                    <img
                      src={item.product_details?.image?.[0] || '/placeholder-image.jpg'}
                      alt={item.product_details?.name}
                      className="w-16 h-16 object-cover rounded-lg mx-auto sm:mx-0"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg' }}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-medium text-gray-800">{item.product_details?.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-800">UGX {item.totalAmt?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">UGX {orderGroup.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">
                    {orderGroup.deliveryFee === 0 ? 'Free' : `UGX ${orderGroup.deliveryFee?.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {(orderGroup.totalAmount + (orderGroup.deliveryFee || 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Address */}
              {orderGroup.delivery_address && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Delivery Address:</h5>
                  <p className="text-sm text-gray-600">
                    {orderGroup.delivery_address.address_line}<br />
                    {orderGroup.delivery_address.city}, {orderGroup.delivery_address.state}<br />
                    {orderGroup.delivery_address.country}
                  </p>
                </div>
              )}
              
              {/* Track Order Button */}
              <div className="mt-4">
                <a 
                  href={`/track-order/${orderGroup.mainOrderId}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </a>
              </div>
            </div>
          ))}

          {/* Individual Orders */}
          {individualOrders.map((order, index) => (
            <div key={order._id || index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                    {order.order_status?.toUpperCase() || 'PENDING'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Payment: <span className="font-medium">{order.payment_status}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <img
                  src={order.product_details?.image?.[0] || '/placeholder-image.jpg'}
                  alt={order.product_details?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => { e.target.src = '/placeholder-image.jpg' }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-medium text-gray-800 mb-1">{order.product_details?.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">Quantity: {order.quantity}</p>
                  <p className="text-lg font-bold text-gray-800">UGX {order.totalAmt?.toLocaleString()}</p>
                </div>
              </div>

              {/* Delivery Address */}
              {order.delivery_address && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Delivery Address:</h5>
                  <p className="text-sm text-gray-600">
                    {order.delivery_address.address_line}<br />
                    {order.delivery_address.city}, {order.delivery_address.state}<br />
                    {order.delivery_address.country}
                  </p>
                </div>
              )}
              
              {/* Track Order Button */}
              <div className="mt-4">
                <a 
                  href={`/track-order/${order.orderId}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyOrders