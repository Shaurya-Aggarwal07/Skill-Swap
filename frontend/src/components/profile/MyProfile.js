import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import SkillsManager from './SkillsManager';
import axios from 'axios';

const MyProfile = () => {
  const { updateProfile, isAuthenticated, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/auth/profile');
        setProfile(res.data.user);
        setForm(res.data.user);
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view your profile');
        } else {
          setError('Failed to load profile');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [isAuthenticated, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, profile_photo: e.target.files[0] }));
  };

  const handleSave = async () => {
    setSuccess('');
    setError('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated!');
      setEditMode(false);
      setProfile({ ...profile, ...form });
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Please log in to view your profile</div>
        <a href="/login" className="text-blue-600 hover:text-blue-800">Go to Login</a>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">Manage your profile and skills</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex items-center gap-6 mb-6">
          <div>
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="Profile" className="h-20 w-20 rounded-full object-cover border" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{(profile.name || 'U')?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
            {editMode && (
              <input type="file" name="profile_photo" className="mt-2" onChange={handleFileChange} />
            )}
          </div>
          <div>
            <div className="mb-2">
              <span className="font-medium">Name: </span>
              {editMode ? (
                <Input name="name" value={form.name || ''} onChange={handleChange} />
              ) : (
                <span>{profile.name}</span>
              )}
            </div>
            <div className="mb-2">
              <span className="font-medium">Location: </span>
              {editMode ? (
                <Input name="location" value={form.location || ''} onChange={handleChange} />
              ) : (
                <span>{profile.location}</span>
              )}
            </div>
            <div className="mb-2">
              <span className="font-medium">Availability: </span>
              {editMode ? (
                <Input name="availability" value={form.availability || ''} onChange={handleChange} />
              ) : (
                <span>{profile.availability}</span>
              )}
            </div>
            <div className="mb-2">
              <span className="font-medium">Profile: </span>
              {editMode ? (
                <select name="is_public" value={form.is_public ? '1' : '0'} onChange={handleChange} className="input">
                  <option value="1">Public</option>
                  <option value="0">Private</option>
                </select>
              ) : (
                <span>{profile.is_public ? 'Public' : 'Private'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="primary" onClick={handleSave}>Save</Button>
              <Button variant="danger" onClick={() => { setEditMode(false); setForm(profile); }}>Discard</Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setEditMode(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {/* Skills Management */}
      <SkillsManager />
    </div>
  );
};

export default MyProfile; 