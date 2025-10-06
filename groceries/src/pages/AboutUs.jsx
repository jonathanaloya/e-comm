import React from 'react'

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6">About Fresh Katale</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to Fresh Katale, your trusted partner in bringing the freshest, highest-quality groceries 
            directly to your doorstep. We are passionate about connecting communities with nutritious, 
            farm-fresh produce and essential household items.
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-3">Our Mission</h2>
            <p>
              At Fresh Katale, our mission is to revolutionize the way people shop for groceries by providing 
              convenient, reliable, and affordable access to fresh produce and quality products. We believe 
              that everyone deserves access to nutritious food that supports healthy living.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-3">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Fresh Produce:</strong> Locally sourced fruits and vegetables, picked at peak ripeness</li>
              <li><strong>Quality Groceries:</strong> Essential pantry items, dairy products, and household necessities</li>
              <li><strong>Fast Delivery:</strong> Quick and reliable delivery service to your location</li>
              <li><strong>Competitive Prices:</strong> Affordable pricing without compromising on quality</li>
              <li><strong>Customer Support:</strong> Dedicated support team to assist with your needs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-3">Why Choose Fresh Katale?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Quality Assurance</h3>
                <p className="text-sm">We carefully select and inspect all products to ensure you receive only the best quality items.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Convenience</h3>
                <p className="text-sm">Shop from the comfort of your home and have groceries delivered at your preferred time.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Local Support</h3>
                <p className="text-sm">We work with local farmers and suppliers to support the community and ensure freshness.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Sustainability</h3>
                <p className="text-sm">Committed to eco-friendly practices and reducing food waste through efficient supply chains.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-3">Our Commitment</h2>
            <p>
              Fresh Katale is committed to building lasting relationships with our customers by consistently 
              delivering exceptional service and quality products. We continuously strive to improve our 
              offerings and expand our reach to serve more communities.
            </p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">Get in Touch</h2>
            <p className="mb-4">
              Have questions or feedback? We'd love to hear from you! Our customer service team is here 
              to help make your shopping experience as smooth as possible.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> support@freshkatale.com</p>
              <p><strong>Phone:</strong> +256 700 000 000</p>
              <p><strong>Hours:</strong> Monday - Sunday, 8:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs