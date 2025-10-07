import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, Users } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../common/Footer';
import axios from 'axios';
import Navbar from '../common/Navbar';



const BrowseUsers = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Active filter states (used for API calls)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeSkillFilter, setActiveSkillFilter] = useState('');
  const [activeLocationFilter, setActiveLocationFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: activeSearchTerm,
        skill: activeSkillFilter,
        location: activeLocationFilter
      });

      const response = await axios.get(`/api/users/browse?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeSearchTerm, activeSkillFilter, activeLocationFilter]);

  // Fetch users when active filters or page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Update active filters with current input values
    setActiveSearchTerm(searchTerm);
    setActiveSkillFilter(skillFilter);
    setActiveLocationFilter(locationFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSkillFilter('');
    setLocationFilter('');
    setActiveSearchTerm('');
    setActiveSkillFilter('');
    setActiveLocationFilter('');
    setCurrentPage(1);
  };

  const handleRequest = (userId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else if (userId && userId !== 'undefined' && userId !== 'unknown') {
      // Navigate to user profile to request swap
      window.location.href = `/users/${userId}`;
    } else {
      console.error('Invalid user ID:', userId);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <div className="space-y-6">
            
            <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between">
              <div>
                  <h1 className="text-4xl font-bold text-gray-900">Browse Users</h1>
                  <p className="mt-2 text-gray-600">
                    Find people to swap skills with
                  </p>
                  {!isAuthenticated && (
                    <p className="mt-2 text-sm text-gray-500">
                  Log in to join the community and start connecting with others.
                    </p>
                  )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                  <Input
                    placeholder="Filter by skill..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                  <Input
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              </form>
            </div>

            {/* Users Grid */}
            {users.length > 0 ? (
              <div className="space-y-4">
                {users.filter(user => user._id || user.id).map((user) => (
                  <div
                    key={user._id || user.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {user.profile_photo ? (
                          <img
                            src={user.profile_photo}
                            alt={user.name}
                            className="h-16 w-16 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{user.name || 'Unknown User'}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">Skills offered:</span>
                          {(user.offeredSkills || []).map((skill) => (
                            <span key={skill.id || skill._id} className="badge badge-info">{skill.name || 'Unknown Skill'}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">Skill wanted:</span>
                          {(user.wantedSkills || []).map((skill) => (
                            <span key={skill.id || skill._id} className="badge badge-warning">{skill.name || 'Unknown Skill'}</span>
                          ))}
                        </div>
                        {user.location && (
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {user.location}
                          </div>
                        )}
                        {user.availability && (
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {user.availability}
                          </div>
                        )}
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-700">{user.rating ? user.rating.toFixed(1) : 'N/A'}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        to={`/users/${user._id || user.id || 'unknown'}`}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium mb-2"
                      >
                        View Profile
                      </Link>
                      <Button variant="primary" size="sm" onClick={() => handleRequest(user._id || user.id)}>
                        Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Login/Signup Modal (dummy) */}
            {showLoginModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowLoginModal(false)}>&times;</button>
                  <h2 className="text-xl font-bold mb-4">Please log in or sign up</h2>
                  <p className="mb-4 text-gray-600">You must be logged in to request a swap.</p>
                  <Button className="w-full mb-2" onClick={() => { setShowLoginModal(false); window.location.href = '/login'; }}>Log In</Button>
                  <Button className="w-full" variant="secondary" onClick={() => { setShowLoginModal(false); window.location.href = '/register'; }}>Sign Up</Button>
                </div>
              </div>
            )}

          </div>
        
        </div>
        
        <Footer />
    </div>
    </>
  );
};

export default BrowseUsers;