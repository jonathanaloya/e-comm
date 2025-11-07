import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaBox, FaCheck, FaTruck, FaMapMarkerAlt } from 'react-icons/fa'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'

const OrderTracking = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const trackingSteps = [
    { key: 'pending', label: 'Order Placed', icon: FaBox },
    { key: 'confirmed', label: 'Order Confirmed', icon: FaCheck },
    { key: 'processing', label: 'Processing', icon: FaBox },
    { key: 'shipped', label: 'Shipped', icon: FaTruck },
    { key: 'delivered', label: 'Delivered', icon: FaMapMarkerAlt }
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-600'
      case 'cancelled': return 'text-red-600'
      case 'shipped': return 'text-blue-600'
      case 'processing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'processing': return 'Processing'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const fetchOrderTracking = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        url: `/order/tracking/${orderId}`,
        method: 'get'
      })

      if (response.data.success) {
        setOrder(response.data.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderTracking()
    }
  }, [orderId])

  const getStepIndex = (status) => {
    return trackingSteps.findIndex(step => step.key === status)
  }

  const isStepCompleted = (stepIndex, currentStatus) => {
    const currentIndex = getStepIndex(currentStatus)
    return stepIndex <= currentIndex
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order tracking...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Order not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Track Your Order</h1>
        
        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Order ID</h3>
              <p className="text-lg">{order.orderId}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Order Date</h3>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Total Amount</h3>
              <p className="text-lg font-bold text-green-600">UGX {order.totalAmt?.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Current Status</h3>
              <p className={`text-lg font-bold ${getStatusColor(order.order_status)}`}>
                {getStatusText(order.order_status)}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
          
          {order.order_status === 'cancelled' ? (
            <div className="text-center py-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Order Cancelled</strong>
                <p>This order has been cancelled.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = isStepCompleted(index, order.order_status)
                const isCurrent = getStepIndex(order.order_status) === index
                
                return (
                  <div key={step.key} className="flex items-center mb-8 last:mb-0">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      <Icon className="text-lg" />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-gray-600">Current status</p>
                      )}
                    </div>
                    
                    {index < trackingSteps.length - 1 && (
                      <div className={`absolute left-6 w-0.5 h-8 mt-12 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} style={{ top: `${index * 80 + 48}px` }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
          <div className="flex items-center gap-4">
            <img
              src={order.product_details?.image?.[0]}
              alt={order.product_details?.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg">{order.product_details?.name}</h3>
              <p className="text-gray-600">Quantity: {order.quantity}</p>
              <p className="text-lg font-bold text-green-600">UGX {order.totalAmt?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h2>
            <div className="text-gray-700">
              <p>{order.delivery_address.address_line}</p>
              <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
              <p>{order.delivery_address.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking