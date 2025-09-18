import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App-specific password for Gmail
    }
  });
};

// Email templates
const getOrderConfirmationTemplate = (order, user, deliveryAddress) => {
  const itemsHtml = order.items?.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.product_details.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">UGX ${item.totalAmt.toLocaleString()}</td>
    </tr>
  `).join('') || '';

  const totalAmount = order.totalAmount || order.items?.reduce((sum, item) => sum + item.totalAmt, 0) || 0;
  const deliveryFee = order.deliveryFee || 0;
  const subtotal = totalAmount - deliveryFee;

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${user.name},</p>
            
            <p>Thank you for your order! We've received your order and are processing it.</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order.mainOrderId || order.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${order.payment_status}</p>
              <p><strong>Order Status:</strong> ${order.order_status || 'Pending'}</p>
            </div>
            
            ${itemsHtml ? `
              <h3>Items Ordered:</h3>
              <table class="table">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            ` : ''}
            
            <div class="order-details">
              <h3>Order Summary:</h3>
              <p><strong>Subtotal:</strong> UGX ${subtotal.toLocaleString()}</p>
              <p><strong>Delivery Fee:</strong> ${deliveryFee === 0 ? 'Free' : `UGX ${deliveryFee.toLocaleString()}`}</p>
              <p><strong>Total Amount:</strong> UGX ${totalAmount.toLocaleString()}</p>
            </div>
            
            ${deliveryAddress ? `
              <div class="order-details">
                <h3>Delivery Address:</h3>
                <p>${deliveryAddress.name}</p>
                <p>${deliveryAddress.address_line}</p>
                <p>${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}</p>
                <p>${deliveryAddress.country}</p>
                <p>Mobile: ${deliveryAddress.mobile}</p>
              </div>
            ` : ''}
            
            <p>We'll notify you when your order is shipped. If you have any questions, please contact our support team.</p>
            
            <p>Thank you for shopping with us!</p>
            
            <p>Best regards,<br>Fresh Katale Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Fresh Katale. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getOrderStatusUpdateTemplate = (order, user, newStatus) => {
  const statusMessages = {
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'processing': 'Your order is being processed and packed.',
    'shipped': 'Your order has been shipped and is on its way!',
    'delivered': 'Your order has been delivered. Thank you for shopping with us!',
    'cancelled': 'Your order has been cancelled. If you have any questions, please contact support.'
  };

  const statusColors = {
    'confirmed': '#2196F3',
    'processing': '#FF9800',
    'shipped': '#9C27B0',
    'delivered': '#4CAF50',
    'cancelled': '#F44336'
  };

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColors[newStatus] || '#4CAF50'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          
          <div class="content">
            <p>Dear ${user.name},</p>
            
            <p>We have an update on your order:</p>
            
            <div class="order-details">
              <h3>Order Information:</h3>
              <p><strong>Order ID:</strong> ${order.mainOrderId || order.orderId}</p>
              <p><strong>New Status:</strong> <span style="color: ${statusColors[newStatus]}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
              <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            
            <p>You can track your order status by logging into your account on our website.</p>
            
            <p>Thank you for choosing Fresh Katale!</p>
            
            <p>Best regards,<br>Fresh Katale Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Fresh Katale. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user, deliveryAddress) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Fresh Katale" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - ${order.mainOrderId || order.orderId}`,
      html: getOrderConfirmationTemplate(order, user, deliveryAddress)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Fresh Katale" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - ${order.mainOrderId || order.orderId} is ${newStatus}`,
      html: getOrderStatusUpdateTemplate(order, user, newStatus)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new users
export const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping welcome email.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const welcomeTemplate = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Fresh Katale!</h1>
            </div>
            
            <div class="content">
              <p>Dear ${user.name},</p>
              
              <p>Welcome to Fresh Katale! We're excited to have you as part of our community.</p>
              
              <p>You can now:</p>
              <ul>
                <li>Browse our fresh products</li>
                <li>Add items to your cart</li>
                <li>Choose from multiple payment options</li>
                <li>Get delivery right to your doorstep</li>
                <li>Track your orders</li>
              </ul>
              
              <p>Start shopping now and enjoy fresh, quality products delivered to you!</p>
              
              <p>If you have any questions, our support team is here to help.</p>
              
              <p>Happy shopping!</p>
              
              <p>Best regards,<br>Fresh Katale Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 Fresh Katale. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Fresh Katale" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Fresh Katale!',
      html: welcomeTemplate
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
};