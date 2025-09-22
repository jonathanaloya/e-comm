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

// Send promotional email
export const sendPromotionalEmail = async (users, promoData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping promotional email.');
      return { success: false, message: 'Email service not configured' };
    }

    const { title, description, discount, validUntil, promoCode, imageUrl } = promoData;

    const promotionalTemplate = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: #FF6B35; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .promo-box { background: linear-gradient(135deg, #FFE6E6, #FFF0F0); border: 2px dashed #FF6B35; padding: 30px; margin: 20px 0; text-align: center; border-radius: 10px; }
            .promo-code { font-size: 32px; font-weight: bold; color: #FF6B35; background: white; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 15px 0; letter-spacing: 2px; }
            .cta-button { background: #FF6B35; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px; margin: 20px 0; }
            .discount-badge { font-size: 48px; font-weight: bold; color: #FF6B35; margin: 10px 0; }
            .validity { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ${title}</h1>
              <p style="font-size: 18px; margin: 10px 0;">Special offer just for you!</p>
            </div>
            
            <div class="content">
              ${imageUrl ? `<div style="text-align: center; margin: 20px 0;"><img src="${imageUrl}" alt="Promotion" style="max-width: 100%; height: auto; border-radius: 10px;"></div>` : ''}
              
              <p style="font-size: 18px; text-align: center;">${description}</p>
              
              <div class="promo-box">
                <div class="discount-badge">${discount}% OFF</div>
                <h2 style="color: #FF6B35; margin: 15px 0;">Save Big on Your Next Order!</h2>
                ${promoCode ? `
                  <p style="margin: 20px 0;">Use this exclusive promo code:</p>
                  <div class="promo-code">${promoCode}</div>
                  <p style="font-size: 14px; color: #666; margin: 10px 0;">Copy and paste at checkout</p>
                ` : ''}
                
                <div class="validity">
                  <p><strong>⏰ Valid Until:</strong> ${validUntil}</p>
                  <p style="font-size: 14px; color: #666;">Don't miss out on this limited-time offer!</p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">🛒 SHOP NOW</a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Why Choose Fresh Katale?</h3>
                <ul style="text-align: left; color: #555;">
                  <li>🥬 Fresh, quality products</li>
                  <li>🚚 Fast delivery to your doorstep</li>
                  <li>💰 Best prices guaranteed</li>
                  <li>📞 24/7 customer support</li>
                </ul>
              </div>
              
              <p style="font-size: 12px; color: #666; margin: 30px 0 0 0;">*Terms and conditions apply. Cannot be combined with other offers. Valid for one-time use per customer.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 Fresh Katale. All rights reserved.</p>
              <p>You're receiving this email because you subscribed to our newsletter.</p>
              <p><a href="#" style="color: #666;">Unsubscribe</a> | <a href="#" style="color: #666;">Update Preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const transporter = createTransporter();
    const results = [];
    
    // Send emails in batches to avoid rate limiting
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchPromises = batch.map(user => {
        const mailOptions = {
          from: `"Fresh Katale Offers" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `🎉 ${title} - Save ${discount}%!`,
          html: promotionalTemplate
        };
        
        return transporter.sendMail(mailOptions)
          .then(result => ({ user: user.email, success: true, messageId: result.messageId }))
          .catch(error => ({ user: user.email, success: false, error: error.message }));
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`Promotional emails sent: ${successCount}/${users.length}`);
    
    return { success: true, results, successCount, totalCount: users.length };
  } catch (error) {
    console.error('Error sending promotional emails:', error);
    return { success: false, error: error.message };
  }
};

// Send newsletter subscription confirmation
export const sendNewsletterConfirmation = async (email, name) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping newsletter confirmation.');
      return { success: false, message: 'Email service not configured' };
    }

    const confirmationTemplate = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .welcome-box { background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Newsletter Subscription Confirmed!</h1>
            </div>
            
            <div class="content">
              <p>Hello ${name || 'Valued Customer'},</p>
              
              <div class="welcome-box">
                <h2>🎉 You're all set!</h2>
                <p>You've successfully subscribed to the Fresh Katale newsletter.</p>
              </div>
              
              <p>You'll now receive:</p>
              <ul>
                <li>🎯 Exclusive offers and discounts</li>
                <li>🆕 New product announcements</li>
                <li>📈 Weekly deals and promotions</li>
                <li>🍎 Fresh tips and recipes</li>
              </ul>
              
              <p>We promise to keep your inbox interesting with valuable content and great deals!</p>
              
              <p>Best regards,<br>Fresh Katale Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 Fresh Katale. All rights reserved.</p>
              <p><a href="#" style="color: #666;">Unsubscribe</a> at any time</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Fresh Katale" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '📧 Newsletter Subscription Confirmed - Fresh Katale',
      html: confirmationTemplate
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Newsletter confirmation email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending newsletter confirmation:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification for new orders
export const sendAdminOrderNotification = async (order, user, deliveryAddress) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping admin notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.product_details.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">UGX ${item.totalAmt.toLocaleString()}</td>
      </tr>
    `).join('') || '';

    const totalAmount = order.totalAmount || order.items?.reduce((sum, item) => sum + item.totalAmt, 0) || 0;
    const deliveryFee = order.deliveryFee || 0;
    const distance = deliveryAddress?.distance ? `${Math.ceil(deliveryAddress.distance)}km` : 'N/A';
    const coordinates = deliveryAddress?.coordinates ? 
      `https://maps.google.com/maps?q=${deliveryAddress.coordinates.lat},${deliveryAddress.coordinates.lng}` : null;

    const adminTemplate = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
            .urgent { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
            .content { padding: 20px; }
            .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .location-box { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 NEW ORDER RECEIVED</h1>
              <p>Immediate Action Required</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <h3>⚡ URGENT: New Order for Delivery</h3>
                <p><strong>Order ID:</strong> ${order.mainOrderId || order.orderId}</p>
                <p><strong>Payment Method:</strong> ${order.payment_status}</p>
                <p><strong>Order Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              </div>
              
              <div class="order-details">
                <h3>Customer Information:</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${deliveryAddress?.mobile || 'Not provided'}</p>
              </div>
              
              <div class="location-box">
                <h3>📍 Delivery Location & Distance:</h3>
                <p><strong>Address:</strong> ${deliveryAddress?.address_line || 'Not provided'}</p>
                <p><strong>City:</strong> ${deliveryAddress?.city || 'Not provided'}</p>
                <p><strong>Distance from Store:</strong> ${distance}</p>
                <p><strong>Delivery Fee:</strong> UGX ${deliveryFee.toLocaleString()}</p>
                ${coordinates ? `<p><strong>📍 View on Map:</strong> <a href="${coordinates}" target="_blank">Open in Google Maps</a></p>` : ''}
              </div>
              
              ${itemsHtml ? `
                <h3>Items to Prepare:</h3>
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
                <h3>💰 Order Summary:</h3>
                <p><strong>Subtotal:</strong> UGX ${(totalAmount - deliveryFee).toLocaleString()}</p>
                <p><strong>Delivery Fee:</strong> UGX ${deliveryFee.toLocaleString()}</p>
                <p><strong>Total Amount:</strong> UGX ${totalAmount.toLocaleString()}</p>
              </div>
              
              <div class="urgent">
                <h3>⏰ Next Steps:</h3>
                <ol>
                  <li>Prepare the items listed above</li>
                  <li>Contact customer at ${deliveryAddress?.mobile || user.email}</li>
                  <li>Arrange delivery to the specified location</li>
                  <li>Update order status in admin panel</li>
                </ol>
              </div>
            </div>
            
            <div class="footer">
              <p>Fresh Katale Admin System - Order Management</p>
              <p>This is an automated notification for new orders</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Fresh Katale System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🚨 NEW ORDER: ${order.mainOrderId || order.orderId} - ${order.payment_status} - UGX ${totalAmount.toLocaleString()}`,
      html: adminTemplate
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin order notification sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending admin order notification:', error);
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
