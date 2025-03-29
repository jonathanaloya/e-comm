import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const Checkout = () => {
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    const handleCheckout = async () => {
        setLoading(true);

        const { data: clientSecret } = await axios.post('/api/checkout', {
            items: [{ productId: 'productId', price: 100 }],
            userId: 'userId',
            token: { email: 'user@example.com' }
        });

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (result.error) {
            alert(result.error.message);
        } else {
            alert('Payment successful!');
        }

        setLoading(false);
    };

    return (
        <div>
            <h1>Checkout</h1>
            <CardElement />
            <button onClick={handleCheckout} disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
};

export default Checkout;
