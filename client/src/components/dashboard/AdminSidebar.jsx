import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaBuilding, 
  FaMapMarkerAlt,
  FaSync,
  FaBars, 
  FaChevronRight, 
  FaChevronLeft,
  FaTools,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/dashboard/admin', label: 'Admin Dashboard', icon: <FaTachometerAlt /> },
  { to: '/admin/users', label: 'User Management', icon: <FaUsers /> },
  { to: '/admin/tools', label: 'Admin Tools', icon: <FaTools /> },
  { to: '/scraper-tools', label: 'Scraping Manager', icon: <FaSync /> },
  { to: '/map', label: 'Map Management', icon: <FaMapMarkerAlt /> },
];

const profileLinks = [
  { to: '/profile', label: 'Your Profile', icon: <FaUser /> },
];

const AdminSidebar = ({ collapsed, onToggleCollapse }) => {
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
    <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-[260px]'} bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen border-r border-slate-700 shadow-xl px-2 py-8 transition-all duration-300`}>
      {/* App Name */}
      <div className={`flex items-center justify-center mb-8 h-10 select-none ${collapsed ? 'w-10 mx-auto' : ''}`}>
        {collapsed ? (
          <span className="text-2xl font-extrabold text-yellow-400">A</span>
        ) : (
          <div className="flex items-center gap-2">
            <FaUserShield className="text-yellow-400 text-xl" />
            <span className="text-xl font-extrabold text-white tracking-wide">AdminPanel</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className={`mb-8 flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-700 transition self-center text-white ${collapsed ? 'ml-1' : 'ml-auto mr-2'}`}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* User Info */}
      {!collapsed && user && (
        <div className="mb-6 p-3 bg-slate-800 rounded-lg border border-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <FaUserShield className="text-slate-900 text-sm" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user.name}</p>
              <p className="text-yellow-400 text-xs uppercase tracking-wide">Administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Navigation */}
      <nav className="flex-1 mt-2">
        <div className="mb-6">
          {!collapsed && (
            <h3 className="text-yellow-400 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
              Administration
            </h3>
          )}
          <ul className="space-y-2">
            {adminLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to 
                      ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {!collapsed && link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

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
                      ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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

export default AdminSidebar;
