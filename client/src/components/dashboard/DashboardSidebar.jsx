import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaSignOutAlt, FaHome, FaBoxOpen, FaMapMarkedAlt, FaInfoCircle, FaEnvelope, FaChevronRight, FaChevronLeft, FaHeart, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const mainLinks = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/packages', label: 'Browse Packages', icon: <FaBoxOpen /> },
  { to: '/map', label: 'Resort Map', icon: <FaMapMarkedAlt /> },
  { to: '/about', label: 'About Us', icon: <FaInfoCircle /> },
  { to: '/contact', label: 'Contact', icon: <FaEnvelope /> },
];

const userLinks = [
  { to: '/dashboard/user', label: 'My Dashboard', icon: <FaTachometerAlt /> },
  { to: '/profile', label: 'My Profile', icon: <FaUser /> },
  { to: '/feedback', label: 'Leave Feedback', icon: <FaHeart /> },
];

const DashboardSidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-[260px]'} bg-white min-h-screen border-r border-gray-100 shadow-sm px-2 py-8 transition-all duration-300`}>
      {/* App Name */}
      <div className={`flex items-center justify-center mb-8 h-10 select-none ${collapsed ? 'w-10 mx-auto' : ''}`} style={{ fontFamily: 'inherit' }}>
        {collapsed ? (
          <span className="text-2xl font-extrabold text-blue-700">T</span>
        ) : (
          <span className="text-xl font-extrabold text-blue-700 tracking-wide">TravelDash</span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className={`mb-8 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition self-center ${collapsed ? 'ml-1' : 'ml-auto mr-2'}`}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* User Welcome */}
      {!collapsed && user && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <p className="text-gray-800 font-medium text-sm">Welcome back!</p>
              <p className="text-blue-600 text-xs">{user.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 mt-2">
        <div className="mb-6">
          {!collapsed && (
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
              Explore
            </h3>
          )}
          <ul className="space-y-2">
            {mainLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg text-base font-medium transition-colors ${location.pathname === link.to ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50'} ${collapsed ? 'justify-center' : ''} hover:-translate-y-1 hover:scale-105 transition-transform duration-200`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {!collapsed && link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Dashboard Links - only if logged in as regular user */}
        {user && user.role === 'user' && (
          <div>
            {!collapsed && (
              <h3 className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
                My Account
              </h3>
            )}
            <ul className="space-y-2">
              {userLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg text-base font-medium transition-colors ${location.pathname === link.to ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50'} ${collapsed ? 'justify-center' : ''} hover:-translate-y-1 hover:scale-105 transition-transform duration-200`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {!collapsed && link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Logout Button - only if logged in */}
      {user && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full ${collapsed ? 'justify-center' : ''} hover:-translate-y-1 hover:scale-105 transition-transform duration-200`}
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      )}

      {/* Login/Sign Up Buttons - only if NOT logged in */}
      {!user && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {!collapsed && (
            <div className="px-2 mb-3">
              <p className="text-gray-600 text-xs text-center">
                Join us to unlock exclusive features!
              </p>
            </div>
          )}
          
          {/* Login Button */}
          <Link
            to="/login"
            className={`flex items-center gap-3 px-2 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full ${collapsed ? 'justify-center' : ''} hover:-translate-y-1 hover:scale-105 transition-transform duration-200`}
          >
            <span className="text-lg">
              <FaSignInAlt />
            </span>
            {!collapsed && 'Log In'}
          </Link>

          {/* Sign Up Button */}
          <Link
            to="/register"
            className={`flex items-center gap-3 px-2 py-2 rounded-lg text-base font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors w-full ${collapsed ? 'justify-center' : ''} hover:-translate-y-1 hover:scale-105 transition-transform duration-200`}
          >
            <span className="text-lg">
              <FaUserPlus />
            </span>
            {!collapsed && 'Sign Up'}
          </Link>

          {!collapsed && (
            <div className="px-2 mt-3">
              <p className="text-gray-500 text-xs text-center">
                Access your dashboard, save favorites, and more!
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
