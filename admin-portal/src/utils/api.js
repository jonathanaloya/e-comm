import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
  login: (credentials) => api.post('/api/admin/login', credentials),
  
  // Orders
  getAllOrders: () => api.get('/api/admin/all-orders'),
  updateOrderStatus: (data) => api.put('/api/admin/update-status', data),
  
  // Users
  getAllUsers: () => api.get('/api/user/admin/all-users'),
  
  // Products
  getAllProducts: () => api.post('/api/product/get', {}),
  createProduct: (data) => api.post('/api/product/create', data),
  updateProduct: (data) => api.put('/api/product/update', data),
  deleteProduct: (data) => api.delete('/api/product/delete', { data }),
  
  // Categories
  getCategories: () => api.get('/api/category/get-category'),
  createCategory: (data) => api.post('/api/category/add-category', data),
  updateCategory: (data) => api.put('/api/category/update-category', data),
  deleteCategory: (data) => api.delete('/api/category/delete-category', { data }),
  
  // Subcategories
  getSubCategories: () => api.post('/api/subcategory/get', {}),
  createSubCategory: (data) => api.post('/api/subcategory/create', data),
  updateSubCategory: (data) => api.put('/api/subcategory/update', data),
  deleteSubCategory: (data) => api.delete('/api/subcategory/delete', { data }),
  
  // Notifications
  getNotifications: () => api.get('/api/admin/notifications'),
  markNotificationAsRead: (id) => api.put(`/api/admin/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/api/admin/notifications/${id}`),
  
  // File Upload
  uploadImage: (formData) => api.post('/api/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api