import { useState, useEffect } from 'react'
import { FaShoppingCart, FaUsers, FaBox, FaDollarSign } from 'react-icons/fa'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        adminAPI.getAllOrders(),
        adminAPI.getAllUsers(),
        adminAPI.getAllProducts()
      ])

      if (ordersRes.data.success) {
        const orders = ordersRes.data.data
        setRecentOrders(orders.slice(0, 5))
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.order_status === 'pending').length,
          totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmt || 0), 0)
        }))
      }

      if (usersRes.data.success) {
        setStats(prev => ({ ...prev, totalUsers: usersRes.data.data.length }))
      }

      if (productsRes.data.success) {
        setStats(prev => ({ ...prev, totalProducts: productsRes.data.data.length }))
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const StatCard = ({ icon, title, value, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center text-xs">
              <span className="text-green-500 font-semibold">↗ {trend}%</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your store performance and key metrics</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaShoppingCart className="text-white text-2xl" />}
          title="Total Orders"
          value={stats.totalOrders}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend="12.5"
        />
        <StatCard
          icon={<FaUsers className="text-white text-2xl" />}
          title="Total Users"
          value={stats.totalUsers}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend="8.2"
        />
        <StatCard
          icon={<FaBox className="text-white text-2xl" />}
          title="Total Products"
          value={stats.totalProducts}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend="5.7"
        />
        <StatCard
          icon={<FaDollarSign className="text-white text-2xl" />}
          title="Total Revenue"
          value={`UGX ${stats.totalRevenue.toLocaleString()}`}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          trend="15.3"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium">
            View All Orders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.orderId}</td>
                  <td className="p-2">{order.userId?.name || 'N/A'}</td>
                  <td className="p-2">UGX {order.totalAmt?.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard