import React from 'react'

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6">About Fresh Katale</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to Fresh Katale, your go-to online marketplace for fresh, high-quality produce and everyday essentials. We are dedicated to connecting farmers, suppliers, and consumers by providing a seamless shopping experience that guarantees convenience, affordability, and freshness.
          </p>
          <p>
            At Fresh Katale, we believe in supporting local farmers and businesses while ensuring that households have access to nutritious and affordable food. Our platform offers a wide variety of fresh fruits, vegetables, dairy products, meats, grains, and other essential groceries—delivered straight to your doorstep.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-3">Our Mission</h2>
              <p>
                To revolutionize grocery shopping in Uganda by providing an efficient and reliable online marketplace that guarantees fresh, high-quality products at competitive prices.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-3">Our Vision</h2>
              <p>
                To become Uganda's leading online grocery platform, empowering communities with convenient access to fresh, affordable, and quality food while supporting local farmers and sustainable practices.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Quality</h3>
                <p className="text-sm">We never compromise on the quality of products we deliver to our customers.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Integrity</h3>
                <p className="text-sm">We conduct business with honesty, transparency, and ethical practices.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Innovation</h3>
                <p className="text-sm">We continuously improve our platform and services to better serve our customers.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Community</h3>
                <p className="text-sm">We support local farmers and businesses to strengthen our communities.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Sustainability</h3>
                <p className="text-sm">We promote eco-friendly practices and responsible consumption.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Excellence</h3>
                <p className="text-sm">We strive for excellence in every aspect of our service delivery.</p>
              </div>
            </div>
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
            <h2 className="text-2xl font-semibold text-green-600 mb-6 text-center">Our Commitment</h2>
            <p className="text-center">
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