import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Orders from '../pages/Orders'
import Users from '../pages/Users'
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import Notifications from '../pages/Notifications'
import ProtectedRoute from '../components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'orders',
        element: <Orders />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'categories',
        element: <Categories />
      },
      {
        path: 'notifications',
        element: <Notifications />
      }
    ]
  }
])

export default router