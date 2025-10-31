import { useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'
import SupportTicketModal from '../components/SupportTicketModal'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketModal, setShowTicketModal] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications()
      setNotifications(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId)
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ))
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await adminAPI.deleteNotification(notificationId)
      setNotifications(notifications.filter(notif => notif._id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleSupportTicketClick = (notification) => {
    if (notification.type === 'support' && notification.data?.ticketId) {
      // Navigate to support tickets page with the specific ticket highlighted
      window.location.href = `/support-tickets?ticket=${notification.data.ticketId}`
    }
  }

  const handleOrderClick = (notification) => {
    if (notification.type === 'order' && notification.data?.orderId) {
      // Navigate to orders page with the specific order highlighted
      window.location.href = `/orders?highlight=${notification.data.orderId}`
    }
  }

  const handleReplyToTicket = async (ticketId, message) => {
    try {
      await adminAPI.replyToSupportTicket({ ticketId, message })
      toast.success('Reply sent successfully')

      // Refresh ticket details
      const response = await adminAPI.getSupportTicketDetails(ticketId)
      setSelectedTicket(response.data.data)
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await adminAPI.updateSupportTicketStatus({ ticketId, status })
      toast.success(`Ticket status updated to ${status}`)

      // Refresh ticket details
      const response = await adminAPI.getSupportTicketDetails(ticketId)
      setSelectedTicket(response.data.data)
    } catch (error) {
      toast.error('Failed to update ticket status')
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'read') return notif.read
    return true
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'support':
        return '🎧'
      case 'order':
        return '📦'
      case 'user':
        return '👤'
      default:
        return '📢'
    }
  }

  const getNotificationAction = (notification) => {
    if (notification.type === 'support' && notification.data?.ticketId) {
      return (
        <button
          onClick={() => handleSupportTicketClick(notification)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View & Reply
        </button>
      )
    }
    if (notification.type === 'order' && notification.data?.orderId) {
      return (
        <button
          onClick={() => handleOrderClick(notification)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          View Order Details
        </button>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Read ({notifications.filter(n => n.read).length})
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow border-l-4 p-4 transition-all hover:shadow-md ${
                notification.read ? 'border-l-gray-300' : 'border-l-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      <span className="capitalize">{notification.type}</span>
                      {notification.priority && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getNotificationAction(notification)}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <SupportTicketModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketModal(false)
            setSelectedTicket(null)
          }}
          onReply={handleReplyToTicket}
          onUpdateStatus={handleUpdateTicketStatus}
        />
      )}
    </div>
  )
}

export default Notifications