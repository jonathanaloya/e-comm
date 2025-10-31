import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { FaHome, FaShoppingCart, FaUsers, FaBox, FaSignOutAlt, FaTags, FaBell } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

const Sidebar = () => {
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
    <div className="bg-gradient-to-b from-green-800 to-green-900 text-white w-64 lg:w-64 md:w-20 min-h-screen shadow-2xl transition-all duration-300">
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img src="/logo.jpg" alt="Fresh Katale" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:block lg:block">
            <h1 className="text-lg font-bold">Fresh Katale</h1>
            <p className="text-green-200 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white text-green-800 shadow-lg transform scale-105'
                    : 'hover:bg-green-700 hover:transform hover:translate-x-2'
                }`
              }
            >
              <Icon className={`text-lg transition-colors ${
                window.location.pathname === item.path ? 'text-green-600' : 'group-hover:text-green-200'
              }`} />
              <span className="font-medium hidden md:inline lg:inline ml-3">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center p-2 w-full text-left hover:bg-red-600 rounded-xl transition-all duration-200 group border border-green-700 hover:border-red-500 max-w-56"
        >
          <FaSignOutAlt className="group-hover:text-red-200 text-lg" />
          <span className="font-medium group-hover:text-red-200 hidden md:inline lg:inline ml-3">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar