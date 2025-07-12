const express = require('express');
const router = express.Router();
const { User, UserOfferedSkill, UserWantedSkill, Skill } = require('../database/init');
const { authenticateToken: auth} = require('../middleware/auth');


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
    const users = (await User.find(query)
      .select('_id name email location availability profile_photo is_public')
      .skip(skip)
      .limit(parseInt(limit))
      .lean()).filter(user => user._id); // Ensure only users with valid IDs

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
          select: '_id name email location availability profile_photo is_public',
          match: { is_public: true }
        }).populate({
          path: 'skill_id',
          match: { name: skillRegex }
        }),
        UserWantedSkill.find({}).populate({
          path: 'user_id',
          select: '_id name email location availability profile_photo is_public',
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
            name: item.skill_id?.name || 'Unknown Skill',
            category: item.skill_id?.category || 'Unknown',
            description: item.description,
            proficiency_level: item.proficiency_level
          })),
          wantedSkills: wantedSkills.map(item => ({
            id: item._id,
            name: item.skill_id?.name || 'Unknown Skill',
            category: item.skill_id?.category || 'Unknown',
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
        name: item.skill_id?.name || 'Unknown Skill',
        category: item.skill_id?.category || 'Unknown',
        description: item.description,
        proficiency_level: item.proficiency_level
      })),
      wantedSkills: wantedSkills.map(item => ({
        id: item._id,
        name: item.skill_id?.name || 'Unknown Skill',
        category: item.skill_id?.category || 'Unknown',
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

// Get user profile by ID (public) - This must come AFTER all /me routes
router.get('/:userId', async (req, res) => {
  try {
    // Validate userId parameter
    if (!req.params.userId || req.params.userId === 'undefined' || req.params.userId === 'unknown') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.userId).select('-password');
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
        name: item.skill_id?.name || 'Unknown Skill',
        category: item.skill_id?.category || 'Unknown',
        description: item.description,
        proficiency_level: item.proficiency_level
      })),
      wantedSkills: wantedSkills.map(item => ({
        id: item._id,
        name: item.skill_id?.name || 'Unknown Skill',
        category: item.skill_id?.category || 'Unknown',
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