/**
 * User Routes
 * 
 * This module handles user-related endpoints including:
 * - User browsing and discovery
 * - User profile management
 * - Skills management (offered and wanted skills)
 * - Public profile viewing
 * 
 * Routes support authentication, pagination, and filtering
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserOfferedSkill = require('../models/UserOfferedSkill');
const UserWantedSkill = require('../models/UserWantedSkill');
const Skill = require('../models/Skill');
// const auth = require('../middleware/auth');
const { authenticateToken: auth} = require('../middleware/auth');

/**
 * GET /users/browse
 * 
 * Get all public users for browsing and discovery
 * Supports pagination, search, location filtering, and skill filtering
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Number of users per page (default: 10)
 * - search: Search users by name or location
 * - skill: Filter users by specific skill (offered or wanted)
 * - location: Filter users by location
 * 
 * Response:
 * - 200: List of public users with their skills and pagination info
 * - 500: Server error
 */

// Get all users for browsing (public profiles only)
router.get('/browse', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', skill = '', location = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query for public users only
    let query = { is_public: true };

    // Add search filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Get users with basic info
    const users = await User.find(query)
      .select('name email location availability profile_photo is_public')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // If skill filter is applied, filter users by skills
    let filteredUsers = users;
    if (skill) {
      const skillRegex = new RegExp(skill, 'i');
      
      // Get users with matching offered or wanted skills
      const [offeredSkillUsers, wantedSkillUsers] = await Promise.all([
        UserOfferedSkill.find({}).populate({
          path: 'user_id',
          select: 'name email location availability profile_photo is_public',
          match: { is_public: true }
        }).populate({
          path: 'skill_id',
          match: { name: skillRegex }
        }),
        UserWantedSkill.find({}).populate({
          path: 'user_id',
          select: 'name email location availability profile_photo is_public',
          match: { is_public: true }
        }).populate({
          path: 'skill_id',
          match: { name: skillRegex }
        })
      ]);

      const matchingUserIds = new Set();
      
      // Add users with matching offered skills
      offeredSkillUsers.forEach(item => {
        if (item.user_id && item.skill_id) {
          matchingUserIds.add(item.user_id._id.toString());
        }
      });

      // Add users with matching wanted skills
      wantedSkillUsers.forEach(item => {
        if (item.user_id && item.skill_id) {
          matchingUserIds.add(item.user_id._id.toString());
        }
      });

      filteredUsers = users.filter(user => matchingUserIds.has(user._id.toString()));
    }

    // Get skills for each user
    const usersWithSkills = await Promise.all(
      filteredUsers.map(async (user) => {
        const [offeredSkills, wantedSkills] = await Promise.all([
          UserOfferedSkill.find({ user_id: user._id })
            .populate('skill_id')
            .lean(),
          UserWantedSkill.find({ user_id: user._id })
            .populate('skill_id')
            .lean()
        ]);

        return {
          ...user,
          offeredSkills: offeredSkills.map(item => ({
            id: item._id,
            name: item.skill_id.name,
            category: item.skill_id.category,
            description: item.description,
            proficiency_level: item.proficiency_level
          })),
          wantedSkills: wantedSkills.map(item => ({
            id: item._id,
            name: item.skill_id.name,
            category: item.skill_id.category,
            description: item.description,
            priority_level: item.priority_level
          }))
        };
      })
    );

    res.json({
      users: usersWithSkills,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
/**
 * GET /users/me/skills
 * 
 * Get current user's offered and wanted skills
 * Requires authentication
 * 
 * Response:
 * - 200: User's offered and wanted skills with details
 * - 500: Server error
 */
// Get current user's skills
router.get('/me/skills', auth, async (req, res) => {
  try {
    const [offeredSkills, wantedSkills] = await Promise.all([
      UserOfferedSkill.find({ user_id: req.user.id })
        .populate('skill_id')
        .lean(),
      UserWantedSkill.find({ user_id: req.user.id })
        .populate('skill_id')
        .lean()
    ]);

    res.json({
      offeredSkills: offeredSkills.map(item => ({
        id: item._id,
        name: item.skill_id.name,
        category: item.skill_id.category,
        description: item.description,
        proficiency_level: item.proficiency_level
      })),
      wantedSkills: wantedSkills.map(item => ({
        id: item._id,
        name: item.skill_id.name,
        category: item.skill_id.category,
        description: item.description,
        priority_level: item.priority_level
      }))
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add offered skill
/**
 * POST /users/me/skills/offered
 * 
 * Add a new offered skill to current user's profile
 * Requires authentication
 * 
 * Request Body:
 * - skillId: ID of the skill to add
 * - description: Optional description of the skill
 * - proficiencyLevel: Proficiency level (default: 'intermediate')
 * 
 * Response:
 * - 201: Offered skill added successfully
 * - 400: Skill already exists or validation error
 * - 404: Skill not found
 * - 500: Server error
 */
router.post('/me/skills/offered', auth, async (req, res) => {
  try {
    const { skillId, description, proficiencyLevel } = req.body;

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check if user already has this offered skill
    const existingSkill = await UserOfferedSkill.findOne({
      user_id: req.user.id,
      skill_id: skillId
    });

    if (existingSkill) {
      return res.status(400).json({ message: 'You already have this skill listed as offered' });
    }

    const userOfferedSkill = new UserOfferedSkill({
      user_id: req.user.id,
      skill_id: skillId,
      description: description || '',
      proficiency_level: proficiencyLevel || 'intermediate'
    });

    await userOfferedSkill.save();

    res.status(201).json({ message: 'Offered skill added successfully' });
  } catch (error) {
    console.error('Error adding offered skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /users/me/skills/wanted
 * 
 * Add a new wanted skill to current user's profile
 * Requires authentication
 * 
 * Request Body:
 * - skillId: ID of the skill to add
 * - description: Optional description of the skill
 * - priorityLevel: Priority level (default: 'medium')
 * 
 * Response:
 * - 201: Wanted skill added successfully
 * - 400: Skill already exists or validation error
 * - 404: Skill not found
 * - 500: Server error
 */
// Add wanted skill
router.post('/me/skills/wanted', auth, async (req, res) => {
  try {
    const { skillId, description, priorityLevel } = req.body;

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check if user already has this wanted skill
    const existingSkill = await UserWantedSkill.findOne({
      user_id: req.user.id,
      skill_id: skillId
    });

    if (existingSkill) {
      return res.status(400).json({ message: 'You already have this skill listed as wanted' });
    }

    const userWantedSkill = new UserWantedSkill({
      user_id: req.user.id,
      skill_id: skillId,
      description: description || '',
      priority_level: priorityLevel || 'medium'
    });

    await userWantedSkill.save();

    res.status(201).json({ message: 'Wanted skill added successfully' });
  } catch (error) {
    console.error('Error adding wanted skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove offered skill
router.delete('/me/skills/offered/:skillId', auth, async (req, res) => {
  try {
    const { skillId } = req.params;

    const result = await UserOfferedSkill.findOneAndDelete({
      _id: skillId,
      user_id: req.user.id
    });

    if (!result) {
      return res.status(404).json({ message: 'Offered skill not found' });
    }

    res.json({ message: 'Offered skill removed successfully' });
  } catch (error) {
    console.error('Error removing offered skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * DELETE /users/me/skills/offered/:skillId
 * 
 * Remove an offered skill from current user's profile
 * Requires authentication
 * 
 * URL Parameters:
 * - skillId: ID of the offered skill to remove
 * 
 * Response:
 * - 200: Offered skill removed successfully
 * - 404: Offered skill not found
 * - 500: Server error
 */
// Remove wanted skill
router.delete('/me/skills/wanted/:skillId', auth, async (req, res) => {
  try {
    const { skillId } = req.params;

    const result = await UserWantedSkill.findOneAndDelete({
      _id: skillId,
      user_id: req.user.id
    });

    if (!result) {
      return res.status(404).json({ message: 'Wanted skill not found' });
    }

    res.json({ message: 'Wanted skill removed successfully' });
  } catch (error) {
    console.error('Error removing wanted skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /users/me/skills/wanted/:skillId
 * 
 * Remove a wanted skill from current user's profile
 * Requires authentication
 * 
 * URL Parameters:
 * - skillId: ID of the wanted skill to remove
 * 
 * Response:
 * - 200: Wanted skill removed successfully
 * - 404: Wanted skill not found
 * - 500: Server error
 */

/**
 * GET /users/:id
 * 
 * Get a specific user's public profile by ID
 * Only returns data for public profiles
 * 
 * URL Parameters:
 * - id: User ID to fetch
 * 
 * Response:
 * - 200: User profile with skills data
 * - 404: User not found or profile not public
 * - 500: Server error
 * 
 * Note: This route must come AFTER all /me routes to avoid conflicts
 */
// Get user profile by ID (public) - This must come AFTER all /me routes
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || !user.is_public) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's skills
    const [offeredSkills, wantedSkills] = await Promise.all([
      UserOfferedSkill.find({ user_id: user._id })
        .populate('skill_id')
        .lean(),
      UserWantedSkill.find({ user_id: user._id })
        .populate('skill_id')
        .lean()
    ]);

    const userProfile = {
      ...user.toObject(),
      offeredSkills: offeredSkills.map(item => ({
        id: item._id,
        name: item.skill_id.name,
        category: item.skill_id.category,
        description: item.description,
        proficiency_level: item.proficiency_level
      })),
      wantedSkills: wantedSkills.map(item => ({
        id: item._id,
        name: item.skill_id.name,
        category: item.skill_id.category,
        description: item.description,
        priority_level: item.priority_level
      }))
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
