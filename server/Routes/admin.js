/**
 * Admin Routes
 * 
 * This module handles all admin-specific endpoints including:
 * - User management (view, ban/unban users)
 * - Platform statistics and analytics
 * - Swap request management
 * - Admin message system
 * - Report generation (CSV downloads)
 * 
 * All routes require admin authentication and authorization
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { User, SwapRequest, AdminMessage, Rating } = require('../database/init');

const router = express.Router();

/**
 * Admin Middleware
 * 
 * Apply authentication and admin authorization to all routes in this module
 * - authenticateToken: Verifies JWT token and adds user to req.user
 * - requireAdmin: Ensures user has admin privileges
 */
// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

/**
 * GET /admin/users
 * 
 * Get all users for admin management view
 * Supports pagination, search, and status filtering
 * 
 * Query Parameters:
 * - search: Search users by name, email, or location
 * - status: Filter by 'banned' or 'active' users
 * - page: Page number for pagination (default: 1)
 * - limit: Number of users per page (default: 20)
 * 
 * Response:
 * - 200: List of users with pagination info
 * - 500: Database error
 */
// Get all users (admin view)
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.is_banned = true;
    } else if (status === 'active') {
      query.is_banned = false;
    }

    const users = await User.find(query)
      .select('email name location is_public is_admin is_banned created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * PUT /admin/users/:userId/ban
 * 
 * Ban or unban a user account
 * 
 * URL Parameters:
 * - userId: ID of the user to ban/unban
 * 
 * Request Body:
 * - isBanned: Boolean indicating ban status
 * 
 * Response:
 * - 200: User banned/unbanned successfully
 * - 400: Cannot ban yourself or validation error
 * - 404: User not found
 * - 500: Server error
 */
// Ban/Unban user
router.put('/users/:userId/ban', [
  body('isBanned').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { isBanned } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_banned: isBanned },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const action = isBanned ? 'banned' : 'unbanned';
    res.json({ message: `User ${action} successfully` });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
/**
 * GET /admin/stats
 * 
 * Get platform-wide statistics and analytics
 * 
 * Response:
 * - 200: Platform statistics including user counts, swap stats, ratings
 * - 500: Database error
 */
// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // Get user stats
    stats.totalUsers = await User.countDocuments();
    stats.bannedUsers = await User.countDocuments({ is_banned: true });

    // Get swap stats
    stats.totalSwaps = await SwapRequest.countDocuments();
    stats.acceptedSwaps = await SwapRequest.countDocuments({ status: 'accepted' });
    stats.pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });

    // Get skill stats
    stats.totalSkills = await Skill.countDocuments();

    // Get rating stats
    const ratingStats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    stats.averageRating = ratingStats.length > 0 ? ratingStats[0].average : 0;

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
/**
 * GET /admin/swaps
 * 
 * Get all swap requests for admin management
 * Supports pagination and status filtering
 * 
 * Query Parameters:
 * - status: Filter by swap status (pending, accepted, rejected, cancelled)
 * - page: Page number for pagination (default: 1)
 * - limit: Number of swaps per page (default: 20)
 * 
 * Response:
 * - 200: List of swap requests with pagination info
 * - 500: Database error
 */

// Get swap requests (admin view)
router.get('/swaps', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    const swaps = await SwapRequest.find(query)
      .populate('requester_id', 'name')
      .populate('recipient_id', 'name')
      .populate('offered_skill_id', 'name')
      .populate('requested_skill_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SwapRequest.countDocuments(query);

    // Transform the data to match expected format
    const transformedSwaps = swaps.map(swap => ({
      id: swap._id,
      status: swap.status,
      message: swap.message,
      created_at: swap.created_at,
      updated_at: swap.updated_at,
      requester_name: swap.requester_id.name,
      recipient_name: swap.recipient_id.name,
      offered_skill_name: swap.offered_skill_id.name,
      requested_skill_name: swap.requested_skill_id.name
    }));

    res.json({
      swaps: transformedSwaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create admin message
router.post('/messages', [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('message').trim().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['info', 'warning', 'success', 'error'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type = 'info' } = req.body;

    const adminMessage = await AdminMessage.create({
      title,
      message,
      type
    });

    res.status(201).json({
      message: 'Admin message created successfully',
      messageId: adminMessage._id
    });
  } catch (error) {
    console.error('Create admin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin messages
router.get('/messages', async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (active === 'true') {
      query.is_active = true;
    } else if (active === 'false') {
      query.is_active = false;
    }

    const messages = await AdminMessage.find(query)
      .select('title message type is_active created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AdminMessage.countDocuments(query);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update admin message
router.put('/messages/:messageId', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('message').optional().trim().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['info', 'warning', 'success', 'error']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageId } = req.params;
    const { title, message, type, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.is_active = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const adminMessage = await AdminMessage.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );

    if (!adminMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message updated successfully' });
  } catch (error) {
    console.error('Update admin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete admin message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const adminMessage = await AdminMessage.findByIdAndDelete(messageId);

    if (!adminMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete admin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user activity report (CSV download)
router.get('/reports/user-activity', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activity = await User.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'swaprequests',
          localField: '_id',
          foreignField: 'requester_id',
          as: 'sent_swaps'
        }
      },
      {
        $lookup: {
          from: 'swaprequests',
          localField: '_id',
          foreignField: 'recipient_id',
          as: 'received_swaps'
        }
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'rated_user_id',
          as: 'ratings'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          email: 1,
          location: 1,
          created_at: 1,
          total_swaps: {
            $add: [
              { $size: '$sent_swaps' },
              { $size: '$received_swaps' }
            ]
          },
          accepted_swaps: {
            $add: [
              { $size: { $filter: { input: '$sent_swaps', cond: { $eq: ['$$this.status', 'accepted'] } } } },
              { $size: { $filter: { input: '$received_swaps', cond: { $eq: ['$$this.status', 'accepted'] } } } }
            ]
          },
          total_ratings: { $size: '$ratings' },
          average_rating: { $avg: '$ratings.rating' }
        }
      },
      { $sort: { created_at: -1 } }
    ]);

    // Generate CSV content
    const csvHeader = 'User ID,Name,Email,Location,Join Date,Total Swaps,Accepted Swaps,Total Ratings,Average Rating\n';
    const csvRows = activity.map(user => {
      return [
        user.id,
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.location || ''}"`,
        user.created_at,
        user.total_swaps,
        user.accepted_swaps,
        user.total_ratings,
        user.average_rating ? user.average_rating.toFixed(2) : '0.00'
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="user-activity-report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('User activity report error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get swap statistics report (CSV download)
router.get('/reports/swap-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await SwapRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          total_requests: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Generate CSV content
    const csvHeader = 'Date,Total Requests,Accepted,Rejected,Pending\n';
    const csvRows = stats.map(stat => {
      return [
        stat._id,
        stat.total_requests,
        stat.accepted,
        stat.rejected,
        stat.pending
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="swap-stats-report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Swap stats report error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router; 
