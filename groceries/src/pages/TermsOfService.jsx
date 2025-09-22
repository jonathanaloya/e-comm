import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By using Fresh Katale, you agree to these Terms of Service. If you disagree with any part, please do not use our service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p className="mb-4">Fresh Katale is an online grocery delivery platform serving Uganda. We provide:</p>
          <ul className="list-disc pl-6">
            <li>Online grocery ordering and delivery</li>
            <li>Multiple payment options including Cash on Delivery</li>
            <li>Zone-based delivery across Uganda</li>
            <li>Customer support services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <ul className="list-disc pl-6">
            <li>You must provide accurate information</li>
            <li>Keep your account credentials secure</li>
            <li>You're responsible for all account activity</li>
            <li>One account per person</li>
            <li>Must be 18+ years old to create an account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Orders and Payments</h2>
          <h3 className="text-xl font-medium mb-2">Order Process</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Orders are subject to product availability</li>
            <li>Prices may change without notice</li>
            <li>We reserve the right to cancel orders</li>
            <li>Order confirmation doesn't guarantee acceptance</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">Payment Terms</h3>
          <ul className="list-disc pl-6">
            <li>Payment required before delivery (except COD)</li>
            <li>Cash on Delivery available in select areas</li>
            <li>All prices include applicable taxes</li>
            <li>Delivery fees apply based on location</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Delivery</h2>
          <ul className="list-disc pl-6">
            <li>Delivery times are estimates, not guarantees</li>
            <li>Delivery fees vary by location zone</li>
            <li>Free delivery available on qualifying orders</li>
            <li>You must be available to receive deliveries</li>
            <li>Failed deliveries may incur additional charges</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
          <ul className="list-disc pl-6">
            <li>Perishable items cannot be returned</li>
            <li>Damaged items must be reported within 24 hours</li>
            <li>Refunds processed within 5-7 business days</li>
            <li>Return shipping costs may apply</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
          <p className="mb-4">You may not:</p>
          <ul className="list-disc pl-6">
            <li>Use the service for illegal purposes</li>
            <li>Interfere with service operations</li>
            <li>Create fake accounts or reviews</li>
            <li>Violate intellectual property rights</li>
            <li>Harass other users or staff</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p>Fresh Katale's liability is limited to the order value. We are not liable for indirect, incidental, or consequential damages.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Privacy</h2>
          <p>Your privacy is governed by our Privacy Policy, which is incorporated into these terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
          <p>These terms are governed by the laws of Uganda. Disputes will be resolved in Ugandan courts.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p>For questions about these terms:</p>
          <ul className="list-none mt-2">
            <li>Email: support@freshkatale.com</li>
            <li>Phone: +256 700 000 000</li>
            <li>Address: Kampala, Uganda</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
          <p>We may update these terms. Continued use after changes constitutes acceptance of new terms.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;