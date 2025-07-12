import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, Users, BookOpen, Target } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../common/Footer';
import axios from 'axios';
import Navbar from '../common/Navbar';

// Dummy users data
const DUMMY_USERS = [
  {
    id: 1,
    name: 'Marc Demo',
    profile_photo: '',
    location: 'New York',
    availability: 'Weekends',
    is_public: true,
    rating: 3.9,
    offeredSkills: [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'Python' },
    ],
    wantedSkills: [
      { id: 3, name: 'Photoshop' },
      { id: 4, name: 'Graphic Designer' },
    ],
  },
  {
    id: 2,
    name: 'Michell',
    profile_photo: '',
    location: 'London',
    availability: 'Evenings',
    is_public: true,
    rating: 2.5,
    offeredSkills: [
      { id: 5, name: 'Node.js' },
      { id: 6, name: 'React' },
    ],
    wantedSkills: [
      { id: 7, name: 'Photoshop' },
      { id: 8, name: 'Graphic Designer' },
    ],
  },
  {
    id: 3,
    name: 'Joe Wills',
    profile_photo: '',
    location: 'Berlin',
    availability: 'Weekdays',
    is_public: true,
    rating: 4.0,
    offeredSkills: [
      { id: 9, name: 'Excel' },
      { id: 10, name: 'PowerPoint' },
    ],
    wantedSkills: [
      { id: 11, name: 'Photoshop' },
      { id: 12, name: 'Graphic Designer' },
    ],
  },
  // Add more dummy users as needed
];

const USERS_PER_PAGE = 2;

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

  useEffect(() => {
    // For development, use dummy data until API is ready
    setLoading(true);
    
    // Filter dummy users based on search criteria
    const filteredUsers = DUMMY_USERS.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSkill = skillFilter === '' || 
        user.offeredSkills.some(skill => skill.name.toLowerCase().includes(skillFilter.toLowerCase())) ||
        user.wantedSkills.some(skill => skill.name.toLowerCase().includes(skillFilter.toLowerCase()));
      
      const matchesLocation = locationFilter === '' || 
        (user.location && user.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesSkill && matchesLocation;
    });

    const total = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const paginatedResults = filteredUsers.slice(start, start + USERS_PER_PAGE);

    setUsers(paginatedResults);
    setTotalPages(total);
    setLoading(false);
    
    // When ready to use the real API, uncomment this:
    /*
    fetchUsers();
    */
  }, [currentPage, searchTerm, skillFilter, locationFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        skill: skillFilter,
        location: locationFilter
      });

      const response = await axios.get(`/api/users/browse?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSkillFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  const handleRequest = (userId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // In real app, open swap modal
      alert('Request swap with user ID: ' + userId);
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
                {users.map((user) => (
                  <div
                    key={user.id}
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
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">Skills offered:</span>
                          {(user.offeredSkills || []).map((skill) => (
                            <span key={skill.id} className="badge badge-info">{skill.name}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">Skill wanted:</span>
                          {(user.wantedSkills || []).map((skill) => (
                            <span key={skill.id} className="badge badge-warning">{skill.name}</span>
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
                        to={`/dashboard/users/${user.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium mb-2"
                      >
                        View Profile
                      </Link>
                      <Button variant="primary" size="sm" onClick={() => handleRequest(user.id)}>
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