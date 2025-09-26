import React, { useState } from 'react'
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaSearch, FaHeadset } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState({})
  const [activeCategory, setActiveCategory] = useState('all')
  const navigate = useNavigate()

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const faqData = [
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'To place an order: 1) Browse our products and add items to your cart, 2) Go to checkout, 3) Enter your delivery address, 4) Choose payment method (Cash on Delivery or Card/Mobile Money), 5) Confirm your order. You\'ll receive an order confirmation via email.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 30 minutes of placing it. After this time, the order enters preparation and cannot be changed. Contact our support team immediately if you need to make changes.'
    },
    {
      id: 3,
      category: 'orders',
      question: 'How do I track my order?',
      answer: `You can track your order by:
      1. Going to "My Orders" in your account
      2. Checking the order status updates sent via email and SMS
      3. Contacting our support team with your order number for real-time updates.`
    },
    {
      id: 4,
      category: 'delivery',
      question: 'What are your delivery areas?',
      answer: 'We deliver across Uganda with different delivery zones: 1) Kampala and suburbs - UGX 5,000 (Free above UGX 100,000), 2) Major cities (Jinja, Mbarara, Gulu) - UGX 10,000 (Free above UGX 150,000), 3) Rural areas - UGX 15,000 (Free above UGX 200,000).'
    },
    {
      id: 5,
      category: 'delivery',
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by location: Kampala (Same day or next day), Major cities (1-2 days), Rural areas (2-3 days). We aim to deliver as quickly as possible and will provide estimated delivery times at checkout.'
    },
    {
      id: 6,
      category: 'delivery',
      question: 'Do you offer same-day delivery?',
      answer: 'Yes! Same-day delivery is available in Kampala for orders placed before 2:00 PM. A small rush fee may apply. Select "Same-day delivery" at checkout to see if it\'s available for your area.'
    },
    {
      id: 7,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept: 1) Cash on Delivery (COD), 2) Credit/Debit Cards, 3) Mobile Money (MTN, Airtel), 4) Bank transfers. All online payments are secured with encryption.'
    },
    {
      id: 8,
      category: 'payment',
      question: 'Is it safe to pay online?',
      answer: 'Yes, absolutely! We use industry-standard encryption and work with trusted payment processors like Flutterwave. Your payment information is never stored on our servers and all transactions are secure.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Can I pay with mobile money?',
      answer: 'Yes! We accept MTN Mobile Money and Airtel Money. Simply select mobile money at checkout, enter your phone number, and complete the payment on your mobile device.'
    },
    {
      id: 10,
      category: 'products',
      question: 'Are your products fresh?',
      answer: 'Yes! We source directly from farms and trusted suppliers. All perishable items are stored in temperature-controlled environments. We guarantee freshness and offer replacements if you\'re not satisfied.'
    },
    {
      id: 11,
      category: 'products',
      question: 'Do you have organic products?',
      answer: 'Yes, we have a dedicated organic section with certified organic fruits, vegetables, and other products. Look for the "Organic" label on product listings or filter by organic in our search.'
    },
    {
      id: 12,
      category: 'products',
      question: 'What if an item is out of stock?',
      answer: 'If an item becomes unavailable after you order, we\'ll contact you to suggest alternatives or remove it from your order with a refund. We update stock levels in real-time to minimize this occurrence.'
    },
    {
      id: 13,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" on our homepage, enter your email, phone number, and create a password. You\'ll receive a verification email to activate your account. You can also shop as a guest without creating an account.'
    },
    {
      id: 14,
      category: 'account',
      question: 'I forgot my password. What should I do?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 15,
      category: 'account',
      question: 'How do I update my delivery address?',
      answer: 'Go to "My Account" → "Addresses" to add, edit, or delete delivery addresses. You can save multiple addresses and choose which one to use during checkout.'
    },
    {
      id: 16,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We accept returns for damaged, expired, or incorrect items within 24 hours of delivery. Contact support with photos of the issue. Fresh produce can be returned if not satisfied with quality upon delivery.'
    },
    {
      id: 17,
      category: 'returns',
      question: 'How do I request a refund?',
      answer: 'Contact our support team with your order number and reason for refund. Refunds are processed within 3-5 business days to your original payment method. COD orders receive mobile money refunds.'
    },
    {
      id: 18,
      category: 'technical',
      question: 'The website is not working properly. What should I do?',
      answer: 'Try these steps: 1) Refresh the page, 2) Clear your browser cache and cookies, 3) Try a different browser, 4) Check your internet connection. If issues persist, contact our technical support team.'
    },
    {
      id: 19,
      category: 'technical',
      question: 'Can I use the website on my mobile phone?',
      answer: 'Yes! Our website is fully mobile-responsive and works great on smartphones and tablets. We also recommend adding our website to your phone\'s home screen for easy access.'
    },
    {
      id: 20,
      category: 'general',
      question: 'Do you have a customer loyalty program?',
      answer: 'Yes! Earn points with every purchase and get exclusive discounts. Join our newsletter to receive special offers, early access to sales, and loyalty rewards. Points can be redeemed for discounts on future orders.'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'orders', name: 'Orders' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'payment', name: 'Payment' },
    { id: 'products', name: 'Products' },
    { id: 'account', name: 'Account' },
    { id: 'returns', name: 'Returns' },
    { id: 'technical', name: 'Technical' },
    { id: 'general', name: 'General' }
  ]

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FaQuestionCircle className="text-blue-600 text-2xl sm:text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 px-4">Frequently Asked Questions</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Find quick answers to common questions about Fresh Katale grocery delivery
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          <div className="relative">
            <FaSearch className="absolute left-6 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Still need help? */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Still need help?</h4>
                <button
                  onClick={() => navigate('/contact-support')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FaHeadset />
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any questions matching your search. Try different keywords or browse categories.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setActiveCategory('all')
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Show All Questions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-6">
                  Showing {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}
                  {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.name}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>

                {filteredFAQs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-800 flex-1 pr-4">{faq.question}</h3>
                      {openItems[faq.id] ? (
                        <FaChevronUp className="text-primary-600 flex-shrink-0" />
                      ) : (
                        <FaChevronDown className="text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItems[faq.id] && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contact Support CTA */}
            <div className="mt-12 bg-primary-50 rounded-xl p-8 border border-primary-200 text-center">
              <FaHeadset className="text-primary-600 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-800 mb-2">Didn't find what you're looking for?</h3>
              <p className="text-primary-700 mb-6">
                Our support team is ready to help you with any questions or concerns you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/contact-support')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Contact Support Team
                </button>
                <button
                  onClick={() => {
                    const message = encodeURIComponent("Hi! I have a question that wasn't covered in the FAQ.")
                    window.open(`https://wa.me/256785733366?text=${message}`, '_blank')
                  }}
                  className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors font-medium"
                >
                  WhatsApp Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ