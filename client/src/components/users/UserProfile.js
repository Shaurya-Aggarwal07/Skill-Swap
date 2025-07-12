import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';

const UserProfile = () => {
  const { userId } = useParams();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [skills, setSkills] = useState({ offered: [], wanted: [] });
  const [mySkills, setMySkills] = useState({ offered: [], wanted: [] });
  const [swapForm, setSwapForm] = useState({ offeredSkillId: '', requestedSkillId: '', message: '' });
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setProfile(res.data.user);
        setSkills({
          offered: res.data.user.offeredSkills || [],
          wanted: res.data.user.wantedSkills || [],
        });
      } catch (err) {
        setError('Failed to load user profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/users/me/skills')
        .then(res => setMySkills({ offered: res.data.offeredSkills, wanted: res.data.wantedSkills }))
        .catch(() => setMySkills({ offered: [], wanted: [] }));
    }
  }, [isAuthenticated]);

  const handleRequest = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowSwapModal(true);
    }
  };

  const handleSwapChange = (e) => {
    const { name, value } = e.target;
    setSwapForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    setSwapLoading(true);
    setSwapError('');
    setSwapSuccess('');
    try {
      await axios.post('/api/swaps', {
        recipientId: Number(userId),
        offeredSkillId: Number(swapForm.offeredSkillId),
        requestedSkillId: Number(swapForm.requestedSkillId),
        message: swapForm.message,
      });
      setSwapSuccess('Swap request sent!');
      setShowSwapModal(false);
    } catch (err) {
      setSwapError(err.response?.data?.error || 'Failed to send swap request');
    }
    setSwapLoading(false);
  };

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
        <p className="mt-2 text-gray-600">{profile.location} {profile.availability && `| ${profile.availability}`}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6 mb-6">
          <div>
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="Profile" className="h-20 w-20 rounded-full object-cover border" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{profile.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div>
            <div className="mb-2">
              <span className="font-medium">Location: </span>{profile.location}
            </div>
            <div className="mb-2">
              <span className="font-medium">Availability: </span>{profile.availability}
            </div>
            <div className="mb-2">
              <span className="font-medium">Profile: </span>{profile.is_public ? 'Public' : 'Private'}
            </div>
            <div className="mb-2">
              <span className="font-medium">Rating: </span>{profile.rating ? profile.rating.toFixed(1) : 'N/A'} / 5
            </div>
          </div>
        </div>
        <div className="mb-4">
          <span className="font-medium">Skills Offered:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {skills.offered.length > 0 ? skills.offered.map((skill) => (
              <span key={skill.id} className="badge badge-info">{skill.name}</span>
            )) : <span className="text-gray-500 ml-2">None</span>}
          </div>
        </div>
        <div className="mb-4">
          <span className="font-medium">Skills Wanted:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {skills.wanted.length > 0 ? skills.wanted.map((skill) => (
              <span key={skill.id} className="badge badge-warning">{skill.name}</span>
            )) : <span className="text-gray-500 ml-2">None</span>}
          </div>
        </div>
        {currentUser && Number(currentUser.id) !== Number(userId) && (
          <Button variant="primary" onClick={handleRequest}>Request</Button>
        )}
      </div>
      {/* Login/Signup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowLoginModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Please log in or sign up</h2>
            <p className="mb-4 text-gray-600">You must be logged in to request a swap.</p>
            <Button className="w-full mb-2" onClick={() => { setShowLoginModal(false); navigate('/login'); }}>Log In</Button>
            <Button className="w-full" variant="secondary" onClick={() => { setShowLoginModal(false); navigate('/register'); }}>Sign Up</Button>
          </div>
        </div>
      )}
      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowSwapModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Request a Skill Swap</h2>
            {swapError && <div className="text-red-600 mb-2">{swapError}</div>}
            {swapSuccess && <div className="text-green-600 mb-2">{swapSuccess}</div>}
            <form onSubmit={handleSwapSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Offered Skill</label>
                <select
                  name="offeredSkillId"
                  value={swapForm.offeredSkillId}
                  onChange={handleSwapChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select a skill</option>
                  {mySkills.offered.map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Skill You Want</label>
                <select
                  name="requestedSkillId"
                  value={swapForm.requestedSkillId}
                  onChange={handleSwapChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select a skill</option>
                  {skills.offered.map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <Input
                  name="message"
                  value={swapForm.message}
                  onChange={handleSwapChange}
                  placeholder="Write a message..."
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" variant="primary" loading={swapLoading} disabled={swapLoading}>Send Request</Button>
                <Button type="button" variant="secondary" onClick={() => setShowSwapModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 