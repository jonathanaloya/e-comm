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
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
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
  login: (credentials) => api.post('/admin/login', credentials),
  
  // Orders
  getAllOrders: () => api.get('/admin/all-orders'),
  updateOrderStatus: (data) => api.put('/admin/update-status', data),
  
  // Users
  getAllUsers: () => api.get('/user/admin/all-users'),
  
  // Products
  getAllProducts: () => api.post('/product/get', {}),
  createProduct: (data) => api.post('/product/create', data),
  updateProduct: (data) => api.put('/product/update', data),
  deleteProduct: (data) => api.delete('/product/delete', { data }),

  // Categories
  getCategories: () => api.get('/category/get-category'),
  createCategory: (data) => api.post('/category/add-category', data),
  updateCategory: (data) => api.put('/category/update-category', data),
  deleteCategory: (data) => api.delete('/category/delete-category', { data }),

  // Subcategories
  getSubCategories: () => api.post('/subcategory/get', {}),
  createSubCategory: (data) => api.post('/subcategory/create', data),
  updateSubCategory: (data) => api.put('/subcategory/update', data),
  deleteSubCategory: (data) => api.delete('/subcategory/delete', { data }),
  
  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  
  // File Upload
  uploadImage: (formData) => api.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api