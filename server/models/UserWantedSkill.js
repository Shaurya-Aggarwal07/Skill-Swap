const mongoose = require('mongoose');

const userWantedSkillSchema = new mongoose.Schema({
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
  priority_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate skills for the same user
userWantedSkillSchema.index({ user_id: 1, skill_id: 1 }, { unique: true });

module.exports = mongoose.models.UserWantedSkill || mongoose.model('UserWantedSkill', userWantedSkillSchema); 