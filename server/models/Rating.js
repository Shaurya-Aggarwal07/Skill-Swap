const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  swap_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  rater_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

module.exports = mongoose.models.Rating || mongoose.model('Rating', ratingSchema); 