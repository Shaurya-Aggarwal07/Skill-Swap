import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Users,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const swapsRes = await axios.get('/api/swaps/my-requests?limit=10');
        setRecentSwaps(swapsRes.data.requests || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setRecentSwaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  const quickActions = [
    {
      name: 'Browse Users',
      description: 'Find people to swap skills with',
      href: '/browse',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Update Profile',
      description: 'Add your skills and preferences',
      href: '/profile',
      icon: Plus,
      color: 'bg-green-500',
    },
    {
      name: 'View Requests',
      description: 'Check your swap requests',
      href: '/swaps',
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to swap some skills? Here's what's happening on the platform.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${action.color}`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

     

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity - Latest Swap Requests ({recentSwaps.length})
        </h2>
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
                      {swap.requester_id === user.id || swap.requester_id === user._id
                        ? `You → ${swap.recipient_name}`
                        : `${swap.requester_name} → You`}
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
                    {new Date(swap.created_at).toLocaleDateString()} at {new Date(swap.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <Link
                  to="/swaps"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No swap requests yet</p>
            <Link
              to="/browse"
              className="inline-flex items-center mt-2 text-primary-600 hover:text-primary-700"
            >
              <Search className="h-4 w-4 mr-1" />
              Browse users to get started
            </Link>
          </div>
        )}
        
        {recentSwaps.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              to="/swaps"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All Swap Requests
              <MessageSquare className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Tips for Successful Skill Swapping
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium mb-2">1. Be Specific</h3>
            <p>Clearly describe what you can offer and what you want to learn.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">2. Set Expectations</h3>
            <p>Agree on the format, duration, and goals of your skill swap.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">3. Be Reliable</h3>
            <p>Show up on time and follow through with your commitments.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">4. Give Feedback</h3>
            <p>Rate your swap partners to help build the community.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 