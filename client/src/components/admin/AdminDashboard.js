import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  MessageSquare,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Send,
  X,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, swapsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users?limit=5'),
        axios.get('/api/admin/swaps?limit=5')
      ]);

      setStats(statsRes.data.stats);
      setRecentUsers(usersRes.data.users);
      setRecentSwaps(swapsRes.data.swaps);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId, isBanned) => {
    try {
      await axios.put(`/api/admin/users/${userId}/ban`, { isBanned });
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const downloadUserReport = async () => {
    try {
      const response = await axios.get('/api/admin/reports/user-activity', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-activity-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download user report:', error);
      alert('Failed to download user report');
    }
  };

  const downloadSwapReport = async () => {
    try {
      const response = await axios.get('/api/admin/reports/swap-stats', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'swap-stats-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download swap report:', error);
      alert('Failed to download swap report');
    }
  };

  const sendPlatformMessage = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    
    try {
      await axios.post('/api/admin/messages', messageForm);
      setShowMessageModal(false);
      setMessageForm({ title: '', message: '', type: 'info' });
      alert('Platform message sent successfully!');
    } catch (error) {
      console.error('Failed to send platform message:', error);
      alert('Failed to send platform message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageFormChange = (field, value) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage the Skill Swap platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Admin Panel</span>
        </div>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedSwaps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h2>
        {recentUsers.length > 0 ? (
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.location && (
                      <p className="text-xs text-gray-500">{user.location}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.is_banned ? (
                    <span className="badge badge-danger">Banned</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )}
                  <Button
                    variant={user.is_banned ? 'primary' : 'danger'}
                    size="sm"
                    onClick={() => banUser(user.id, !user.is_banned)}
                  >
                    {user.is_banned ? 'Unban' : 'Ban'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent users</p>
        )}
      </div>

      {/* Recent Swaps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Swap Requests</h2>
        {recentSwaps.length > 0 ? (
          <div className="space-y-4">
            {recentSwaps.map((swap) => (
              <div
                key={swap.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {swap.requester_name} → {swap.recipient_name}
                    </span>
                    <span
                      className={`badge ${
                        swap.status === 'accepted'
                          ? 'badge-success'
                          : swap.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {swap.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {swap.offered_skill_name} ↔ {swap.requested_skill_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(swap.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent swap requests</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={downloadUserReport}
            className="flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download User Report</span>
          </Button>
          <Button
            variant="secondary"
            onClick={downloadSwapReport}
            className="flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Swap Report</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMessageModal(true)}
            className="flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send Platform Message</span>
          </Button>
        </div>
      </div>

      {/* Platform Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowMessageModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-bold mb-6">Send Platform Message</h2>
            
            <form onSubmit={sendPlatformMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Title
                </label>
                <Input
                  value={messageForm.title}
                  onChange={(e) => handleMessageFormChange('title', e.target.value)}
                  placeholder="Enter message title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <select
                  value={messageForm.type}
                  onChange={(e) => handleMessageFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => handleMessageFormChange('message', e.target.value)}
                  placeholder="Enter your platform message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={sendingMessage}
                  className="flex-1"
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowMessageModal(false)}
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

export default AdminDashboard; 