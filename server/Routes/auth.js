/**
 * Authentication Routes
 * 
 * This module handles all authentication-related endpoints including:
 * - User registration
 * - User login
 * - Profile management
 * - Password changes
 * - File uploads for profile photos
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../database/init');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

/**
 * Multer Configuration for File Uploads
 * 
 * Configures multer middleware to handle profile photo uploads:
 * - Storage: Saves files to server/uploads/ directory
 * - File naming: Uses timestamp + random number for unique filenames
 * - File size limit: 5MB maximum
 * - File type: Only allows image files (jpg, png, gif, etc.)
 */
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
/**
 * POST /auth/register
 * 
 * Register a new user account
 * 
 * Request Body:
 * - email: User's email address
 * - password: User's password (optional for testing)
 * - name: User's display name
 * - location: User's location
 * - availability: User's availability status
 * 
 * Response:
 * - 201: User registered successfully with JWT token
 * - 400: User already exists
 * - 500: Server error
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Register user (no validation for testing)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, location, availability } = req.body;

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password if provided, else use empty string
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

    // Create new user
    const user = await User.create({
      email: email || '',
      password: hashedPassword,
      name: name || '',
      location: location || '',
      availability: availability || ''
    });

    const token = jwt.sign(
      { id: user._id, email, name, is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email,
        name,
        location,
        availability
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /auth/login
 * 
 * Authenticate user and provide access token
 * 
 * Request Body:
 * - email: User's email address
 * - password: User's password
 * 
 * Response:
 * - 200: Login successful with JWT token and user data
 * - 401: Invalid credentials
 * - 403: Account banned
 * - 500: Server error
 */
// Login user (no validation for testing)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    // If password is empty, allow login (for testing), else check password
    let validPassword = true;
    if (user.password && password) {
      validPassword = await bcrypt.compare(password, user.password);
    }
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.location,
        availability: user.availability,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
/**
 * GET /auth/profile
 * 
 * Get current user's profile information
 * Requires authentication token
 * 
 * Response:
 * - 200: User profile data (excluding password)
 * - 404: User not found
 * - 500: Database error
 */
// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * PUT /auth/profile
 * 
 * Update current user's profile information
 * Requires authentication token
 * Supports file upload for profile photo
 * 
 * Request Body (all optional):
 * - name: User's display name
 * - location: User's location
 * - availability: User's availability status
 * - is_public: Whether profile is public
 * - profile_photo: Image file upload
 * 
 * Response:
 * - 200: Profile updated successfully
 * - 400: No fields to update
 * - 404: User not found
 * - 500: Server error
 */
// Update user profile (no validation for testing)
router.put('/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { name, location, availability, is_public } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (availability !== undefined) updateData.availability = availability;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (req.file) {
      updateData.profile_photo = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: false }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
/**
 * PUT /auth/change-password
 * 
 * Change user's password
 * Requires authentication token
 * 
 * Request Body:
 * - currentPassword: Current password for verification
 * - newPassword: New password to set
 * 
 * Response:
 * - 200: Password changed successfully
 * - 400: Current password is incorrect
 * - 404: User not found
 * - 500: Server error
 */
// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
