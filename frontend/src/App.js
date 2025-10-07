import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import BrowseUsers from './components/users/BrowseUsers';
import UserProfile from './components/users/UserProfile';
import MyProfile from './components/profile/MyProfile';
import SwapRequests from './components/swaps/SwapRequests';
import AdminDashboard from './components/admin/AdminDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import LandingPage from './components/landingPage/LandingPage';

function App() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Auth routes - no layout */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      {/* Browse route (outside Layout) */}
      <Route path="/browse" element={<BrowseUsers />} />
      
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Layout wrapped routes */}
      <Route path="/" element={<Layout />}>
        {/* Protected routes - only accessible when logged in */}
        <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="profile" element={isAuthenticated ? <MyProfile /> : <Navigate to="/login" />} />
        <Route path="users/:userId" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="swaps" element={isAuthenticated ? <SwapRequests /> : <Navigate to="/login" />} />
        
        {/* Admin routes */}
        {isAdmin && (
          <Route path="admin" element={<AdminDashboard />} />
        )}
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;