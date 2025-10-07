require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models to register them with Mongoose
const User = require('../models/User');
const Skill = require('../models/Skill');
const UserOfferedSkill = require('../models/UserOfferedSkill');
const UserWantedSkill = require('../models/UserWantedSkill');
const SwapRequest = require('../models/SwapRequest');
const Rating = require('../models/Rating');
const AdminMessage = require('../models/AdminMessage');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please make sure MongoDB is running and the connection string is correct');
    process.exit(1);
  }
};

// Initialize database with default data
const initializeDatabase = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@skillswap.com' });
    if (!adminExists) {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        email: 'admin@skillswap.com',
        password: adminPassword,
        name: 'Admin User',
        is_admin: true
      });
      console.log('Admin user created');
    }

    // Check if default skills exist
    const skillsCount = await Skill.countDocuments();
    if (skillsCount === 0) {
      const defaultSkills = [
        { name: 'JavaScript', category: 'Programming' },
        { name: 'Python', category: 'Programming' },
        { name: 'React', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'Photoshop', category: 'Design' },
        { name: 'Excel', category: 'Office' },
        { name: 'Word', category: 'Office' },
        { name: 'PowerPoint', category: 'Office' },
        { name: 'ML', category: 'Ai' },
        { name: 'Angular', category: 'Frontend' },
        { name: 'NextJs', category: 'Frontend' },
        { name: 'Vue.js', category: 'Frontend' },
        { name: 'Django', category: 'Backend' },
        { name: 'Flask', category: 'Backend' },
        { name: 'SQL', category: 'Database' },
        { name: 'MongoDB', category: 'Database' },
        { name: 'Git', category: 'DevOps' },
        { name: 'Docker', category: 'DevOps' },
        { name: 'Figma', category: 'Design' },
        { name: 'Canva', category: 'Design' },
      ];
      await Skill.insertMany(defaultSkills);
      console.log('Default skills created');
    }
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = {
  connectDB,
  initializeDatabase,
  User,
  Skill,
  UserOfferedSkill,
  UserWantedSkill,
  SwapRequest,
  Rating,
  AdminMessage
}; 