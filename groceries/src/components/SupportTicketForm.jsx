import React, { useState } from 'react'
import { FaTicketAlt, FaPaperPlane } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'

const SupportTicketForm = () => {
  const user = useSelector(state => state?.user)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await Axios({
        ...SummaryApi.createSupportTicket,
        data: formData
      })

      if (response.data.success) {
        toast.success(`Support ticket created successfully! Ticket ID: ${response.data.data.ticketId}`)
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          subject: '',
          message: '',
          priority: 'medium'
        })
      } else {
        toast.error(response.data.message || 'Failed to create support ticket')
      }
    } catch (error) {
      console.error('Support ticket error:', error)
      toast.error(error?.response?.data?.message || 'Failed to create support ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FaTicketAlt className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">Submit Support Ticket</h3>
        </div>
        <p className="text-gray-600">
          Need help? Submit a support ticket and our team will get back to you within 2-4 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Standard issue</option>
              <option value="high">High - Urgent issue</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical"
            placeholder="Please describe your issue in detail. Include any relevant information such as order numbers, error messages, or steps you've already tried."
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Tips for faster resolution:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Include your order number if related to an order</li>
            <li>• Describe the steps that led to the issue</li>
            <li>• Mention your device/browser if it's a technical issue</li>
            <li>• Attach screenshots if helpful (you can email them separately)</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <FaPaperPlane />
              Submit Support Ticket
            </>
          )}
        </button>

        <div className="text-center text-sm text-gray-600">
          <p>
            Need immediate help? Try our{' '}
            <button
              type="button"
              onClick={() => window.open('https://wa.me/256700000000?text=Hi! I need help with Fresh Katale.', '_blank')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              WhatsApp support
            </button>
            {' '}for instant assistance.
          </p>
        </div>
      </form>
    </div>
  )
}

export default SupportTicketForm