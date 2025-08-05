import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/apiConfig';
import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import TelegramNotificationModal, { shouldShowTelegramModal, resetTelegramModalPreference } from '../../components/common/TelegramNotificationModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';

const UserProfile = () => {
    const { user, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editSection, setEditSection] = useState(null); // 'personal', 'address', or null
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const fileInputRef = useRef(null);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        userRole: '',
        photo: '',
        location: '',
        address: {
            country: '',
            city: '',
            postalCode: ''
        }
    });
    const [latestInquiryId, setLatestInquiryId] = useState(null);
    const [showTelegramModal, setShowTelegramModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/profile/me');
                console.log('Fetched user profile:', response.data); // Debug log
                const d = response.data || {};
                let firstName = '', lastName = '';
                if (d.name) {
                    const parts = d.name.trim().split(' ');
                    firstName = parts[0] || '';
                    lastName = parts.slice(1).join(' ');
                }
                setProfileData({
                    firstName: firstName || '-',
                    lastName: lastName || '-',
                    email: d.email || '-',
                    phoneNumber: d.phoneNumber || '-',
                    userRole: (d.role || d.userRole || user?.role || 'user').toLowerCase(),
                    photo: d.photo || '',
                    location: (d.address?.city && d.address?.country) ? `${d.address.city}, ${d.address.country}` : '-',
                    address: {
                        country: d.address?.country || '-',
                        city: d.address?.city || '-',
                        postalCode: d.address?.postalCode || '-'
                    }
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch profile');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await api.get('/api/inquiries');
                if (response.data && response.data.data && response.data.data.length > 0) {
                    setLatestInquiryId(response.data.data[0]._id);
                }
            } catch (err) {}
        };
        fetchInquiries();
    }, []);

    useEffect(() => {
        // Use the utility function to determine if modal should be shown
        setShowTelegramModal(shouldShowTelegramModal(user));
    }, [user]);

    const handleManualTelegramConnect = () => {
        // Reset the preference and show the modal
        resetTelegramModalPreference();
        setShowTelegramModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('photo', file);
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await api.put(
                '/api/profile/photo',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setProfileData(prev => ({ ...prev, photo: response.data.photo }));
            setSuccess('Profile photo updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile photo');
        } finally {
            setLoading(false);
        }
    };
    const handleSectionSave = async (section) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            // Join first/last name for backend
            const payload = {
                ...profileData,
                name: (profileData.firstName + (profileData.lastName ? ' ' + profileData.lastName : '')).trim(),
            };
            delete payload.firstName;
            delete payload.lastName;
            const response = await api.put(
                '/api/profile/update',
                payload
            );
            setSuccess('Profile updated successfully');
            setEditSection(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
    return (
        <>
            <TelegramNotificationModal isOpen={showTelegramModal} onClose={() => setShowTelegramModal(false)} refreshUser={checkAuthStatus} user={user} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-12 px-2">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-blue-900 mb-10 drop-shadow-md text-center">My Profile</h1>
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                    )}
                    {/* Profile Card */}
                    <div className="bg-white shadow-xl rounded-3xl p-10 flex flex-col md:flex-row items-center mb-12 border border-blue-100 hover:shadow-2xl transition-shadow duration-300 group relative">
                        <div className="relative flex-shrink-0">
                                                         <img
                                 src={profileData.photo ? (profileData.photo.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'http://167.172.66.203:5001')}${profileData.photo}` : profileData.photo) : '/default-avatar.png'}
                                 alt="Profile"
                                 className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-lg group-hover:scale-105 group-hover:shadow-2xl transition-transform duration-300"
                             />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 border-2 border-white transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div className="md:ml-10 mt-6 md:mt-0 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-blue-900 mb-1">{profileData.firstName} {profileData.lastName}</h2>
                            <div className="text-blue-600 font-semibold text-lg mb-1 capitalize">{profileData.userRole || 'user'}</div>
                            <div className="text-gray-500 text-md">{profileData.location || '-'}</div>
                        </div>
                    </div>
                    {/* Personal Information Card */}
                    <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-blue-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-800">Personal Information</h2>
                            {editSection !== 'personal' && (
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition" onClick={() => setEditSection('personal')}>Edit</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-xs text-gray-500">First Name</div>
                                {editSection === 'personal' ? (
                                    <input type="text" name="firstName" value={profileData.firstName} onChange={handleInputChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.firstName}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Last Name</div>
                                {editSection === 'personal' ? (
                                    <input type="text" name="lastName" value={profileData.lastName} onChange={handleInputChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.lastName}</div>
                                )}
                            </div>
                            {/* Date of Birth removed since not in backend */}
                            <div></div>
                            <div>
                                <div className="text-xs text-gray-500">Email Address</div>
                                <div className="font-medium text-lg">{profileData.email}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Phone Number</div>
                                {editSection === 'personal' ? (
                                    <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleInputChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.phoneNumber}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">User Role</div>
                                <div className="font-medium text-lg">{profileData.userRole}</div>
                            </div>
                        </div>
                        {editSection === 'personal' && (
                            <div className="flex justify-end mt-6 space-x-2">
                                <button className="bg-gray-300 text-gray-700 px-5 py-2 rounded-full" onClick={() => setEditSection(null)}>Cancel</button>
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition" onClick={() => handleSectionSave('personal')}>Save</button>
                            </div>
                        )}
                    </div>
                    {/* Address Card */}
                    <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-blue-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-800">Address</h2>
                            {editSection !== 'address' && (
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition" onClick={() => setEditSection('address')}>Edit</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-xs text-gray-500">Country</div>
                                {editSection === 'address' ? (
                                    <input type="text" name="country" value={profileData.address.country} onChange={handleAddressChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.address.country}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">City</div>
                                {editSection === 'address' ? (
                                    <input type="text" name="city" value={profileData.address.city} onChange={handleAddressChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.address.city}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Postal Code</div>
                                {editSection === 'address' ? (
                                    <input type="text" name="postalCode" value={profileData.address.postalCode} onChange={handleAddressChange} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium text-lg">{profileData.address.postalCode}</div>
                                )}
                            </div>
                        </div>
                        {editSection === 'address' && (
                            <div className="flex justify-end mt-6 space-x-2">
                                <button className="bg-gray-300 text-gray-700 px-5 py-2 rounded-full" onClick={() => setEditSection(null)}>Cancel</button>
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition" onClick={() => handleSectionSave('address')}>Save</button>
                            </div>
                        )}
                    </div>
                    
                    {/* Security Card */}
                    <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-blue-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-800">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-2">Password</div>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-lg">••••••••</div>
                                    <button 
                                        className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Telegram and Review Buttons */}
                    <div className="flex flex-col md:flex-row md:space-x-4 mt-8">
                        <div className="mb-4 md:mb-0">
                            {!user?.telegramChatId ? (
                                <>
                                    <button
                                        onClick={handleManualTelegramConnect}
                                        className="inline-block px-6 py-3 bg-[#229ED9] hover:bg-[#1e8bc3] text-white rounded font-bold mb-2 text-center transition-colors"
                                    >
                                        Connect Telegram
                                    </button>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Get instant notifications about your bookings and packages.
                                    </div>
                                </>
                            ) : (
                                <div className="inline-block px-6 py-3 bg-green-500 text-white rounded font-bold mb-2 text-center">
                                    ✓ Telegram Connected
                                </div>
                            )}
                        </div>
                        {latestInquiryId && (
                            <div>
                                <a
                                    href={`${window.location.origin}/feedback?inquiryId=${latestInquiryId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-[#4CAF50] text-white rounded font-bold mb-2 text-center"
                                >
                                    Leave a Review
                                </a>
                                <div className="text-xs text-gray-500 mt-1">
                                    After your trip, you can leave a review for your experience here.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ChangePasswordModal 
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    setSuccess('Password updated successfully!');
                }}
            />
        </>
    );
};

export default UserProfile; 