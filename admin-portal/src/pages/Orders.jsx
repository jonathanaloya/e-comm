import { useState, useEffect } from 'react'
import { FaEye, FaSearch } from 'react-icons/fa'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const response = await adminAPI.getAllOrders()

      if (response.data.success) {
        // Handle both grouped and individual orders
        const data = response.data.data
        let allOrders = []

        if (data.groupedOrders) {
          allOrders = [...data.groupedOrders, ...data.individualOrders]
        } else {
          allOrders = data
        }

        setOrders(allOrders)
        setFilteredOrders(allOrders)
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await adminAPI.updateOrderStatus({ orderId, status: newStatus })

      if (response.data.success) {
        toast.success('Order status updated successfully')
        fetchOrders()
        setShowModal(false)
      }
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.mainOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.product_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product_details?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        order.userId.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  const OrderModal = ({ order, onClose, onUpdate }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order ID</label>
              <p className="text-sm text-gray-900">{order.mainOrderId || order.orderId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="text-sm text-gray-900">{order.userId?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{order.userId?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{order.userId?.mobile}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordered Items</label>
            <div className="space-y-2">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {item.product_details?.image && item.product_details.image[0] && (
                        <img
                          src={`https://freshkatale.com${item.product_details.image[0]}`}
                          alt={item.product_details.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.product_details?.name}</p>
                        <p className="text-sm text-gray-600">UGX {item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">UGX {(item.itemTotal || item.price * item.quantity)?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {order.product_details?.image && order.product_details.image[0] && (
                      <img
                        src={`https://freshkatale.com${order.product_details.image[0]}`}
                        alt={order.product_details.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{order.product_details?.name}</p>
                      <p className="text-sm text-gray-600">UGX {order.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {order.quantity}</p>
                    <p className="text-sm text-gray-600">UGX {order.totalAmt?.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <p className="text-sm text-gray-900">UGX {order.totalAmount?.toLocaleString() || order.totalAmt?.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <p className="text-sm text-gray-900">{order.payment_status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Status</label>
              <p className="text-sm text-gray-900">{order.order_status}</p>
            </div>
          </div>

          {order.delivery_address && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
              <p className="text-sm text-gray-900">
                {order.delivery_address.address_line}<br/>
                {order.delivery_address.city}, {order.delivery_address.state}<br/>
                {order.delivery_address.country}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
            <select
              value={order.order_status}
              onChange={(e) => onUpdate(order._id, e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <div className="p-6">Loading orders...</div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600">Track and manage all customer orders</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchOrders}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id || order.mainOrderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.mainOrderId || order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.userId?.name}</div>
                      <div className="text-gray-500">{order.userId?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items && order.items.length > 0 ? (
                      <div>
                        <div className="font-medium">{order.items[0].product_details?.name}</div>
                        {order.items.length > 1 && (
                          <div className="text-gray-500">+{order.items.length - 1} more items</div>
                        )}
                      </div>
                    ) : (
                      order.product_details?.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    UGX {order.totalAmount?.toLocaleString() || order.totalAmt?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                      order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowModal(true)
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-all duration-200"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onUpdate={updateOrderStatus}
        />
      )}
    </div>
  )
}

export default Orders