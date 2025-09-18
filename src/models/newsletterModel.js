import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  unsubscribeDate: {
    type: Date
  },
  preferences: {
    promotions: {
      type: Boolean,
      default: true
    },
    newProducts: {
      type: Boolean,
      default: true
    },
    weeklyDeals: {
      type: Boolean,
      default: true
    },
    tips: {
      type: Boolean,
      default: true
    }
  },
  source: {
    type: String,
    enum: ['website', 'checkout', 'registration', 'manual'],
    default: 'website'
  },
  // Track email engagement
  stats: {
    totalEmailsSent: {
      type: Number,
      default: 0
    },
    totalEmailsOpened: {
      type: Number,
      default: 0
    },
    totalLinksClicked: {
      type: Number,
      default: 0
    },
    lastEmailSent: Date,
    lastEmailOpened: Date,
    lastLinkClicked: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ subscriptionDate: -1 });

// Virtual for engagement rate
newsletterSchema.virtual('engagementRate').get(function() {
  if (this.stats.totalEmailsSent === 0) return 0;
  return (this.stats.totalEmailsOpened / this.stats.totalEmailsSent) * 100;
});

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribeDate = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.unsubscribeDate = undefined;
  return this.save();
};

// Method to update email stats
newsletterSchema.methods.recordEmailSent = function() {
  this.stats.totalEmailsSent += 1;
  this.stats.lastEmailSent = new Date();
  return this.save();
};

newsletterSchema.methods.recordEmailOpened = function() {
  this.stats.totalEmailsOpened += 1;
  this.stats.lastEmailOpened = new Date();
  return this.save();
};

newsletterSchema.methods.recordLinkClicked = function() {
  this.stats.totalLinksClicked += 1;
  this.stats.lastLinkClicked = new Date();
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function(preferences = {}) {
  const query = { isActive: true };
  
  // Filter by preferences if specified
  if (preferences.promotions !== undefined) {
    query['preferences.promotions'] = preferences.promotions;
  }
  if (preferences.newProducts !== undefined) {
    query['preferences.newProducts'] = preferences.newProducts;
  }
  if (preferences.weeklyDeals !== undefined) {
    query['preferences.weeklyDeals'] = preferences.weeklyDeals;
  }
  if (preferences.tips !== undefined) {
    query['preferences.tips'] = preferences.tips;
  }
  
  return this.find(query).sort({ subscriptionDate: -1 });
};

// Static method to get subscription stats
newsletterSchema.statics.getStats = async function() {
  const totalSubscribers = await this.countDocuments({});
  const activeSubscribers = await this.countDocuments({ isActive: true });
  const inactiveSubscribers = await this.countDocuments({ isActive: false });
  
  const recentSubscriptions = await this.countDocuments({
    subscriptionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  
  const engagementStats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        avgEmailsSent: { $avg: '$stats.totalEmailsSent' },
        avgEmailsOpened: { $avg: '$stats.totalEmailsOpened' },
        avgLinksClicked: { $avg: '$stats.totalLinksClicked' },
        totalEmailsSent: { $sum: '$stats.totalEmailsSent' },
        totalEmailsOpened: { $sum: '$stats.totalEmailsOpened' },
        totalLinksClicked: { $sum: '$stats.totalLinksClicked' }
      }
    }
  ]);
  
  const engagement = engagementStats[0] || {
    avgEmailsSent: 0,
    avgEmailsOpened: 0,
    avgLinksClicked: 0,
    totalEmailsSent: 0,
    totalEmailsOpened: 0,
    totalLinksClicked: 0
  };
  
  const overallEngagementRate = engagement.totalEmailsSent > 0 
    ? (engagement.totalEmailsOpened / engagement.totalEmailsSent) * 100 
    : 0;
  
  return {
    totalSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    recentSubscriptions,
    overallEngagementRate,
    ...engagement
  };
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;