const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Skill || mongoose.model('Skill', skillSchema); 