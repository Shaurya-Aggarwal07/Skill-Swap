const jwt = require('jsonwebtoken');
const { User } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is not banned
const checkNotBanned = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('is_banned');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }
    
    next();
  } catch (error) {
    console.error('Check not banned error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Middleware to check if user exists and is not banned
const checkUserExists = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const user = await User.findById(userId).select('is_banned');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_banned) {
      return res.status(403).json({ error: 'This user account has been banned' });
    }
    
    next();
  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  checkNotBanned,
  checkUserExists,
  JWT_SECRET
}; 
