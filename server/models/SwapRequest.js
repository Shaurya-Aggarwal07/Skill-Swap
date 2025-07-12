const mongoose = require('mongoose');

// Swap Request Schema
const swapRequestSchema = new mongoose.Schema({
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offered_skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    requested_skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected']
    },
    message: {
      type: String
    }
  }, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  });

module.exports = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);