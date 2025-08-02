import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DashboardSidebar from './DashboardSidebar';
import AdminSidebar from './AdminSidebar';
import TravelAgencySidebar from './TravelAgencySidebar';
import TelegramNotificationModal from '../common/TelegramNotificationModal';
import { shouldShowTelegramModal } from '../../utils/telegramUtils';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, title, subtitle, rightSidebar = null }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const { user, checkAuthStatus } = useAuth();

  useEffect(() => {
    // Use the utility function to determine if modal should be shown
    setShowTelegramModal(shouldShowTelegramModal(user));
  }, [user]);

  const renderSidebar = () => {
    if (!user) {
      return <DashboardSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />;
      case 'travel_agency':
        return <TravelAgencySidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />;
      default:
        return <DashboardSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />;
    }
  };

  return (
    <>
      <TelegramNotificationModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        refreshUser={checkAuthStatus}
        user={user}
      />
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-sans">
        {/* Dynamic Sidebar based on user role */}
        {renderSidebar()}
        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-[260px]'} md:ml-0`}
          style={{ marginLeft: 0 }}
        >
          <div className="px-4 py-10 md:px-12 md:py-14">
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow-md mb-2">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-xl text-blue-700 font-medium">{subtitle}</p>
              )}
            </div>
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </div>
        {/* Optional Right Sidebar (profile/statistics) */}
        {rightSidebar && (
          <div className="hidden xl:block w-[340px] bg-white/80 border-l border-gray-100 p-6 min-h-screen shadow-sm">
            {rightSidebar}
          </div>
        )}
      </div>
    </>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  rightSidebar: PropTypes.node
};

export default DashboardLayout;
