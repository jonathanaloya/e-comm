import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous tickets
  },
  // Contact information for anonymous users
  contactInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      trim: true
    }
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: [
      'order_inquiry',
      'delivery_issue', 
      'payment_problem',
      'product_quality',
      'account_issue',
      'technical_support',
      'refund_request',
      'general_inquiry',
      'complaint',
      'suggestion'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
    default: 'open'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  // Related order information
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderNumber: {
    type: String
  },
  // File attachments
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Ticket conversation
  messages: [{
    messageId: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['customer', 'admin'],
      required: true
    },
    senderInfo: {
      name: String,
      email: String,
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    attachments: [{
      filename: String,
      url: String,
      fileType: String,
      fileSize: Number
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Assignment information
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  assignedAt: Date,
  // Resolution information
  resolution: {
    summary: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionTime: Number // Time taken to resolve in minutes
  },
  // Customer satisfaction
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  // Metadata
  tags: [String],
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tracking
  lastCustomerReply: Date,
  lastAdminReply: Date,
  responseTime: Number, // First response time in minutes
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: Date,
  escalatedReason: String
}, {
  timestamps: true
});

// Indexes for performance
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ 'contactInfo.email': 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Generate ticket ID
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketId) {
    const count = await this.constructor.countDocuments({});
    this.ticketId = `TKT-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for unread messages count
supportTicketSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(msg => !msg.isRead && msg.sender === 'customer').length;
});

// Virtual for latest message
supportTicketSchema.virtual('latestMessage').get(function() {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual for ticket age
supportTicketSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Methods
supportTicketSchema.methods.addMessage = function(messageData) {
  const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const message = {
    messageId,
    sender: messageData.sender,
    senderInfo: messageData.senderInfo,
    message: messageData.message,
    attachments: messageData.attachments || [],
    timestamp: new Date(),
    isRead: false
  };

  this.messages.push(message);
  
  // Update last reply timestamps
  if (messageData.sender === 'customer') {
    this.lastCustomerReply = new Date();
    if (this.status === 'waiting_customer') {
      this.status = 'open';
    }
  } else {
    this.lastAdminReply = new Date();
    
    // Calculate response time for first admin response
    if (!this.responseTime && this.messages.filter(m => m.sender === 'admin').length === 1) {
      this.responseTime = Math.floor((Date.now() - this.createdAt) / (1000 * 60)); // in minutes
    }
  }

  return this.save();
};

supportTicketSchema.methods.markMessagesAsRead = function(sender) {
  this.messages.forEach(msg => {
    if (msg.sender !== sender && !msg.isRead) {
      msg.isRead = true;
    }
  });
  return this.save();
};

supportTicketSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.assignedAt = new Date();
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  return this.save();
};

supportTicketSchema.methods.resolve = function(resolutionData) {
  this.status = 'resolved';
  this.resolution = {
    summary: resolutionData.summary,
    resolvedBy: resolutionData.resolvedBy,
    resolvedAt: new Date(),
    resolutionTime: Math.floor((Date.now() - this.createdAt) / (1000 * 60)) // in minutes
  };
  return this.save();
};

supportTicketSchema.methods.escalate = function(reason) {
  this.isEscalated = true;
  this.escalatedAt = new Date();
  this.escalatedReason = reason;
  this.priority = 'high';
  return this.save();
};

supportTicketSchema.methods.addFeedback = function(rating, comment) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date()
  };
  return this.save();
};

// Static methods
supportTicketSchema.statics.getStats = async function() {
  const totalTickets = await this.countDocuments({});
  const openTickets = await this.countDocuments({ status: { $in: ['open', 'in_progress'] } });
  const resolvedTickets = await this.countDocuments({ status: 'resolved' });
  const avgResolutionTime = await this.aggregate([
    { $match: { 'resolution.resolutionTime': { $exists: true } } },
    { $group: { _id: null, avgTime: { $avg: '$resolution.resolutionTime' } } }
  ]);

  const categoryStats = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const priorityStats = await this.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  return {
    totalTickets,
    openTickets,
    resolvedTickets,
    avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
    categoryStats,
    priorityStats,
    resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0
  };
};

supportTicketSchema.statics.getOverdueTickets = function() {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.find({
    status: { $in: ['open', 'in_progress'] },
    createdAt: { $lt: cutoffTime }
  }).populate('assignedTo', 'name email');
};

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;