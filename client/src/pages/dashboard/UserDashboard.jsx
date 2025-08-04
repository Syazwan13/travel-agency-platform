import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import StatCard from '../../components/dashboard/StatCard';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? "http://localhost:5001" : "http://167.172.66.203:5001");

const UserDashboard = () => {
  const { user, favorites, removeFavorite } = useAuth();
  const [userStats, setUserStats] = useState({
    favoritesCount: 0,
    bookingHistoryCount: 0,
    preferredDestinationsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [showAllInquiries, setShowAllInquiries] = useState(false);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchRecentInquiries();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await fetch(`${API_URL}/api/dashboard/user/stats`, { credentials: 'include' });
      const dashboardData = await dashboardResponse.json();
      setUserStats({
        favoritesCount: dashboardData.data?.favoritesCount || 0,
        bookingHistoryCount: dashboardData.data?.bookingHistoryCount || 0,
        preferredDestinationsCount: dashboardData.data?.preferredDestinationsCount || 0
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load your data');
      setLoading(false);
    }
  };

  const fetchRecentInquiries = async () => {
    try {
      const limit = showAllInquiries ? 100 : 3;
      const response = await fetch(`${API_URL}/api/inquiries?page=1&limit=${limit}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setRecentInquiries(data.data || []);
        setTotalInquiries(data.pagination?.total || data.data.length || 0);
      } else {
        setRecentInquiries([]);
        setTotalInquiries(0);
      }
    } catch (err) {
      setRecentInquiries([]);
      setTotalInquiries(0);
    }
  };

  // Always treat favorites as an array
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  // Right sidebar (profile/statistics)
  const statsData = [
    { label: 'Saved Favorites', value: safeFavorites.length, color: '#a78bfa' },
    { label: 'Bookings', value: totalInquiries, color: '#60a5fa' },
    { label: 'Preferred Destinations', value: userStats.preferredDestinationsCount, color: '#34d399' },
  ];

  const maxStat = Math.max(...statsData.map(s => s.value), 1);

  const rightSidebar = (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-2 overflow-hidden">
          <img
            src={
              user?.photo
                ? user.photo.startsWith('/uploads/')
                  ? `${import.meta.env.VITE_API_URL}${user.photo}`
                  : user.photo
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

  return (
    <>
      {/* Main dashboard content */}
      <div className="dashboard-stats mb-8 flex gap-6">
        <StatCard
          title="Saved Favorites"
          value={safeFavorites.length}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>}
          loading={loading}
        />
        <StatCard
          title="Bookings"
          value={totalInquiries}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" /></svg>}
          loading={loading}
        />
        <StatCard
          title="Preferred Destinations"
          value={userStats.preferredDestinationsCount}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
          loading={loading}
        />
      </div>
      <div className="dashboard-section">
        <h3 className="dashboard-section-title">My Favorites</h3>
        {safeFavorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You have no saved favorites yet.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {(showAllFavorites ? safeFavorites : safeFavorites.slice(0, 3)).map((favorite, index) => (
                <div key={index} className="flex items-center border-b border-gray-100 pb-3 last:border-b-0 gap-4">
                  <img
                    src={favorite.image || 'https://via.placeholder.com/80x60?text=No+Image'}
                    alt={favorite.title || 'Package'}
                    className="w-20 h-16 object-cover rounded shadow"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{favorite.title || 'Package Title'}</h4>
                    <p className="text-xs text-gray-600 mb-1">{favorite.destination || 'Destination'} • {favorite.price || 'Price'}</p>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 text-lg px-2"
                    onClick={() => removeFavorite(favorite.packageId)}
                    title="Remove from favorites"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {safeFavorites.length > 3 && !showAllFavorites && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={() => setShowAllFavorites(true)}
                >
                  View All
                </button>
              </div>
            )}
            {showAllFavorites && safeFavorites.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  onClick={() => setShowAllFavorites(false)}
                >
                  Show Less
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="dashboard-section mt-8">
        <h3 className="dashboard-section-title text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8M12 17v4m-6-8V7a6 6 0 1112 0v6a2 2 0 002 2h-2a2 2 0 01-2-2V7a4 4 0 00-8 0v6a2 2 0 01-2 2H4a2 2 0 002-2z" /></svg>
          Recently Submitted Inquiries
        </h3>
        {recentInquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You have not submitted any inquiries yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentInquiries.map((inquiry, idx) => (
                <div key={inquiry._id || idx} className="bg-white rounded-lg shadow p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 rounded-full p-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
                    </div>
                    <h4 className="font-semibold text-base text-gray-800 truncate">{inquiry.packageInfo?.packageTitle || 'Package Title'}</h4>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243 4.243a4 4 0 00-5.657 5.657z" /></svg>
                    {inquiry.packageInfo?.packageDestination || 'Destination'}
                  </div>
                  {inquiry.travelDetails?.preferredDates?.startDate && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Dates:</span> {new Date(inquiry.travelDetails.preferredDates.startDate).toLocaleDateString()} - {new Date(inquiry.travelDetails.preferredDates.endDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 font-medium">Status: {inquiry.status || 'Submitted'}</span>
                  </div>
                </div>
              ))}
            </div>
            {totalInquiries > 3 && !showAllInquiries && (
              <div className="flex justify-center mt-6">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={() => setShowAllInquiries(true)}
                >
                  View All
                </button>
              </div>
            )}
            {showAllInquiries && totalInquiries > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  onClick={() => setShowAllInquiries(false)}
                >
                  Show Less
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default UserDashboard;
