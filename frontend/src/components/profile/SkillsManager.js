import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Star, Target, BookOpen, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [userOfferedSkills, setUserOfferedSkills] = useState([]);
  const [userWantedSkills, setUserWantedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const [showAddOffered, setShowAddOffered] = useState(false);
  const [showAddWanted, setShowAddWanted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('intermediate');
  const [priorityLevel, setPriorityLevel] = useState('medium');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, userSkillsRes] = await Promise.all([
        axios.get('/api/skills'),
        axios.get('/api/users/me/skills')
      ]);

      setSkills(skillsRes.data.skills || []);
      setUserOfferedSkills(userSkillsRes.data.offeredSkills || []);
      setUserWantedSkills(userSkillsRes.data.wantedSkills || []);
    } catch (error) {
      console.error('Failed to fetch skills data:', error);
      // Set default values if API fails
      setSkills([]);
      setUserOfferedSkills([]);
      setUserWantedSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const addOfferedSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;

    setAddingSkill(true);
    try {
      await axios.post('/api/users/me/skills/offered', {
        skillId: selectedSkill,
        description: skillDescription,
        proficiencyLevel
      });

      await fetchData();
      setShowAddOffered(false);
      setSelectedSkill('');
      setSkillDescription('');
      setProficiencyLevel('intermediate');
    } catch (error) {
      console.error('Failed to add offered skill:', error);
      alert('Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const addWantedSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;

    setAddingSkill(true);
    try {
      await axios.post('/api/users/me/skills/wanted', {
        skillId: selectedSkill,
        description: skillDescription,
        priorityLevel
      });

      await fetchData();
      setShowAddWanted(false);
      setSelectedSkill('');
      setSkillDescription('');
      setPriorityLevel('medium');
    } catch (error) {
      console.error('Failed to add wanted skill:', error);
      alert('Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const removeOfferedSkill = async (skillId) => {
    try {
      await axios.delete(`/api/users/me/skills/offered/${skillId}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to remove offered skill:', error);
      alert('Failed to remove skill');
    }
  };

  const removeWantedSkill = async (skillId) => {
    try {
      await axios.delete(`/api/users/me/skills/wanted/${skillId}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to remove wanted skill:', error);
      alert('Failed to remove skill');
    }
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Offered Skills Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Skills I Offer</h3>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddOffered(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {userOfferedSkills.length > 0 ? (
          <div className="space-y-3">
            {userOfferedSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                    {skill.description && (
                      <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                    {skill.proficiency_level}
                  </span>
                  <button
                    onClick={() => removeOfferedSkill(skill.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No skills offered yet. Add some skills you can teach!</p>
        )}
      </div>

      {/* Wanted Skills Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Skills I Want to Learn</h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddWanted(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {userWantedSkills.length > 0 ? (
          <div className="space-y-3">
            {userWantedSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                    {skill.description && (
                      <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(skill.priority_level)}`}>
                    {skill.priority_level}
                  </span>
                  <button
                    onClick={() => removeWantedSkill(skill.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No skills wanted yet. Add skills you want to learn!</p>
        )}
      </div>

      {/* Add Offered Skill Modal */}
      {showAddOffered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Offered Skill</h3>
              <button
                onClick={() => setShowAddOffered(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={addOfferedSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Choose a skill...</option>
                  {skills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={proficiencyLevel}
                  onChange={(e) => setProficiencyLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="Describe your experience with this skill..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={addingSkill}
                  className="flex-1"
                >
                  {addingSkill ? 'Adding...' : 'Add Skill'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddOffered(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wanted Skill Modal */}
      {showAddWanted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Wanted Skill</h3>
              <button
                onClick={() => setShowAddWanted(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={addWantedSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Choose a skill...</option>
                  {skills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="Describe what you want to learn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={addingSkill}
                  className="flex-1"
                >
                  {addingSkill ? 'Adding...' : 'Add Skill'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddWanted(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManager; 