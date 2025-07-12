const mongoose = require('mongoose');

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at' }
});


module.exports = mongoose.models.Skill || mongoose.model('Skill', skillSchema); 