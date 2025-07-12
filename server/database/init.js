const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

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

// User Skills Offered Schema
const userSkillOfferedSchema = new mongoose.Schema({
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
    type: String
  },
  proficiency_level: {
    type: String,
    default: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced']
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

// User Skills Wanted Schema
const userSkillWantedSchema = new mongoose.Schema({
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
    type: String
  },
  priority_level: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

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

// Rating Schema
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

// Admin Message Schema
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

// Create models
const User = mongoose.model('User', userSchema);
const Skill = mongoose.model('Skill', skillSchema);
const UserSkillOffered = mongoose.model('UserSkillOffered', userSkillOfferedSchema);
const UserSkillWanted = mongoose.model('UserSkillWanted', userSkillWantedSchema);
const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
const Rating = mongoose.model('Rating', ratingSchema);
const AdminMessage = mongoose.model('AdminMessage', adminMessageSchema);

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
        { name: 'Guitar', category: 'Music' },
        { name: 'Piano', category: 'Music' },
        { name: 'Cooking', category: 'Lifestyle' },
        { name: 'Photography', category: 'Creative' },
        { name: 'Spanish', category: 'Language' },
        { name: 'French', category: 'Language' },
        { name: 'German', category: 'Language' },
        { name: 'Yoga', category: 'Fitness' },
        { name: 'Gym Training', category: 'Fitness' },
        { name: 'Drawing', category: 'Art' },
        { name: 'Painting', category: 'Art' },
        { name: 'Sewing', category: 'Craft' }
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
  UserSkillOffered,
  UserSkillWanted,
  SwapRequest,
  Rating,
  AdminMessage
}; 