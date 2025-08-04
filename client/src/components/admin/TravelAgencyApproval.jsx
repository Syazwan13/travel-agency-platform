import React, { useState, useEffect } from 'react';
import api from '../../utils/apiConfig';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiGlobe, 
    FiHome, 
    FiCheck, 
    FiX, 
    FiClock,
    FiAlertCircle
} from 'react-icons/fi';

const TravelAgencyApproval = ({ onApprovalChange }) => {
    const [pendingAgencies, setPendingAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedAgency, setExpandedAgency] = useState(null);
    const [selectedAgencies, setSelectedAgencies] = useState([]);
    const [showBatchActions, setShowBatchActions] = useState(false);

    useEffect(() => {
        fetchPendingAgencies();
    }, []);

    const fetchPendingAgencies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/profile/admin/users');
            
            // Filter for pending travel agencies
            const pending = response.data.filter(user => 
                user.role === 'travel_agency' && user.status === 'pending'
            );
            
            setPendingAgencies(pending);
        } catch (err) {
            setError('Failed to fetch pending agencies');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId, approved) => {
        try {
            setError('');
            setSuccess('');
            
            const newStatus = approved ? 'active' : 'suspended';
            
            await api.put(
                `/api/profile/admin/users/${userId}/status`,
                { status: newStatus }
            );
            
            // Remove from pending list
            setPendingAgencies(prev => prev.filter(agency => agency._id !== userId));
            
            setSuccess(`Travel agency ${approved ? 'approved' : 'rejected'} successfully`);
            
            // Notify parent component of approval change
            if (onApprovalChange) {
                onApprovalChange();
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update agency status');
        }
    };

    const toggleExpanded = (agencyId) => {
        setExpandedAgency(expandedAgency === agencyId ? null : agencyId);
    };

    const handleSelectAgency = (agencyId) => {
        setSelectedAgencies(prev => 
            prev.includes(agencyId) 
                ? prev.filter(id => id !== agencyId)
                : [...prev, agencyId]
        );
    };

    const handleSelectAll = () => {
        if (selectedAgencies.length === pendingAgencies.length) {
            setSelectedAgencies([]);
        } else {
            setSelectedAgencies(pendingAgencies.map(agency => agency._id));
        }
    };

    const handleBatchApproval = async (approved) => {
        if (selectedAgencies.length === 0) return;
        
        if (!window.confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} ${selectedAgencies.length} agencies?`)) {
            return;
        }

        try {
            setError('');
            const promises = selectedAgencies.map(agencyId => 
                api.put(
                    `/api/profile/admin/users/${agencyId}/status`,
                    { status: approved ? 'active' : 'suspended' }
                )
            );

            await Promise.all(promises);

            // Remove processed agencies from pending list
            setPendingAgencies(prev => prev.filter(agency => !selectedAgencies.includes(agency._id)));
            setSelectedAgencies([]);
            
            setSuccess(`${selectedAgencies.length} agencies ${approved ? 'approved' : 'rejected'} successfully`);
            
            if (onApprovalChange) {
                onApprovalChange();
            }
            
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError('Failed to process batch approval');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading pending agencies...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <FiClock className="text-yellow-500" size={24} />
                <h3 className="text-xl font-bold text-gray-800">
                    Pending Travel Agency Approvals ({pendingAgencies.length})
                </h3>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <FiAlertCircle className="text-red-500" />
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <FiCheck className="text-green-500" />
                        <p className="text-green-600 font-medium">{success}</p>
                    </div>
                </div>
            )}

            {/* Batch Operations */}
            {pendingAgencies.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedAgencies.length === pendingAgencies.length && pendingAgencies.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Select All ({pendingAgencies.length})</span>
                        </label>
                        {selectedAgencies.length > 0 && (
                            <span className="text-sm text-blue-600 font-medium">
                                {selectedAgencies.length} selected
                            </span>
                        )}
                    </div>
                    
                    {selectedAgencies.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBatchApproval(false)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                <FiX size={14} />
                                Reject Selected ({selectedAgencies.length})
                            </button>
                            <button
                                onClick={() => handleBatchApproval(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                <FiCheck size={14} />
                                Approve Selected ({selectedAgencies.length})
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Pending Agencies List */}
            {pendingAgencies.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FiCheck className="mx-auto text-green-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No pending travel agency approvals at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingAgencies.map((agency) => (
                        <div key={agency._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            {/* Agency Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Selection Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedAgencies.includes(agency._id)}
                                            onChange={() => handleSelectAgency(agency._id)}
                                            className="mt-1 rounded border-gray-300"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <FiHome className="text-blue-600" size={20} />
                                                <h4 className="text-lg font-bold text-gray-800">
                                                    {agency.companyName || 'No Company Name'}
                                                </h4>
                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    PENDING
                                                </span>
                                            </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FiUser size={16} />
                                                <span>{agency.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiMail size={16} />
                                                <span>{agency.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiPhone size={16} />
                                                <span>{agency.phoneNumber || 'No phone'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiClock size={16} />
                                                <span>Applied: {new Date(agency.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => toggleExpanded(agency._id)}
                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            {expandedAgency === agency._id ? 'Hide Details' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedAgency === agency._id && (
                                <div className="p-6 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Company Information */}
                                        <div>
                                            <h5 className="font-medium text-gray-800 mb-3">Company Information</h5>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium">Registration Number:</span>
                                                    <span className="ml-2">{agency.businessRegistrationNumber || 'Not provided'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Contact Person:</span>
                                                    <span className="ml-2">{agency.contactPerson || 'Not provided'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">WhatsApp:</span>
                                                    <span className="ml-2">{agency.whatsappNumber || 'Not provided'}</span>
                                                </div>
                                                {agency.website && (
                                                    <div className="flex items-center gap-2">
                                                        <FiGlobe size={16} />
                                                        <a 
                                                            href={agency.website} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {agency.website}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        <div>
                                            <h5 className="font-medium text-gray-800 mb-3">Address</h5>
                                            <div className="flex items-start gap-2 text-sm">
                                                <FiMapPin size={16} className="mt-1 flex-shrink-0" />
                                                <div>
                                                    {agency.address?.street && <div>{agency.address.street}</div>}
                                                    <div>
                                                        {agency.address?.city && `${agency.address.city}, `}
                                                        {agency.address?.state && `${agency.address.state} `}
                                                        {agency.address?.postalCode}
                                                    </div>
                                                    <div>{agency.address?.country || 'Malaysia'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specializations */}
                                        {agency.specializations && agency.specializations.length > 0 && (
                                            <div className="md:col-span-2">
                                                <h5 className="font-medium text-gray-800 mb-3">Specializations</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {agency.specializations.map((spec, index) => (
                                                        <span 
                                                            key={index}
                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {agency.description && (
                                            <div className="md:col-span-2">
                                                <h5 className="font-medium text-gray-800 mb-3">Description</h5>
                                                <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                                                    {agency.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                                <button
                                    onClick={() => handleApproval(agency._id, false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <FiX size={16} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApproval(agency._id, true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <FiCheck size={16} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TravelAgencyApproval;
