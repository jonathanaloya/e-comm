import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cse-341-project1-h1kw.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const adminAPI = {
  // Auth
  login: (credentials) => api.post('/api/user/login', credentials),
  
  // Orders
  getAllOrders: () => api.get('/api/order/admin/all-orders'),
  updateOrderStatus: (data) => api.put('/api/order/admin/update-status', data),
  
  // Users
  getAllUsers: () => api.get('/api/user/admin/all-users'),
  
  // Products
  getAllProducts: () => api.post('/api/product/get', {}),
  
  // Categories
  getCategories: () => api.get('/api/category/get-category'),
  getSubCategories: () => api.post('/api/subcategory/get', {})
}

export default api