import React, { useState, useEffect } from 'react';
import api from '../../utils/apiConfig';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import StatCard from '../../components/dashboard/StatCard';
import PackageGrid from '../../components/packages/PackageGrid';
import AgencyPackageCard from '../../components/packages/AgencyPackageCard';
import PackageFormModal from '../../components/packages/PackageFormModal';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const getProviderApiBase = (user) => {
  if (!user || user.role !== 'travel_agency') return null;
  if (user.companyName?.toLowerCase().includes('amitravel') || user.name?.toLowerCase().includes('amitravel')) {
    return '/api/packages/amitravel';
  }
  if (user.companyName?.toLowerCase().includes('holidaygogo') || user.name?.toLowerCase().includes('holidaygogo')) {
    return '/api/packages/holidaygogogo';
  }
  return null;
};

const AgencyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalInquiries: 0,
    popularDestinations: [],
    packagesByProvider: [],
    inquiryTrends: [],
    recentReviews: [],
    averageRating: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPackages, setMyPackages] = useState([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editPackage, setEditPackage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchMyPackages();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/agency/stats');
      const data = response.data.data;
      setStats({
        totalPackages: data.totalPackages || 0,
        totalInquiries: data.inquiryTrends ? data.inquiryTrends.reduce((sum, t) => sum + t.count, 0) : 0,
        popularDestinations: data.popularDestinations || [],
        packagesByProvider: data.packagesByProvider || [],
        inquiryTrends: data.inquiryTrends || [],
        recentReviews: data.recentReviews || [],
        averageRating: data.averageRating || null
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPackages = async () => {
    try {
      setLoading(true);
      const apiBase = getProviderApiBase(user);
      if (!apiBase) {
        setError('Unable to identify your provider. Please contact support.');
        return;
      }
      const response = await api.get(`${apiBase}/my`);
      setMyPackages(response.data.data.packages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load your packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = () => {
    setEditPackage(null);
    setShowPackageForm(true);
  };

  const handleEditPackage = (pkg) => {
    setEditPackage(pkg);
    setShowPackageForm(true);
  };

  const handlePackageFormClose = () => {
    setShowPackageForm(false);
    setEditPackage(null);
    fetchMyPackages();
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const apiBase = getProviderApiBase(user);
      if (!apiBase) throw new Error('Unknown provider');
      
                      await api.delete(`${apiBase}/${packageId}`);
      
      // Refresh the packages list
      fetchMyPackages();
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package');
    }
  };

  const handleRefreshData = () => {
    fetchDashboardData();
    fetchMyPackages();
  };

  const getDashboardTitle = () => {
    if (user?.role === 'travel_agency') {
      return `Welcome, ${user?.companyName || user?.name}!`;
    }
    return "Travel Agency Dashboard";
  };

  const getDashboardSubtitle = () => {
    if (user?.role === 'travel_agency') {
      return "Manage your packages and track performance";
    }
    return "Performance analytics and content management";
  };

  return (
    <>
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleAddPackage}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add New Package
          </button>
          <button
            onClick={() => navigate('/packages/manage')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiSettings className="w-4 h-4" />
            Manage All Packages
          </button>
          <button
            onClick={handleRefreshData}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Packages"
          value={myPackages.length}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          loading={loading}
        />
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01" /></svg>}
          loading={loading}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating !== null ? stats.averageRating.toFixed(2) : 'N/A'}
          icon={<span className="text-yellow-500">★</span>}
          loading={loading}
        />
        <StatCard
          title="Recent Reviews"
          value={stats.recentReviews.length}
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01" /></svg>}
          loading={loading}
        />
      </div>

      {/* Package Management Section */}
      <DashboardCard title="Package Management">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Your Packages</h3>
          <button
            onClick={handleAddPackage}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add New Package
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMyPackages}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : myPackages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No packages yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first travel package</p>
            <button
              onClick={handleAddPackage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Add Your First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPackages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  {pkg.image && (
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                      title="Edit Package"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg._id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                      title="Delete Package"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{pkg.title}</h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      RM {pkg.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {pkg.duration} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{pkg.destination}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Destinations Card */}
        <DashboardCard title="Popular Destinations">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Packages</th>
                  <th className="px-4 py-2">Inquiries</th>
                </tr>
              </thead>
              <tbody>
                {(stats.popularDestinations || []).map((dest, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{dest.name}</td>
                    <td className="px-4 py-2">{dest.packages}</td>
                    <td className="px-4 py-2">{dest.inquiries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Customer Feedback Card */}
        <DashboardCard title="Customer Feedback">
          <div className="mb-4">
            <span className="text-2xl font-bold text-yellow-500">★</span>
            <span className="text-xl font-semibold ml-2">{stats.averageRating !== null ? stats.averageRating.toFixed(2) : 'N/A'}</span>
            <span className="ml-2 text-gray-500">Average Rating</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">Reviewer</th>
                  <th className="px-4 py-2">Rating</th>
                  <th className="px-4 py-2">Comment</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentReviews || []).map((review, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{review.userName || 'Anonymous'}</td>
                    <td className="px-4 py-2">{review.rating}</td>
                    <td className="px-4 py-2">{review.feedback}</td>
                    <td className="px-4 py-2">{new Date(review.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>

      {/* Inquiry Trends Chart */}
      <DashboardCard title="Inquiry Trends">
        <Line
          data={{
            labels: (stats.inquiryTrends || []).map(item => item._id),
            datasets: [
              {
                label: 'Inquiries',
                data: (stats.inquiryTrends || []).map(item => item.count),
                backgroundColor: 'rgba(59,130,246,0.2)',
                borderColor: 'rgba(59,130,246,1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </DashboardCard>

      {/* Package Form Modal */}
      {showPackageForm && (
        <PackageFormModal
          open={showPackageForm}
          onClose={handlePackageFormClose}
          packageData={editPackage}
          providerContactId={user?.providerContactId}
          user={user}
        />
      )}
    </>
  );
};

export default AgencyDashboard;
