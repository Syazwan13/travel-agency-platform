import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserDashboardSidebar = () => {
  const { user, favorites } = useAuth();
  // Always treat favorites as an array
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  // You may want to fetch stats from a context or prop, or pass them in as props if needed
  // For now, just show favorites count and user info

  // Example stats (customize as needed)
  const statsData = [
    { label: 'Saved Favorites', value: safeFavorites.length, color: '#a78bfa' },
    // Add more stats as needed
  ];
  const maxStat = Math.max(...statsData.map(s => s.value), 1);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-2 overflow-hidden">
          <img
            src={
              user?.photo
                ? user.photo.startsWith('http')
                  ? user.photo
                  : `${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'http://167.172.66.203:5001')}${user.photo}`
                : '/default-avatar.png'
            }
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
          />
        </div>
        <div className="text-lg font-semibold text-gray-800">Good Morning{user?.name ? `, ${user.name}` : ''} <span className="inline-block">🔥</span></div>
        <div className="text-xs text-gray-400 mt-1 text-center">Continue your learning to achieve your target!</div>
      </div>
      <div className="w-full">
        <div className="text-sm font-semibold text-gray-600 mb-2">Statistic</div>
        {/* Bar Chart Visualization */}
        <div className="flex flex-col gap-4 mt-2">
          {statsData.map((stat, idx) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-24 text-xs text-gray-500">{stat.label}</div>
              <div className="flex-1 h-4 bg-gray-100 rounded-full relative overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(stat.value / maxStat) * 100}%`,
                    background: stat.color,
                  }}
                ></div>
              </div>
              <div className="ml-2 text-sm font-semibold text-gray-700 min-w-[24px] text-right">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardSidebar; 