import React from 'react'

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">About Fresh Katale</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to Fresh Katale, your go-to online marketplace for fresh, high-quality produce and everyday essentials. We are dedicated to connecting farmers, suppliers, and consumers by providing a seamless shopping experience that guarantees convenience, affordability, and freshness.
          </p>
          <p>
            At Fresh Katale, we believe in supporting local farmers and businesses while ensuring that households have access to nutritious and affordable food. Our platform offers a wide variety of fresh fruits, vegetables, dairy products, meats, grains, and other essential groceries—delivered straight to your doorstep.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-3 text-center">Our Mission</h2>
              <p>
                To revolutionize grocery shopping in Uganda by providing an efficient and reliable online marketplace that guarantees fresh, high-quality products at competitive prices.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-3 text-center">Our Vision</h2>
              <p>
                To become Uganda’s leading online fresh market, fostering a sustainable and thriving food supply chain that benefits both consumers and local producers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Freshness</h3>
                <p className="text-sm">We prioritize delivering farm-fresh and high-quality products.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Convenience</h3>
                <p className="text-sm">Shop from anywhere, anytime, and get your orders delivered to your doorstep.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Affordability</h3>
                <p className="text-sm">We ensure fair prices while supporting local farmers and suppliers.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Reliability</h3>
                <p className="text-sm">We are committed to providing a trustworthy and seamless shopping experience.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Sustainability</h3>
                <p className="text-sm">We support eco-friendly and ethical sourcing practices to promote a healthier planet.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-700 mb-2">Excellence</h3>
                <p className="text-sm">We strive for excellence in every aspect of our service delivery.</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-3 text-center">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Wide Variety of Fresh Produce</h3>
                <p className="text-sm">From fruits and vegetables to meats and dairy, we’ve got you covered.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Seamless Online Shopping</h3>
                <p className="text-sm">Our easy-to-use platform ensures a hassle-free shopping experience.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Fast & Reliable Delivery</h3>
                <p className="text-sm">Get your groceries delivered quickly and conveniently.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Supporting Local Farmers</h3>
                <p className="text-sm">Every purchase contributes to the growth of small-scale farmers and suppliers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs