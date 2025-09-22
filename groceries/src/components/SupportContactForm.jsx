import React, { useState, useEffect } from 'react'
import { FaHeadset, FaSpinner, FaCheck, FaPaperclip, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Axios from '../utils/Axios'
import { useSelector } from 'react-redux'

const SupportContactForm = ({ onTicketCreated, preSelectedOrder = null }) => {
  const user = useSelector(state => state.user)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const [formData, setFormData] = useState({
    contactInfo: {
      name: user.name || '',
      email: user.email || '',
      phone: user.mobile || ''
    },
    subject: '',
    category: '',
    description: '',
    orderId: preSelectedOrder?._id || '',
    orderNumber: preSelectedOrder?.mainOrderId || preSelectedOrder?.orderId || '',
    priority: 'medium',
    attachments: []
  })

  // Fetch support categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Axios({
          url: '/api/support/categories',
          method: 'GET'
        })
        if (response.data.success) {
          setCategories(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // Update form data when user info changes
  useEffect(() => {
    if (user.name || user.email) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          name: user.name || prev.contactInfo.name,
          email: user.email || prev.contactInfo.email,
          phone: user.mobile || prev.contactInfo.phone
        }
      }))
    }
  }, [user])

  const handleInputChange = (field, value, nestedField = null) => {
    if (nestedField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleFileUpload = async (files) => {
    // This is a placeholder for file upload functionality
    // In a real implementation, you would upload files to your file storage service
    const filePromises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            filename: file.name,
            url: reader.result, // In real implementation, this would be the uploaded file URL
            fileType: file.type,
            fileSize: file.size
          })
        }
        reader.readAsDataURL(file)
      })
    })

    const uploadedFiles = await Promise.all(filePromises)
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...uploadedFiles]
    }))
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("formData", formData)
    // Validation
    if (!formData.contactInfo.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    
    if (!formData.contactInfo.email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    
    if (!formData.category) {
      toast.error('Please select a category')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Please describe your issue')
      return
    }

    setLoading(true)

    try {
      const response = await Axios({
        url: '/api/support/tickets',
        method: 'POST',
        data: {
          ...formData,
          contactInfo: {
            name: formData.contactInfo.name.trim(),
            email: formData.contactInfo.email.trim().toLowerCase(),
            phone: formData.contactInfo.phone.trim()
          },
          subject: formData.subject.trim(),
          description: formData.description.trim()
        }
      })

      if (response.data.success) {
        setSubmitted(true)
        setTicketId(response.data.data.ticketId)
        toast.success('Support ticket created successfully!')
        
        if (onTicketCreated) {
          onTicketCreated(response.data.data)
        }
      } else {
        toast.error(response.data.message || 'Failed to create support ticket')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create support ticket. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setTicketId('')
    setFormData({
      contactInfo: {
        name: user.name || '',
        email: user.email || '',
        phone: user.mobile || ''
      },
      subject: '',
      category: '',
      description: '',
      orderId: '',
      orderNumber: '',
      priority: 'medium',
      attachments: []
    })
  }

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ticket Created Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your support ticket has been created with ID: <strong>{ticketId}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Our support team will review your request and respond via email within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Another Ticket
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <FaHeadset className="text-primary-600 text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Contact Support</h3>
          <p className="text-gray-600 text-sm">We're here to help you with any questions or issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.contactInfo.name}
                onChange={(e) => handleInputChange('contactInfo', e.target.value, 'name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleInputChange('contactInfo', e.target.value, 'email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={formData.contactInfo.phone}
              onChange={(e) => handleInputChange('contactInfo', e.target.value, 'phone')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your phone number"
              disabled={loading}
            />
          </div>
        </div>

        {/* Issue Details */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Issue Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief summary of your issue"
                disabled={loading}
                maxLength={200}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Order Information */}
            {!preSelectedOrder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter order number if this relates to a specific order"
                  disabled={loading}
                />
              </div>
            )}

            {preSelectedOrder && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Related Order:</p>
                <p className="text-sm text-gray-600">#{preSelectedOrder.mainOrderId || preSelectedOrder.orderId}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Please describe your issue or question in detail..."
                rows={4}
                maxLength={2000}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            You can attach screenshots, documents, or other relevant files
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={loading}
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
          >
            <FaPaperclip />
            Attach Files
          </label>

          {formData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <FaPaperclip className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-700">{file.filename}</span>
                    <span className="text-xs text-gray-500">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-green-600">
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 bg-blue-600 text-black font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating Ticket...
              </>
            ) : (
              <>
                <FaHeadset />
                Create Support Ticket
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your information is secure and will only be used to respond to your inquiry.
      </p>
    </div>
  )
}

export default SupportContactForm