import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { FaHome, FaShoppingCart, FaUsers, FaBox, FaSignOutAlt, FaTags, FaBell, FaTimes } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/users', icon: FaUsers, label: 'Users' },
    { path: '/products', icon: FaBox, label: 'Products' },
    { path: '/categories', icon: FaTags, label: 'Categories' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        bg-gradient-to-b from-green-800 to-green-900 text-white 
        min-h-screen shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden">
                <img src="/logo.jpg" alt="Fresh Katale" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-bold">Fresh Katale</h1>
                <p className="text-green-200 text-xs">Admin Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-green-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white text-green-800 shadow-lg'
                      : 'hover:bg-green-700'
                  }`
                }
              >
                <Icon className={`text-lg transition-colors ${
                  window.location.pathname === item.path ? 'text-green-600' : 'group-hover:text-green-200'
                }`} />
                <span className="font-medium ml-3">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full text-left hover:bg-red-600 rounded-xl transition-all duration-200 group border border-green-700 hover:border-red-500"
          >
            <FaSignOutAlt className="group-hover:text-red-200 text-lg" />
            <span className="font-medium group-hover:text-red-200 ml-3">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar