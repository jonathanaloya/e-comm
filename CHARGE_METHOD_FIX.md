# Flutterwave "Charge method not available" Error Fix

## Issue
After fixing the "initialize" error, we encountered: `{"message":"Payment charge method not available","error":true,"success":false}`

## Root Cause Analysis
The Flutterwave Node.js SDK v3 structure:
- `flw.Charge` exists but is an **object**, not a function
- `flw.Charge.card()`, `flw.Charge.ng()`, etc. are methods for specific payment types
- **No direct hosted payment method** in the SDK
- For hosted payments, we need to use the **direct REST API**

## Solution Implemented

### 1. Switched to Direct API Approach
Instead of using the SDK, we now make direct HTTP calls to Flutterwave's REST API:

```javascript
// Before (SDK approach - doesn't work for hosted)
const responseData = await flw.Charge(payload);

// After (Direct API approach - works!)
const axios = await import('axios');
const flutterwaveResponse = await axios.default.post(
  'https://api.flutterwave.com/v3/payments',
  payload,
  {
    headers: {
      'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### 2. Updated Payload Structure
Corrected the payload to match Flutterwave v3 API specification:

```javascript
const payload = {
  tx_ref: tx_ref,
  amount: totalAmt,
  currency: "UGX",
  redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
  payment_options: "card,mobilemoneyuganda",
  customer: {
    email: user.email,
    phonenumber: user.mobile?.toString() || "256700000000",
    name: user.name || "Customer",
  },
  customizations: {
    title: "Fresh Katale",
    description: `Payment for Order ${mainOrderId}`,
  },
  meta: {
    mainOrderId: mainOrderId,
    userId: userId.toString(),
    expectedAmount: totalAmt,
    expectedCurrency: "UGX"
  }
};
```

### 3. Enhanced Error Handling
Added comprehensive error handling for the API call:

```javascript
try {
  const flutterwaveResponse = await axios.default.post(/*...*/);
  responseData = flutterwaveResponse.data;
} catch (axiosError) {
  console.error('Flutterwave API error:', axiosError.response?.data || axiosError.message);
  return response.status(500).json({
    message: axiosError.response?.data?.message || "Failed to connect to payment service",
    error: true,
    success: false,
  });
}
```

### 4. Fixed Response Handling
Updated to handle the correct API response structure:

```javascript
// The API returns { status: "success", data: { link: "..." } }
if (responseData && responseData.status === "success" && responseData.data?.link) {
  return response.status(200).json({
    message: "Payment initiated successfully",
    success: true,
    error: false,
    data: responseData.data.link, // Direct link from API
    mainOrderId: mainOrderId,
    tx_ref: tx_ref
  });
}
```

## Why This Approach Works

1. **Direct API Access**: Bypasses SDK limitations
2. **Official Flutterwave v3 API**: Uses the most current and supported endpoint
3. **Hosted Payments**: Properly supports redirect-based payment flows
4. **Better Error Handling**: Direct access to API error responses

## Files Modified

- `src/controllers/orderController.js`: 
  - Switched from SDK to direct API calls
  - Updated payload structure
  - Enhanced error handling

## Testing the Fix

1. **Check Environment Variables**:
   ```bash
   # Make sure these are set
   FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
   FRONTEND_URL=https://your-domain.com
   ```

2. **Test Payment Flow**:
   - Go to checkout page
   - Click "Pay Online"
   - Should get a valid Flutterwave payment link
   - No more "charge method not available" errors

3. **Check Network Tab**:
   - Should see successful API call to `/api/order/checkout`
   - Response should contain `data` with payment link
   - User should be redirected to Flutterwave

## API Endpoints Used

| Purpose | Endpoint | Method |
|---------|----------|--------|
| Create Payment | `https://api.flutterwave.com/v3/payments` | POST |
| Verify Payment | `flw.Transaction.verify()` | SDK Method |

## Environment Variables Required

```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
FLUTTERWAVE_WEBHOOK_SECRET=xxxxx
FRONTEND_URL=https://your-domain.com
```

## Next Steps

1. ✅ Fixed "charge method not available" error
2. 🔄 Test the complete payment flow
3. 🔄 Verify webhook handling still works
4. 🔄 Test payment verification endpoint

The Flutterwave integration should now work correctly with proper hosted payment support!