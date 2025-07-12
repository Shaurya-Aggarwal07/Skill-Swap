import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import AdminMessageBanner from './common/AdminMessageBanner';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the base URL of your application
  const baseUrl = window.location.origin;

  // Create navigation items with a property to indicate which ones should open in a new tab
  const navigation = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home, newTab: false },
    { name: 'Browse Users', href: '/browse', icon: Users, newTab: false }, // Use absolute URL and open in new tab
    { name: 'My Profile', href: '/profile', icon: User, newTab: false },
    { name: 'Swap Requests', href: '/swaps', icon: MessageSquare, newTab: false },
    ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: Shield, newTab: false }] : []),
  ] : [
    { name: 'Browse Users', href: '/browse', icon: Users, newTab: false }, // Use absolute URL and open in new tab
    { name: 'Log In', href: '/login', icon: User, newTab: false },
    { name: 'Sign Up', href: '/register', icon: User, newTab: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    // For absolute URLs, compare only the pathname
    if (href.startsWith(baseUrl)) {
      const pathname = href.substring(baseUrl.length);
      return location.pathname === pathname;
    }
    return location.pathname === href;
  };

  // Render link with or without new tab target based on the newTab property
  const renderNavLink = (item) => {
    if (item.newTab) {
      return (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive(item.href)
              ? 'bg-primary-100 text-primary-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </a>
      );
    } else {
      return (
        <Link
          key={item.name}
          to={item.href}
          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive(item.href)
              ? 'bg-primary-100 text-primary-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Skill Swap</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => renderNavLink(item))}
          </nav>
          {isAuthenticated && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {(user?.name || 'U')?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 justify-center">
            <h1 className="text-2xl font-bold text-gray-900 ">
              <Link to="/" className="hover:cursor-pointer">
              Skill Swap
              </Link>
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => renderNavLink(item))}
          </nav>
          {isAuthenticated && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {(user?.name || 'U')?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {!isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">Log In</Link>
                  <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AdminMessageBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;