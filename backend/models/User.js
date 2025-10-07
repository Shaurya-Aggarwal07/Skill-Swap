const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profile_photo: {
    type: String
  },
  is_public: {
    type: Boolean,
    default: true
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  is_banned: {
    type: Boolean,
    default: false
  },
  availability: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema); 