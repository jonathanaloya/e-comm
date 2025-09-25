import { useSelector } from 'react-redux'
import { FaBell, FaUser, FaSearch } from 'react-icons/fa'

const Header = () => {
  const { user } = useSelector(state => state.auth)

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-sm text-gray-500">Manage your Fresh Katale store</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            />
          </div>
          
          <div className="relative">
            <button className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 relative">
              <FaBell className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-full border border-green-200">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <FaUser className="text-white" />
            </div>
            <div>
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