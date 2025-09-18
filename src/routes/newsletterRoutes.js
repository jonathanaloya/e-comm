import { Router } from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterPreferences,
  getNewsletterSubscribers,
  getNewsletterStats,
  sendPromotionalEmailCampaign,
  trackEmailEngagement
} from '../controllers/newsletterController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { admin } from '../middleware/admin.js';

const newsletterRouter = Router();

// Public routes
newsletterRouter.post('/subscribe', subscribeToNewsletter);
newsletterRouter.post('/unsubscribe', unsubscribeFromNewsletter);
newsletterRouter.put('/preferences', updateNewsletterPreferences);
newsletterRouter.post('/track-engagement', trackEmailEngagement);

// Admin routes
newsletterRouter.get('/subscribers', authMiddleware, admin, getNewsletterSubscribers);
newsletterRouter.get('/stats', authMiddleware, admin, getNewsletterStats);
newsletterRouter.post('/send-campaign', authMiddleware, admin, sendPromotionalEmailCampaign);

export default newsletterRouter;