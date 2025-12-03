# Admin Order Response & Email Notification System

## Overview
This system allows administrators to respond to customer orders and automatically sends email notifications to users when:
1. An admin updates an order status
2. An admin adds a response/message to an order
3. A new order is placed (existing functionality)

## New Features Added

### 1. Order Model Updates
- Added `admin_responses` array to store admin messages
- Each response includes: adminId, adminName, message, and createdAt timestamp

### 2. New Admin Endpoints

#### Update Order Status with Email Notification
```
PATCH /api/admin/orders/:orderId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed|processing|shipped|delivered|cancelled",
  "adminMessage": "Optional message to customer"
}
```

#### Add Admin Response to Order
```
POST /api/admin/orders/:orderId/response
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "Your order is being prepared and will be ready for delivery soon."
}
```

#### Get Order Details with Responses
```
GET /api/admin/orders/:orderId
Authorization: Bearer <admin_token>
```

### 3. Email Templates
- **Order Status Update Email**: Sent when order status changes
- **Admin Response Email**: Sent when admin adds a message to an order
- Both emails are professionally formatted with order details and branding

## How It Works

### For Order Status Updates:
1. Admin calls the status update endpoint
2. Order status is updated in database
3. Email notification is automatically sent to customer
4. If adminMessage is provided, it's also saved and included in email

### For Admin Responses:
1. Admin calls the response endpoint with a message
2. Response is saved to order's admin_responses array
3. Email notification is automatically sent to customer with the message
4. Customer receives a formatted email with the admin's message

### Email Features:
- Professional HTML templates with Fresh Katale branding
- Order details included (Order ID, status, items, etc.)
- Admin name and message clearly displayed
- Responsive design for mobile and desktop
- Automatic fallback if email service is not configured

## Usage Examples

### Example 1: Update Order Status
```javascript
// Admin updates order to "shipped" with a message
const response = await fetch('/api/admin/orders/ORD-12345/status', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'shipped',
    adminMessage: 'Your order has been shipped via DHL. Tracking number: DHL123456789'
  })
});
```

### Example 2: Add Admin Response
```javascript
// Admin sends a message to customer
const response = await fetch('/api/admin/orders/ORD-12345/response', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Thank you for your order! We are preparing your fresh vegetables and they will be delivered within 2 hours.'
  })
});
```

## Email Configuration
Make sure these environment variables are set:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@freshkatale.com (optional, defaults to EMAIL_USER)
```

## Security Features
- All endpoints require admin authentication
- Input validation for status values and messages
- Secure email templates prevent XSS
- Error handling prevents system crashes

## Benefits
1. **Better Customer Communication**: Customers receive immediate updates about their orders
2. **Professional Service**: Automated, branded emails improve customer experience  
3. **Order Tracking**: Customers stay informed about order progress
4. **Admin Efficiency**: Easy to send updates and messages to customers
5. **Email History**: All admin responses are stored for reference

## Integration with Existing System
- Works with existing order management system
- Compatible with current email service setup
- Uses existing authentication and admin middleware
- Maintains all existing functionality

This system enhances customer service by providing timely, professional communication about order status and any special instructions or updates from the admin team.