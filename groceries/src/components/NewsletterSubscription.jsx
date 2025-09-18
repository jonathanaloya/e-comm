import React, { useState } from 'react'
import { FaEnvelope, FaSpinner, FaCheck } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Axios from '../utils/Axios'

const NewsletterSubscription = ({ className = '', compact = false }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [preferences, setPreferences] = useState({
    promotions: true,
    newProducts: true,
    weeklyDeals: true,
    tips: true
  })

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await Axios({
        url: '/api/newsletter/subscribe',
        method: 'POST',
        data: {
          email,
          name: name || undefined,
          preferences,
          source: 'website'
        }
      })

      if (response.data.success) {
        setSubscribed(true)
        setEmail('')
        setName('')
        toast.success('Successfully subscribed to newsletter!')
      } else {
        toast.error(response.data.message || 'Failed to subscribe to newsletter')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to subscribe to newsletter. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (subscribed && compact) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 text-center ${className}`}>
        <FaCheck className="text-green-600 text-2xl mx-auto mb-2" />
        <p className="text-green-800 font-medium">Thank you for subscribing!</p>
        <p className="text-green-600 text-sm">Check your email for confirmation</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-primary-600 text-xl flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-primary-800 text-sm">Stay Updated!</h3>
            <p className="text-primary-700 text-xs">Get exclusive deals & offers</p>
          </div>
        </div>
        
        <form onSubmit={handleSubscribe} className="mt-3">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}>
      {subscribed ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            You've successfully subscribed to our newsletter. Check your email for confirmation!
          </p>
          <button
            onClick={() => setSubscribed(false)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Subscribe Another Email
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-primary-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Stay in the Loop!</h3>
            <p className="text-gray-600">
              Subscribe to our newsletter and never miss out on exclusive offers, new products, and fresh deals!
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                id="newsletter-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">What would you like to receive?</p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) => setPreferences(prev => ({ ...prev, promotions: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">🎯 Exclusive promotions and discounts</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.newProducts}
                    onChange={(e) => setPreferences(prev => ({ ...prev, newProducts: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">🆕 New product announcements</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.weeklyDeals}
                    onChange={(e) => setPreferences(prev => ({ ...prev, weeklyDeals: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">📈 Weekly deals and special offers</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.tips}
                    onChange={(e) => setPreferences(prev => ({ ...prev, tips: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">🍎 Fresh tips and healthy recipes</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !Object.values(preferences).some(Boolean)}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Subscribe to Newsletter
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </>
      )}
    </div>
  )
}

export default NewsletterSubscription