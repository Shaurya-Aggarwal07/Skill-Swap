const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    enum: ['info', 'warning', 'success', 'error']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

module.exports = mongoose.models.AdminMessage || mongoose.model('AdminMessage', adminMessageSchema); 