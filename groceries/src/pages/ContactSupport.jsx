import React, { useState } from 'react'
import { FaHeadset, FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaQuestionCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import SupportContactForm from '../components/SupportContactForm'

const ContactSupport = () => {
  const [activeTab, setActiveTab] = useState('contact-form')
  const navigate = useNavigate()

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I need help with Fresh Katale grocery store.")
    window.open(`https://wa.me/256700000000?text=${message}`, '_blank')
  }

  const handleCall = () => {
    window.open('tel:+256700000000', '_self')
  }

  const handleEmail = () => {
    window.open('mailto:support@freshkatale.com?subject=Need Help - Fresh Katale', '_self')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaHeadset className="text-primary-600 text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">We're Here to Help!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Need assistance? Our support team is ready to help you with any questions or issues you might have.
          </p>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <button 
              onClick={handleWhatsApp}
              className="w-full text-center group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <FaWhatsapp className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">WhatsApp Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Get instant help via WhatsApp</p>
              <span className="text-primary-600 font-medium text-sm group-hover:text-primary-700">
                Chat Now →
              </span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <button 
              onClick={handleCall}
              className="w-full text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <FaPhone className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-4">Speak directly with our team</p>
              <span className="text-primary-600 font-medium text-sm group-hover:text-primary-700">
                +256 700 000 000
              </span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <button 
              onClick={handleEmail}
              className="w-full text-center group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <FaEnvelope className="text-orange-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
              <span className="text-primary-600 font-medium text-sm group-hover:text-primary-700">
                support@freshkatale.com
              </span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <button 
              onClick={() => navigate('/faq')}
              className="w-full text-center group"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <FaQuestionCircle className="text-purple-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">FAQ</h3>
              <p className="text-gray-600 text-sm mb-4">Find quick answers</p>
              <span className="text-primary-600 font-medium text-sm group-hover:text-primary-700">
                Browse FAQs →
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('contact-form')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'contact-form'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Submit Support Ticket
                  </button>
                  <button
                    onClick={() => setActiveTab('live-chat')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'live-chat'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Live Chat Options
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'contact-form' && (
                  <div>
                    <SupportContactForm />
                  </div>
                )}

                {activeTab === 'live-chat' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Chat Options</h3>
                      <p className="text-gray-600 mb-6">
                        Get immediate assistance through our live chat channels
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                          <FaWhatsapp className="text-green-600 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-800">WhatsApp Support</h4>
                          <p className="text-sm text-gray-600">Chat with us instantly on WhatsApp</p>
                          <p className="text-sm text-green-600">+256 700 000 000</p>
                        </div>
                        <span className="text-primary-600 group-hover:text-primary-700">→</span>
                      </button>

                      <button
                        onClick={handleCall}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                          <FaPhone className="text-blue-600 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-800">Phone Support</h4>
                          <p className="text-sm text-gray-600">Call us directly for immediate assistance</p>
                          <p className="text-sm text-blue-600">+256 700 000 000</p>
                        </div>
                        <span className="text-primary-600 group-hover:text-primary-700">→</span>
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-gray-500" />
                        <h4 className="font-medium text-gray-800">Support Hours</h4>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>WhatsApp:</strong> 24/7 (Automated + Live agents 8AM-10PM)</p>
                        <p><strong>Phone:</strong> Monday - Sunday, 8:00 AM - 10:00 PM (EAT)</p>
                        <p><strong>Support Tickets:</strong> Monitored 24/7, responses within 2-4 hours</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaPhone className="text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">+256 700 000 000</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">support@freshkatale.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-gray-600">+256 700 000 000</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Address</p>
                    <p className="text-gray-600">
                      Fresh Katale HQ<br />
                      Kampala, Uganda
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <FaClock className="text-primary-600" />
                <h3 className="font-semibold text-primary-800">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm text-primary-700">
                <div className="flex justify-between">
                  <span>Monday - Sunday</span>
                  <span>8:00 AM - 10:00 PM</span>
                </div>
                <p className="text-xs text-primary-600 mt-2">
                  Emergency support available 24/7 via WhatsApp
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Check our FAQ section first for quick answers</li>
                <li>• Have your order number ready when contacting support</li>
                <li>• Use WhatsApp for fastest response times</li>
                <li>• Submit tickets for complex issues that need investigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSupport