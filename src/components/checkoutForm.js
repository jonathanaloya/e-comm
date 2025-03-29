import React from 'react';

const CheckoutForm = ({ onSubmit }) => {
    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>Card Details</label>
                <CardElement />
            </div>
            <button type="submit">Pay Now</button>
        </form>
    );
};

export default CheckoutForm;
