# Flutterwave Payment Integration Guide

## Overview
This document outlines the complete Flutterwave payment integration for the e-commerce platform, including setup, configuration, and troubleshooting.

## Features Implemented
- ✅ Online payment processing via Flutterwave
- ✅ Cash on Delivery (COD) option
- ✅ Payment verification and webhook handling
- ✅ Cart clearing after successful payment
- ✅ Comprehensive error handling and logging
- ✅ Loading states and user feedback
- ✅ Payment status page with retry options

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-public-key-here
FLUTTERWAVE_SECRET_KEY=FLWSECK-your-secret-key-here
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret-hash-here

# Frontend URL for redirects
FRONTEND_URL=https://your-frontend-domain.com

# Other required variables
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET_KEY=your-jwt-secret
PORT=5000
```

## Backend Implementation

### Key Files Modified:
1. **`src/controllers/orderController.js`**
   - `paymentController` - Initiates Flutterwave payment
   - `verifyPaymentController` - Verifies payment status
   - `webhookFlutterwaveController` - Handles Flutterwave webhooks
   - `CashOnDeliveryOrderController` - Handles COD orders

2. **`src/routes/orderRoutes.js`**
   - GET `/api/order/verify-payment` - Payment verification endpoint
   - POST `/api/order/checkout` - Payment initiation endpoint
   - POST `/api/order/webhook` - Webhook endpoint with signature verification
   - POST `/api/order/cash-on-delivery` - COD endpoint

3. **`src/config/flutterwave.js`**
   - Flutterwave SDK configuration

### Payment Flow:
1. User initiates payment on checkout page
2. Backend creates order records and calls Flutterwave API
3. User is redirected to Flutterwave payment page
4. After payment, user is redirected back to `/payment-status`
5. Frontend calls verification endpoint
6. Backend verifies with Flutterwave and updates order status
7. Cart is cleared and user sees success/failure page

## Frontend Implementation

### Key Files Modified:
1. **`groceries/src/pages/CheckoutPage.jsx`**
   - Improved loading states and error handling
   - Better user feedback during payment process
   - Disabled buttons during processing

2. **`groceries/src/components/Flutterwave.jsx`**
   - Updated error handling and API calls
   - Consistent environment variable usage

3. **`groceries/src/pages/PaymentStatus.jsx`** (New)
   - Dedicated page for handling payment redirects
   - Automatic payment verification
   - User-friendly status display with retry options

### Payment Status Page Features:
- Loading state during verification
- Success state with auto-redirect
- Failed state with retry option
- Cancelled state with retry option
- Error state with retry option

## Webhook Configuration

### Flutterwave Dashboard Setup:
1. Go to your Flutterwave Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://your-backend-domain.com/api/order/webhook`
4. Select events: `charge.completed`
5. Set webhook secret hash in environment variables

### Webhook Security:
- Signature verification using HMAC SHA256
- Raw body parsing for accurate signature validation
- Environment variable for webhook secret

## Testing

### Test Payment Flow:
1. Add items to cart
2. Proceed to checkout
3. Select shipping address
4. Choose "Pay Online"
5. Complete payment on Flutterwave
6. Verify redirect to success page
7. Check order status in database

### Test COD Flow:
1. Add items to cart
2. Proceed to checkout
3. Select shipping address
4. Choose "Cash on Delivery"
5. Verify order creation and cart clearing

## Troubleshooting

### Common Issues:

1. **Payment verification fails**
   - Check environment variables are set correctly
   - Verify API endpoints are accessible
   - Check authentication tokens

2. **Webhook not receiving events**
   - Verify webhook URL is publicly accessible
   - Check webhook secret hash matches
   - Ensure HTTPS for production

3. **Cart not clearing after payment**
   - Check webhook handler is updating orders correctly
   - Verify user authentication in frontend

4. **CORS errors**
   - Ensure frontend URL is in allowed origins
   - Check CORS configuration in server.js

### Debugging Tips:
- Check browser console for frontend errors
- Monitor server logs for backend errors
- Use Flutterwave dashboard to track transactions
- Test webhook endpoints using tools like ngrok for local development

## Security Considerations

1. **Environment Variables**: Never expose secret keys in frontend code
2. **Webhook Security**: Always verify webhook signatures
3. **Amount Validation**: Verify payment amounts match expected values
4. **User Authentication**: Ensure users can only access their own orders
5. **HTTPS**: Use HTTPS in production for all payment-related endpoints

## Production Deployment Checklist

- [ ] Update environment variables for production
- [ ] Configure webhook URL in Flutterwave dashboard
- [ ] Test payment flow end-to-end
- [ ] Verify webhook signature validation
- [ ] Test error scenarios (failed payments, network issues)
- [ ] Monitor logs for any issues
- [ ] Set up payment notification emails (optional)

## Support

For issues related to:
- **Flutterwave Integration**: Check Flutterwave documentation
- **Backend Issues**: Review server logs and database connections
- **Frontend Issues**: Check browser console and network requests
- **Webhook Issues**: Verify URL accessibility and signature validation

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/order/checkout` | Initiate Flutterwave payment |
| GET | `/api/order/verify-payment` | Verify payment status |
| POST | `/api/order/webhook` | Handle Flutterwave webhooks |
| POST | `/api/order/cash-on-delivery` | Process COD orders |
| GET | `/api/order/order-list` | Get user's orders |

All endpoints require authentication via JWT token except the webhook endpoint.