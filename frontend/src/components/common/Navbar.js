import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 top-0 sticky z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:cursor-pointer">Skill Swap</Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/browse" className="text-gray-600 hover:text-gray-900">Browse</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
               
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <button 
                  onClick={logout} 
                  className="text-red-600 hover:text-red-900"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">Log In</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;