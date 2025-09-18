import SupportTicket from '../models/supportTicketModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

// Create new support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const {
      contactInfo,
      subject,
      category,
      description,
      orderId,
      orderNumber,
      priority,
      attachments
    } = req.body;

    // Validate required fields
    if (!contactInfo?.name || !contactInfo?.email || !subject || !category || !description) {
      return res.status(400).json({
        message: 'Missing required fields: name, email, subject, category, and description are required',
        error: true,
        success: false
      });
    }

    // Get user info if authenticated
    const userId = req.user?._id;
    let userInfo = null;
    if (userId) {
      userInfo = await User.findById(userId);
    }

    // Create ticket data
    const ticketData = {
      userId,
      contactInfo: {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone || userInfo?.mobile
      },
      subject,
      category,
      description,
      priority: priority || 'medium',
      attachments: attachments || []
    };

    // Add order information if provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        ticketData.orderId = orderId;
        ticketData.orderNumber = order.mainOrderId || order.orderId;
      }
    } else if (orderNumber) {
      ticketData.orderNumber = orderNumber;
    }

    // Create the ticket
    const ticket = new SupportTicket(ticketData);
    await ticket.save();

    // Populate references
    await ticket.populate([
      { path: 'userId', select: 'name email' },
      { path: 'orderId', select: 'mainOrderId orderId totalAmount' }
    ]);

    return res.status(201).json({
      message: 'Support ticket created successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Get support tickets (user's own tickets or all for admin)
export const getSupportTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // If not admin, only show user's own tickets
    if (req.user.role !== 'admin') {
      query.$or = [
        { userId: req.user._id },
        { 'contactInfo.email': req.user.email }
      ];
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { ticketId: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { 'contactInfo.name': { $regex: search, $options: 'i' } },
          { 'contactInfo.email': { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [tickets, totalCount] = await Promise.all([
      SupportTicket.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .populate('orderId', 'mainOrderId orderId totalAmount')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    return res.json({
      message: 'Support tickets retrieved successfully',
      error: false,
      success: true,
      data: tickets,
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

// Get single support ticket
export const getSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findOne({ ticketId })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('orderId', 'mainOrderId orderId totalAmount items')
      .populate('messages.senderInfo.adminId', 'name email');

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    // Check if user has permission to view this ticket
    if (req.user.role !== 'admin') {
      const hasAccess = ticket.userId?.toString() === req.user._id.toString() ||
                       ticket.contactInfo.email === req.user.email;
      
      if (!hasAccess) {
        return res.status(403).json({
          message: 'Access denied',
          error: true,
          success: false
        });
      }
    }

    // Mark messages as read based on user type
    const userType = req.user.role === 'admin' ? 'customer' : 'admin';
    if (ticket.messages.some(msg => msg.sender === userType && !msg.isRead)) {
      await ticket.markMessagesAsRead(userType);
    }

    return res.json({
      message: 'Support ticket retrieved successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Add message to support ticket
export const addTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, attachments } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: 'Message content is required',
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      const hasAccess = ticket.userId?.toString() === req.user._id.toString() ||
                       ticket.contactInfo.email === req.user.email;
      
      if (!hasAccess) {
        return res.status(403).json({
          message: 'Access denied',
          error: true,
          success: false
        });
      }
    }

    // Determine sender type and info
    const isAdmin = req.user.role === 'admin';
    const messageData = {
      sender: isAdmin ? 'admin' : 'customer',
      senderInfo: isAdmin ? {
        name: req.user.name,
        email: req.user.email,
        adminId: req.user._id
      } : {
        name: ticket.contactInfo.name,
        email: ticket.contactInfo.email
      },
      message: message.trim(),
      attachments: attachments || []
    };

    await ticket.addMessage(messageData);

    // Populate the updated ticket
    await ticket.populate([
      'userId',
      'assignedTo',
      'messages.senderInfo.adminId'
    ]);

    return res.json({
      message: 'Message added successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Update ticket status (Admin only)
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, resolution } = req.body;

    const validStatuses = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', '),
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    // Update status
    ticket.status = status;

    // Handle resolution
    if (status === 'resolved' && resolution) {
      await ticket.resolve({
        summary: resolution.summary,
        resolvedBy: req.user._id
      });
    }

    await ticket.save();

    return res.json({
      message: 'Ticket status updated successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Assign ticket to admin (Admin only)
export const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminId } = req.body;

    // Verify admin exists
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(400).json({
        message: 'Invalid admin user',
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    await ticket.assignTo(adminId);

    await ticket.populate('assignedTo', 'name email');

    return res.json({
      message: 'Ticket assigned successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Update ticket priority (Admin only)
export const updateTicketPriority = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: 'Invalid priority. Valid priorities: ' + validPriorities.join(', '),
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketId },
      { priority },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    return res.json({
      message: 'Ticket priority updated successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Add internal note (Admin only)
export const addInternalNote = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { note } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({
        message: 'Note content is required',
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    ticket.internalNotes.push({
      note: note.trim(),
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await ticket.save();

    await ticket.populate('internalNotes.addedBy', 'name email');

    return res.json({
      message: 'Internal note added successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Submit ticket feedback (Customer)
export const submitTicketFeedback = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating is required and must be between 1 and 5',
        error: true,
        success: false
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: 'Support ticket not found',
        error: true,
        success: false
      });
    }

    // Check if user has permission
    if (req.user.role !== 'admin') {
      const hasAccess = ticket.userId?.toString() === req.user._id.toString() ||
                       ticket.contactInfo.email === req.user.email;
      
      if (!hasAccess) {
        return res.status(403).json({
          message: 'Access denied',
          error: true,
          success: false
        });
      }
    }

    // Only allow feedback on resolved tickets
    if (ticket.status !== 'resolved') {
      return res.status(400).json({
        message: 'Feedback can only be submitted for resolved tickets',
        error: true,
        success: false
      });
    }

    await ticket.addFeedback(rating, comment);

    return res.json({
      message: 'Feedback submitted successfully',
      error: false,
      success: true,
      data: ticket
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Get support statistics (Admin only)
export const getSupportStats = async (req, res) => {
  try {
    const stats = await SupportTicket.getStats();
    const overdueTickets = await SupportTicket.getOverdueTickets();

    const adminStats = await SupportTicket.aggregate([
      { $match: { assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalTickets: { $sum: 1 },
          avgResolutionTime: { $avg: '$resolution.resolutionTime' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $project: {
          adminName: { $arrayElemAt: ['$admin.name', 0] },
          totalTickets: 1,
          avgResolutionTime: 1
        }
      }
    ]);

    return res.json({
      message: 'Support statistics retrieved successfully',
      error: false,
      success: true,
      data: {
        ...stats,
        overdueCount: overdueTickets.length,
        adminStats
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

// Get support categories and their descriptions
export const getSupportCategories = async (req, res) => {
  try {
    const categories = [
      { 
        id: 'order_inquiry', 
        name: 'Order Inquiry', 
        description: 'Questions about order status, delivery, or general order information' 
      },
      { 
        id: 'delivery_issue', 
        name: 'Delivery Issue', 
        description: 'Problems with delivery timing, location, or delivery process' 
      },
      { 
        id: 'payment_problem', 
        name: 'Payment Problem', 
        description: 'Issues with payment processing, charges, or billing' 
      },
      { 
        id: 'product_quality', 
        name: 'Product Quality', 
        description: 'Concerns about product quality, freshness, or condition' 
      },
      { 
        id: 'account_issue', 
        name: 'Account Issue', 
        description: 'Problems with user account, login, or profile settings' 
      },
      { 
        id: 'technical_support', 
        name: 'Technical Support', 
        description: 'Technical problems with the website or mobile app' 
      },
      { 
        id: 'refund_request', 
        name: 'Refund Request', 
        description: 'Request for refunds or returns' 
      },
      { 
        id: 'general_inquiry', 
        name: 'General Inquiry', 
        description: 'General questions about services, policies, or information' 
      },
      { 
        id: 'complaint', 
        name: 'Complaint', 
        description: 'Formal complaints about service or experience' 
      },
      { 
        id: 'suggestion', 
        name: 'Suggestion', 
        description: 'Suggestions for improvements or new features' 
      }
    ];

    return res.json({
      message: 'Support categories retrieved successfully',
      error: false,
      success: true,
      data: categories
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export default {
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  addTicketMessage,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  addInternalNote,
  submitTicketFeedback,
  getSupportStats,
  getSupportCategories
};