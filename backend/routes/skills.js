const express = require('express');
const { Skill } = require('../database/init');

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skills = await Skill.find(query)
      .sort({ name: 1 })
      .lean();
    
    res.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get skill categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Skill.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get skill by ID
router.get('/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const skill = await Skill.findById(skillId).lean();
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ skill });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router; 