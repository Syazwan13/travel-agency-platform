import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaBoxOpen, 
  FaChartLine, 
  FaBuilding, 
  FaPlus,
  FaEdit,
  FaBars, 
  FaChevronRight, 
  FaChevronLeft,
  FaSuitcase,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const agencyLinks = [
  { to: '/dashboard/agency', label: 'Agency Dashboard', icon: <FaTachometerAlt /> },
  { to: '/packages/manage', label: 'Manage Packages', icon: <FaBoxOpen /> },
  { to: '/packages', label: 'Browse Packages', icon: <FaSuitcase /> },
  { to: '/map', label: 'Resort Locations', icon: <FaMapMarkerAlt /> },
];

const profileLinks = [
  { to: '/profile', label: 'Company Profile', icon: <FaBuilding /> },
];

const TravelAgencySidebar = ({ collapsed, onToggleCollapse }) => {
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
    <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-[260px]'} bg-gradient-to-b from-emerald-900 to-emerald-800 min-h-screen border-r border-emerald-700 shadow-xl px-2 py-8 transition-all duration-300`}>
      {/* App Name */}
      <div className={`flex items-center justify-center mb-8 h-10 select-none ${collapsed ? 'w-10 mx-auto' : ''}`}>
        {collapsed ? (
          <span className="text-2xl font-extrabold text-yellow-400">T</span>
        ) : (
          <div className="flex items-center gap-2">
            <FaBuilding className="text-yellow-400 text-xl" />
            <span className="text-xl font-extrabold text-white tracking-wide">AgencyHub</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className={`mb-8 flex items-center justify-center w-10 h-10 rounded-full hover:bg-emerald-700 transition self-center text-white ${collapsed ? 'ml-1' : 'ml-auto mr-2'}`}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Company Info */}
      {!collapsed && user && (
        <div className="mb-6 p-3 bg-emerald-800 rounded-lg border border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <FaBuilding className="text-emerald-900 text-sm" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user.companyName || user.name}</p>
              <p className="text-yellow-400 text-xs uppercase tracking-wide">Travel Agency</p>
            </div>
          </div>
        </div>
      )}

      {/* Agency Navigation */}
      <nav className="flex-1 mt-2">
        <div className="mb-6">
          {!collapsed && (
            <h3 className="text-yellow-400 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
              Agency Management
            </h3>
          )}
          <ul className="space-y-2">
            {agencyLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to 
                      ? 'bg-yellow-400 text-emerald-900 shadow-lg' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {!collapsed && link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="mb-6">
            <h3 className="text-yellow-400 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/packages/manage"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
              >
                <FaPlus className="text-sm" />
                Add New Package
              </Link>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div>
          {!collapsed && (
            <h3 className="text-yellow-400 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
              Profile
            </h3>
          )}
          <ul className="space-y-2">
            {profileLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to 
                      ? 'bg-yellow-400 text-emerald-900 shadow-lg' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {!collapsed && link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-8">
        <button 
          onClick={handleLogout} 
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className="text-lg" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default TravelAgencySidebar;
