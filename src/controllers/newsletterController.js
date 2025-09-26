import Newsletter from '../models/newsletterModel.js';
import User from '../models/userModel.js';
import { sendNewsletterConfirmation, sendPromotionalEmail } from '../services/emailService.js';

// Subscribe to newsletter
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name, preferences, source } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: true,
        success: false
      });
    }

    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({
          message: 'Email is already subscribed to newsletter',
          error: true,
          success: false
        });
      } else {
        // Reactivate subscription
        subscriber.isActive = true;
        subscriber.unsubscribeDate = undefined;
        if (name) subscriber.name = name;
        if (preferences) subscriber.preferences = { ...subscriber.preferences, ...preferences };
        if (source) subscriber.source = source;
        
        await subscriber.save();
        
        // Send confirmation email
        await sendNewsletterConfirmation(email, name);
        
        return res.json({
          message: 'Newsletter subscription reactivated successfully',
          error: false,
          success: true,
          data: subscriber
        });
      }
    }

    // Create new subscription
    const newSubscriber = new Newsletter({
      email: email.toLowerCase(),
      name,
      preferences: preferences || {},
      source: source || 'website'
    });

    await newSubscriber.save();

    // Send confirmation email
    await sendNewsletterConfirmation(email, name);

    return res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      error: false,
      success: true,
      data: newSubscriber
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: true,
        success: false
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        message: 'Email not found in newsletter subscriptions',
        error: true,
        success: false
      });
    }

    await subscriber.unsubscribe();

    return res.json({
      message: 'Successfully unsubscribed from newsletter',
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Update newsletter preferences
export const updateNewsletterPreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: true,
        success: false
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        message: 'Email not found in newsletter subscriptions',
        error: true,
        success: false
      });
    }

    subscriber.preferences = { ...subscriber.preferences, ...preferences };
    await subscriber.save();

    return res.json({
      message: 'Newsletter preferences updated successfully',
      error: false,
      success: true,
      data: subscriber
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Get newsletter subscribers (Admin only)
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, preferences } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build preferences filter with safe parsing
    const prefFilter = {};
    if (preferences) {
      try {
        // Validate JSON string before parsing
        if (typeof preferences === 'string' && preferences.length < 1000) {
          const prefObj = JSON.parse(preferences);
          // Only allow specific preference keys to prevent injection
          const allowedKeys = ['promotions', 'newsletters', 'updates', 'offers'];
          Object.keys(prefObj).forEach(key => {
            if (allowedKeys.includes(key) && typeof prefObj[key] === 'boolean') {
              prefFilter[`preferences.${key}`] = prefObj[key];
            }
          });
          Object.assign(query, prefFilter);
        }
      } catch (parseError) {
        return res.status(400).json({
          message: 'Invalid preferences format',
          error: true,
          success: false
        });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [subscribers, totalCount] = await Promise.all([
      Newsletter.find(query)
        .sort({ subscriptionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Newsletter.countDocuments(query)
    ]);

    return res.json({
      message: 'Newsletter subscribers retrieved successfully',
      error: false,
      success: true,
      data: subscribers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Get newsletter statistics (Admin only)
export const getNewsletterStats = async (req, res) => {
  try {
    const stats = await Newsletter.getStats();

    return res.json({
      message: 'Newsletter statistics retrieved successfully',
      error: false,
      success: true,
      data: stats
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Send promotional email (Admin only)
export const sendPromotionalEmailCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      discount,
      validUntil,
      promoCode,
      imageUrl,
      targetPreferences,
      recipientType = 'newsletter' // 'newsletter', 'users', 'both'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required',
        error: true,
        success: false
      });
    }

    let recipients = [];

    // Get newsletter subscribers
    if (recipientType === 'newsletter' || recipientType === 'both') {
      const preferences = targetPreferences ? { promotions: true, ...targetPreferences } : { promotions: true };
      const newsletterSubscribers = await Newsletter.getActiveSubscribers(preferences);
      recipients = recipients.concat(newsletterSubscribers.map(sub => ({
        email: sub.email,
        name: sub.name,
        source: 'newsletter'
      })));
    }

    // Get registered users
    if (recipientType === 'users' || recipientType === 'both') {
      const users = await User.find({ 
        email: { $exists: true },
        // Only include users not already in newsletter to avoid duplicates
        email: { $nin: recipients.map(r => r.email) }
      }).select('email name');
      
      recipients = recipients.concat(users.map(user => ({
        email: user.email,
        name: user.name,
        source: 'user'
      })));
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        message: 'No recipients found matching the criteria',
        error: true,
        success: false
      });
    }

    // Send promotional emails
    const promoData = {
      title,
      description,
      discount,
      validUntil,
      promoCode,
      imageUrl
    };

    const result = await sendPromotionalEmail(recipients, promoData);

    // Update email stats for newsletter subscribers
    for (const recipient of recipients) {
      if (recipient.source === 'newsletter') {
        const subscriber = await Newsletter.findOne({ email: recipient.email });
        if (subscriber) {
          await subscriber.recordEmailSent();
        }
      }
    }

    return res.json({
      message: 'Promotional email campaign sent successfully',
      error: false,
      success: true,
      data: {
        totalRecipients: recipients.length,
        successCount: result.successCount,
        failureCount: recipients.length - result.successCount,
        campaignDetails: promoData
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Track email engagement (for analytics)
export const trackEmailEngagement = async (req, res) => {
  try {
    const { email, action } = req.body; // action: 'open', 'click'

    if (!email || !action) {
      return res.status(400).json({
        message: 'Email and action are required',
        error: true,
        success: false
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      switch (action) {
        case 'open':
          await subscriber.recordEmailOpened();
          break;
        case 'click':
          await subscriber.recordLinkClicked();
          break;
        default:
          return res.status(400).json({
            message: 'Invalid action. Use "open" or "click"',
            error: true,
            success: false
          });
      }

      return res.json({
        message: 'Email engagement tracked successfully',
        error: false,
        success: true
      });
    }

    // Even if not a newsletter subscriber, we can return success
    // to avoid revealing subscription status
    return res.json({
      message: 'Engagement tracked',
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Auto-subscribe users during registration
export const autoSubscribeUser = async (email, name) => {
  try {
    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!existingSubscriber) {
      const newSubscriber = new Newsletter({
        email: email.toLowerCase(),
        name,
        source: 'registration'
      });
      
      await newSubscriber.save();
      
      // Send welcome email is handled by the user registration process
      console.log(`Auto-subscribed ${email} to newsletter`);
      return { success: true, subscriber: newSubscriber };
    }
    
    return { success: true, message: 'Already subscribed' };
  } catch (error) {
    console.error('Error auto-subscribing user to newsletter:', error);
    return { success: false, error: error.message };
  }
};

export default {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterPreferences,
  getNewsletterSubscribers,
  getNewsletterStats,
  sendPromotionalEmailCampaign,
  trackEmailEngagement,
  autoSubscribeUser
};