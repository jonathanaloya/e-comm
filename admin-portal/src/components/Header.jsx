import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaBell, FaUser, FaSearch } from 'react-icons/fa'
import { adminAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { setSearchTerm } from '../store/productsSlice'

const Header = () => {
  const { user } = useSelector(state => state.auth)
  const [unreadCount, setUnreadCount] = useState(0)
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const fetchUnreadNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications()
      if (response.data.success) {
        const unreadNotifications = response.data.data.filter(notification => !notification.read)
        setUnreadCount(unreadNotifications.length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  useEffect(() => {
    fetchUnreadNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = () => {
    navigate('/notifications')
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      dispatch(setSearchTerm(localSearchTerm))
    }
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-sm text-gray-500 hidden md:block">Manage your Fresh Katale store</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 relative"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 px-2 md:px-4 py-2 rounded-full border border-green-200">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <FaUser className="text-white text-sm md:text-base" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-semibold text-gray-800">
                {user?.name || 'Admin User'}
              </span>
              <p className="text-xs text-green-600 font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header