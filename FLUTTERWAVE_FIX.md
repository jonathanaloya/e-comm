# Flutterwave "initialize" Error Fix

## Issue
The error "Cannot read properties of undefined (reading 'initialize')" occurred because:

1. **Wrong Method**: The code was trying to use `flw.Payment.initialize()` which doesn't exist in flutterwave-node-v3
2. **Incorrect API**: Flutterwave v3 uses `flw.Charge()` for hosted payments, not `Payment.initialize()`

## Root Cause
Flutterwave Node.js SDK v3 API structure:
- ✅ `flw.Charge()` - For creating payments
- ❌ `flw.Payment.initialize()` - This method doesn't exist
- ✅ `flw.Transaction.verify()` - For verifying payments

## Changes Made

### 1. Updated Controller (`src/controllers/orderController.js`)

**Before:**
```javascript
const responseData = await flw.Payment.initialize(payload);
```

**After:**
```javascript
const responseData = await flw.Charge(payload);
```

### 2. Updated Payload Structure

**Before:**
```javascript
const payload = {
  tx_ref: tx_ref,
  amount: totalAmt,
  currency: "UGX",
  redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
  // ... other fields
};
```

**After:**
```javascript
const payload = {
  type: "hosted",  // Added: Required for hosted payment
  tx_ref: tx_ref,
  amount: totalAmt,
  currency: "UGX",
  redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
  // ... other fields
};
```

### 3. Updated Response Handling

**Before:**
```javascript
if (responseData.data?.link) {
  return response.json({
    data: responseData.data.link
  });
}
```

**After:**
```javascript
if (responseData.data?.hosted_link) {
  return response.json({
    data: responseData.data.hosted_link  // Changed: Charge returns hosted_link
  });
}
```

### 4. Improved Error Handling

Added proper checks for:
- Flutterwave instance initialization
- Charge method availability
- Detailed error logging

## Testing the Fix

1. **Start your server** and check console logs:
   ```
   Flutterwave initialized successfully
   ```

2. **Test payment flow**:
   - Go to checkout page
   - Click "Pay Online" button
   - Should redirect to Flutterwave hosted page

3. **Check for errors**:
   - No more "initialize" errors in network tab
   - Proper redirect to Flutterwave payment page

## Key Flutterwave v3 Methods

| Purpose | Correct Method | Wrong Method |
|---------|----------------|--------------|
| Create Payment | `flw.Charge(payload)` | ~~`flw.Payment.initialize()`~~ |
| Verify Payment | `flw.Transaction.verify({id})` | ✅ Correct |
| Handle Webhooks | Manual signature verification | ✅ Correct |

## Environment Variables Required

Make sure these are set in your `.env` file:
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
FLUTTERWAVE_WEBHOOK_SECRET=xxxxx
FRONTEND_URL=https://your-domain.com
```

## Next Steps

1. ✅ Fixed the initialize error
2. ✅ Updated payload structure
3. ✅ Fixed response handling
4. 🔄 Test end-to-end payment flow
5. 🔄 Configure webhook URL in Flutterwave dashboard
6. 🔄 Test webhook verification

Your Flutterwave integration should now work correctly without the "initialize" error!