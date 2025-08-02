import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import AgencyPackageCard from '../../components/packages/AgencyPackageCard';
import PackageFormModal from '../../components/packages/PackageFormModal';
import { FaPlus, FaBox, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Determines the API endpoint based on user's company/provider
 */
const getProviderApiBase = (user) => {
  if (!user || user.role !== 'travel_agency') return null;
  
  const companyName = user.companyName?.toLowerCase() || '';
  const userName = user.name?.toLowerCase() || '';
  
  if (companyName.includes('amitravel') || userName.includes('amitravel')) {
    return '/api/packages/amitravel';
  }
  if (companyName.includes('holidaygogo') || userName.includes('holidaygogo')) {
    return '/api/packages/holidaygogogo';
  }
  
  return null;
};

const ManagePackages = () => {
  const { user } = useAuth();
  const [myPackages, setMyPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  /**
   * Fetch packages for the current user/agency
   */
  const fetchMyPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBase = getProviderApiBase(user);
      if (!apiBase) {
        throw new Error('Provider not supported or user not authorized');
      }
      
      const response = await axios.get(`${API_URL}${apiBase}/my`, { 
        withCredentials: true 
      });
      
      setMyPackages(response.data.data?.packages || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load packages';
      setError(errorMessage);
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyPackages();
    }
  }, [fetchMyPackages, user]);

  /**
   * Handle adding a new package
   */
  const handleAddPackage = () => {
    setEditPackage(null);
    setShowPackageForm(true);
  };

  /**
   * Handle editing an existing package
   */
  const handleEditPackage = (pkg) => {
    setEditPackage(pkg);
    setShowPackageForm(true);
  };

  /**
   * Handle package form close and refresh data
   */
  const handlePackageFormClose = () => {
    setShowPackageForm(false);
    setEditPackage(null);
    fetchMyPackages();
  };

  /**
   * Handle package deletion with confirmation
   */
  const handleDeletePackage = async (packageId) => {
    const confirmed = window.confirm('Are you sure you want to delete this package? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleteLoading(packageId);
      const apiBase = getProviderApiBase(user);
      
      if (!apiBase) {
        throw new Error('Provider not authorized');
      }

      await axios.delete(`${API_URL}${apiBase}/${packageId}`, { 
        withCredentials: true 
      });
      
      // Remove package from local state immediately for better UX
      setMyPackages(prev => prev.filter(pkg => pkg._id !== packageId));
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete package';
      alert(errorMessage);
      console.error('Error deleting package:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="mt-8">
        <DashboardCard title="My Packages">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Packages</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchMyPackages}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <DashboardCard title="My Packages">
        {/* Header with Add Package Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Package Management</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage your travel packages, add new ones, or edit existing packages
            </p>
          </div>
          <button 
            onClick={handleAddPackage} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus className="text-sm" />
            Add Package
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your packages...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && myPackages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaBox className="text-4xl mb-4 mx-auto text-gray-400" />
            <h3 className="font-semibold mb-2 text-gray-700">No packages found</h3>
            <p className="text-sm mb-4">Start by adding your first travel package</p>
            <button 
              onClick={handleAddPackage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Your First Package
            </button>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && myPackages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPackages.map(pkg => (
              <AgencyPackageCard
                key={pkg._id}
                pkg={pkg}
                onEdit={handleEditPackage}
                onDelete={handleDeletePackage}
                deleteLoading={deleteLoading === pkg._id}
              />
            ))}
          </div>
        )}
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
    </div>
  );
};

export default ManagePackages; 