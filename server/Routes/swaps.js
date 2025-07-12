const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkNotBanned } = require('../middleware/auth');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const UserSkillOffered = require('../models/UserOfferedSkill');
const Rating = require('../models/Rating');

const router = express.Router();

// Create a new swap request
router.post('/', authenticateToken, checkNotBanned, [
  body('recipientId').isMongoId(),
  body('offeredSkillId').isMongoId(),
  body('requestedSkillId').isMongoId(),
  body('message').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, offeredSkillId, requestedSkillId, message } = req.body;
    const requesterId = req.user.id;

    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'Cannot create swap request with yourself' });
    }

    // Check if recipient exists and is not banned
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (recipient.is_banned) {
      return res.status(403).json({ error: 'Cannot create swap request with banned user' });
    }

    // Check if requester has the offered skill
    const offeredSkill = await UserSkillOffered.findOne({
      user_id: requesterId,
      skill_id: offeredSkillId
    });

    if (!offeredSkill) {
      return res.status(400).json({ error: 'You do not have the offered skill' });
    }

    // Check if recipient has the requested skill
    const requestedSkill = await UserSkillOffered.findOne({
      user_id: recipientId,
      skill_id: requestedSkillId
    });

    if (!requestedSkill) {
      return res.status(400).json({ error: 'Recipient does not have the requested skill' });
    }

    // Check if there's already a pending request between these users
    const existing = await SwapRequest.findOne({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have a pending swap request with this user' });
    }

    // Create the swap request
    const swapRequest = await SwapRequest.create({
      requester_id: requesterId,
      recipient_id: recipientId,
      offered_skill_id: offeredSkillId,
      requested_skill_id: requestedSkillId,
      message
    });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapId: swapRequest._id
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's swap requests (sent and received)
router.get('/my-requests', authenticateToken, checkNotBanned, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { requester_id: userId },
        { recipient_id: userId }
      ]
    };

    if (type === 'sent') {
      query = { requester_id: userId };
    } else if (type === 'received') {
      query = { recipient_id: userId };
    }

    if (status) {
      query.status = status;
    }

    const [requests, total] = await Promise.all([
      SwapRequest.find(query)
        .populate('requester_id', 'name')
        .populate('recipient_id', 'name')
        .populate('offered_skill_id', 'name')
        .populate('requested_skill_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SwapRequest.countDocuments(query)
    ]);

    // Transform the data to match expected format
    const transformedRequests = requests.map(req => ({
      id: req._id,
      status: req.status,
      message: req.message,
      created_at: req.created_at,
      updated_at: req.updated_at,
      requester_id: req.requester_id._id,
      recipient_id: req.recipient_id._id,
      requester_name: req.requester_id.name,
      recipient_name: req.recipient_id.name,
      offered_skill_name: req.offered_skill_id.name,
      requested_skill_name: req.requested_skill_id.name
    }));

    res.json({ 
      requests: transformedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Accept a swap request
router.put('/:swapId/accept', authenticateToken, checkNotBanned, async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.recipient_id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only accept requests sent to you' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Can only accept pending requests' });
    }

    swap.status = 'accepted';
    await swap.save();

    res.json({ message: 'Swap request accepted successfully' });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject a swap request
router.put('/:swapId/reject', authenticateToken, checkNotBanned, async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.recipient_id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only reject requests sent to you' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Can only reject pending requests' });
    }

    swap.status = 'rejected';
    await swap.save();

    res.json({ message: 'Swap request rejected successfully' });
  } catch (error) {
    console.error('Reject swap request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a swap request
router.delete('/:swapId', authenticateToken, checkNotBanned, async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.requester_id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only cancel requests you sent' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    await SwapRequest.findByIdAndDelete(swapId);

    res.json({ message: 'Swap request cancelled successfully' });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate a completed swap
router.post('/:swapId/rate', authenticateToken, checkNotBanned, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { swapId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only rate completed swaps' });
    }

    // Determine which user to rate
    let ratedUserId;
    if (swap.requester_id.toString() === userId) {
      ratedUserId = swap.recipient_id;
    } else if (swap.recipient_id.toString() === userId) {
      ratedUserId = swap.requester_id;
    } else {
      return res.status(403).json({ error: 'You can only rate users involved in this swap' });
    }

    // Check if user already rated this swap
    const existingRating = await Rating.findOne({
      swap_id: swapId,
      rater_id: userId
    });

    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this swap' });
    }

    // Create rating
    await Rating.create({
      swap_id: swapId,
      rater_id: userId,
      rated_user_id: ratedUserId,
      rating,
      feedback
    });

    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rate swap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 