import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, email address, phone number</li>
            <li>Delivery addresses and location data</li>
            <li>Payment information (processed securely)</li>
            <li>Order history and preferences</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">Technical Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Cookies and usage analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>Process and fulfill your orders</li>
            <li>Calculate delivery fees and routes</li>
            <li>Send order confirmations and updates</li>
            <li>Provide customer support</li>
            <li>Improve our services and user experience</li>
            <li>Send promotional offers (with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="mb-4">We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6">
            <li>Delivery partners for order fulfillment</li>
            <li>Payment processors for transaction security</li>
            <li>Service providers who assist our operations</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">We implement security measures including:</p>
          <ul className="list-disc pl-6">
            <li>Encrypted data transmission</li>
            <li>Secure payment processing</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <ul className="list-disc pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p className="mb-4">We use cookies to enhance your experience. You can control cookie settings in your browser.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>For privacy concerns, contact us at:</p>
          <ul className="list-none mt-2">
            <li>Email: privacy@freshkatale.com</li>
            <li>Phone: +256 700 000 000</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Updates</h2>
          <p>We may update this policy. Changes will be posted on this page with the updated effective date.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;