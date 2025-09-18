# Flutterwave OTP Not Received - Troubleshooting Guide

## 🔍 **Common Causes & Solutions**

### 1. **Test/Sandbox Environment**
**Issue**: Flutterwave test mode doesn't send real OTPs to real phone numbers.

**Solutions**:
- **Check Environment**: Verify if you're using test or live credentials
- **Test Cards**: Use Flutterwave test card numbers instead of mobile money
- **Switch to Live**: Use live credentials for real transactions

### 2. **Phone Number Format Issues**
**Issue**: Incorrect phone number format prevents OTP delivery.

**Solution**: ✅ **Fixed in code**
```javascript
// We added phone number formatting for Uganda:
// 0772123456 → 256772123456
// +256772123456 → 256772123456
// 772123456 → 256772123456
```

### 3. **Mobile Money Provider Issues**
**Issue**: Different providers (MTN, Airtel) have different OTP mechanisms.

**Common Issues**:
- **MTN Mobile Money**: Requires specific phone number formats
- **Airtel Money**: May have delays or different OTP delivery
- **Network Issues**: Poor network connectivity

### 4. **Flutterwave Configuration**
**Issue**: Missing or incorrect Flutterwave settings.

**Check**:
- Live vs Test API keys
- Webhook configuration
- Payment method settings in dashboard

## 🧪 **Testing Steps**

### Step 1: Check Phone Number Format
1. **Start your server**
2. **Make a payment** and check server logs
3. **Look for**: `formattedPhone` and `originalPhone` in logs
4. **Verify**: Phone number is in format `256XXXXXXXXX`

Example log:
```
Initializing Flutterwave payment with payload: {
  tx_ref: 'FLW-12345678-1634567890',
  amount: 50000,
  currency: 'UGX',
  customer: { email: 'user@example.com', phonenumber: '256772123456', name: 'John Doe' },
  formattedPhone: '256772123456',
  originalPhone: '0772123456'
}
```

### Step 2: Test Different Payment Methods
Instead of mobile money, try these test options:

#### **Test Card Numbers (Always work in sandbox)**
```
Card Number: 4187427415564246
CVV: 828
Expiry: 09/32
Pin: 3310
OTP: 12345
```

#### **Test Mobile Money (Uganda)**
```
Phone: 256772123456
Network: MTN
```

### Step 3: Check Flutterwave Dashboard
1. **Login to Flutterwave Dashboard**
2. **Go to Transactions**
3. **Check transaction status**
4. **Look for error messages**

## 🔧 **Additional Fixes**

### Enable More Payment Options
Update your payment options to include cards:

```javascript
// In your payload
payment_options: "card,mobilemoneyuganda,ussd"
```

This gives users alternatives if mobile money OTP fails.

### Add Payment Method Selection
Let users choose between:
- 💳 **Card Payment** (Always reliable)
- 📱 **Mobile Money** (MTN, Airtel)
- 🏦 **Bank Transfer**

## 🚨 **Quick Workarounds**

### Option 1: Use Test Environment with Test Numbers
```javascript
// For testing, use Flutterwave's test phone numbers
const testPhone = "256772123456"; // This will work in sandbox
```

### Option 2: Switch to Card Payments Temporarily
```javascript
// Prioritize card payments over mobile money
payment_options: "card,mobilemoneyuganda"
```

### Option 3: Add Manual OTP Entry
Allow users to manually enter OTP if they receive it late:
- Add "Didn't receive OTP?" link
- Provide resend OTP option
- Show expected phone number format

## 🔍 **Debugging Commands**

Check your current phone number in the database:
```bash
# In MongoDB shell or your database tool
db.users.findOne({email: "your-email@example.com"}, {mobile: 1})
```

Check Flutterwave transaction logs:
```bash
# Check your server logs for the API call
grep "Flutterwave" your-server.log
```

## 📞 **Uganda Mobile Money Formats**

| Provider | Format | Example |
|----------|--------|---------|
| MTN | 256(77/78)XXXXXXX | 256772123456 |
| Airtel | 256(75/70)XXXXXXX | 256752123456 |
| UTL | 256(71)XXXXXXX | 256712123456 |

## ✅ **What to Try Next**

1. **Check Server Logs**: Look for formatted phone number
2. **Try Test Card**: Use test card instead of mobile money
3. **Verify Environment**: Confirm test vs live mode
4. **Check Phone**: Ensure phone number is correct format
5. **Wait Longer**: Sometimes OTP takes 2-3 minutes
6. **Try Different Network**: Switch between MTN/Airtel
7. **Contact Flutterwave**: If all else fails, contact their support

## 🆘 **Emergency Fallback**

If OTP continues to fail, temporarily disable mobile money and use cards only:

```javascript
// In your payload
payment_options: "card"  // Only cards, no mobile money
```

This ensures users can still make payments while you debug the mobile money OTP issue.

Remember: **Test payments don't send real OTPs to real phones** - this might be the main issue if you're in test mode!