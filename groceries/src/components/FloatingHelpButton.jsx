import React, { useState } from 'react'
import { FaHeadset, FaTimes, FaQuestionCircle, FaEnvelope, FaPhone, FaWhatsapp } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const FloatingHelpButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const toggleHelp = () => {
    setIsOpen(!isOpen)
  }

  const handleContactSupport = () => {
    navigate('/contact-support')
    setIsOpen(false)
  }

  const handleFAQ = () => {
    navigate('/faq')
    setIsOpen(false)
  }

  const handleCallUs = () => {
    window.open('tel:+256700000000', '_self')
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I need help with Fresh Katale grocery store.")
    window.open(`https://wa.me/256700000000?text=${message}`, '_blank')
  }

  const handleEmailUs = () => {
    window.open('mailto:support@freshkatale.com?subject=Need Help - Fresh Katale', '_self')
  }

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {isOpen && (
          <div className="mb-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[280px] sm:min-w-[320px] max-w-[90vw] animate-fadeInUp">
            <div className="max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaHeadset className="text-blue-600" />
                Need Help?
              </h3>
              <button
                onClick={toggleHelp}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaHeadset className="text-blue-600 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">Contact Support</p>
                  <p className="text-xs text-gray-500">Submit a support ticket</p>
                </div>
              </button>

              <button
                onClick={handleFAQ}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaQuestionCircle className="text-green-600 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">FAQ</p>
                  <p className="text-xs text-gray-500">Find quick answers</p>
                </div>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaWhatsapp className="text-green-600 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">WhatsApp</p>
                  <p className="text-xs text-gray-500">Chat with us instantly</p>
                </div>
              </button>

              <button
                onClick={handleCallUs}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaPhone className="text-purple-600 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">Call Us</p>
                  <p className="text-xs text-gray-500">+256 700 000 000</p>
                </div>
              </button>

              <button
                onClick={handleEmailUs}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-orange-600 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">Email Us</p>
                  <p className="text-xs text-gray-500">support@freshkatale.com</p>
                </div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                We're here to help 24/7! 
              </p>
            </div>
            </div>
          </div>
        )}

        {/* Main floating button */}
        <div className="fixed bottom-28 right-4 block lg:hidden z-50">
          <button
            onClick={toggleHelp}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isOpen 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label="Get Help"
          >
            {isOpen ? (
              <FaTimes className="text-white text-lg" />
            ) : (
              <FaHeadset className="text-white text-lg" />
            )}
          </button>
        </div>

      </div>

      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default FloatingHelpButton