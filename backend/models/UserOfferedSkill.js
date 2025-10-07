const mongoose = require('mongoose');

const userOfferedSkillSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  proficiency_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate skills for the same user
userOfferedSkillSchema.index({ user_id: 1, skill_id: 1 }, { unique: true });

module.exports = mongoose.models.UserOfferedSkill || mongoose.model('UserOfferedSkill', userOfferedSkillSchema); 