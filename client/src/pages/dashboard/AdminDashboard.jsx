import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCard from '../../components/dashboard/DashboardCard';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ProgressBar from '../../components/dashboard/ProgressBar';
import ScrapingManager from '../../components/admin/ScrapingManager';
import TravelAgencyApproval from '../../components/admin/TravelAgencyApproval';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile/admin/users`, {
        withCredentials: true
      });
      const users = response.data.users || [];
      const agencies = users.filter(user => user.role === 'travel_agency');
      const pending = agencies.filter(agency => agency.status === 'pending');
      
      setTotalAgencies(agencies.length);
      setPendingApprovals(pending.length);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/dashboard/admin/analytics`, {
        withCredentials: true
      });
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Inquiries" value={analytics.totalInquiries} loading={loading} />
        <StatCard title="Active Users (30d)" value={analytics.activeUsers} loading={loading} />
        <StatCard 
          title="Pending Approvals" 
          value={pendingApprovals} 
          loading={loading}
          className={pendingApprovals > 0 ? "border-l-4 border-l-yellow-500 bg-yellow-50" : ""}
        />
        <StatCard title="Total Agencies" value={totalAgencies} loading={loading} />
      </div>

      {/* Quick Action for Pending Approvals */}
      {pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                {pendingApprovals} Travel {pendingApprovals === 1 ? 'Agency' : 'Agencies'} Awaiting Approval
              </h3>
              <p className="text-yellow-700">Review and approve new travel agency registrations</p>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('approval-section').scrollIntoView({ behavior: 'smooth' })}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Review Pending Applications
          </button>
        </div>
      )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard title="Inquiries by Package">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3">Package</th>
                    <th className="text-left py-2 px-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.inquiriesByPackage?.slice(0, 5).map(pkg => (
                    <tr key={pkg._id} className="border-t">
                      <td className="py-2 px-3">{pkg.title || pkg._id}</td>
                      <td className="py-2 px-3 font-semibold">{pkg.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.inquiriesByPackage?.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">Showing top 5 packages</p>
              )}
            </DashboardCard>
            <DashboardCard title="Inquiries by Month">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3">Month</th>
                    <th className="text-left py-2 px-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.inquiriesByMonth?.map(m => (
                    <tr key={m._id} className="border-t">
                      <td className="py-2 px-3">{m._id}</td>
                      <td className="py-2 px-3 font-semibold">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard title="Most Reviewed Packages">
              <table className="w-full text-sm">
                <thead><tr><th>Package ID</th><th>Reviews</th></tr></thead>
                <tbody>
                  {analytics.mostReviewedPackages.map(pkg => (
                    <tr key={pkg._id}><td>{pkg._id}</td><td>{pkg.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </DashboardCard>
            <DashboardCard title="Most Popular Packages (by Inquiry)">
              <table className="w-full text-sm">
                <thead><tr><th>Package</th><th>Inquiries</th></tr></thead>
                <tbody>
                  {analytics.mostPopularPackages.map(pkg => (
                    <tr key={pkg._id}><td>{pkg.title || pkg._id}</td><td>{pkg.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard title="Average Rating per Package">
              <table className="w-full text-sm">
                <thead><tr><th>Package ID</th><th>Avg. Rating</th></tr></thead>
                <tbody>
                  {analytics.avgRatingPerPackage.map(pkg => (
                    <tr key={pkg._id}><td>{pkg._id}</td><td>{pkg.avg?.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </DashboardCard>
            <DashboardCard title="Recent Reviews">
              <ul className="text-sm space-y-2">
                {analytics.recentReviews.map(fb => (
                  <li key={fb._id} className="border-b pb-2">
                    <div><b>{fb.userName || 'Anonymous'}</b> ({fb.rating}★): {fb.feedback}</div>
                    <div className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          </div>

          {/* Admin Tools Section */}
          <div id="approval-section" className="grid grid-cols-1 gap-6 mb-8">
            <DashboardCard title="🏢 Travel Agency Approvals">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Agency Management Center</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Review, approve, or reject travel agency applications. Ensure all business documentation is valid before approval.
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pending: {pendingApprovals}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Active: {totalAgencies - pendingApprovals}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Total: {totalAgencies}</span>
                  </div>
                </div>
              </div>
              <TravelAgencyApproval onApprovalChange={fetchUserStats} />
            </DashboardCard>
          </div>

          {/* Additional Admin Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="⚙️ Quick Actions">
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/admin/users'}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-blue-800">User Management</div>
                  <div className="text-sm text-blue-600">Manage all system users</div>
                </button>
                <button 
                  onClick={fetchUserStats}
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-green-800">Refresh Data</div>
                  <div className="text-sm text-green-600">Update dashboard statistics</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/tools'}
                  className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-purple-800">Admin Tools</div>
                  <div className="text-sm text-purple-600">Access advanced features</div>
                </button>
              </div>
            </DashboardCard>
            <DashboardCard title=" Scraping Manager">
              <ScrapingManager />
            </DashboardCard>
          </div>
    </div>
  );
};

export default AdminDashboard;
