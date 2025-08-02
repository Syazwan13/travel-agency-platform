import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiMail, FiLogOut, FiAlertCircle } from 'react-icons/fi';

const PendingApproval = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
                <div className="w-full h-full bg-yellow-400 rounded-full blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
                <div className="w-full h-full bg-orange-400 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    {/* Clock Icon */}
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiClock size={40} className="text-yellow-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Account Pending Approval
                    </h1>

                    {/* Message */}
                    <div className="space-y-4 mb-8">
                        <p className="text-gray-600 leading-relaxed">
                            Thank you for registering your travel agency, <strong>{user?.companyName || user?.name}</strong>. 
                            Your account is currently under review by our admin team.
                        </p>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FiAlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" size={20} />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">What happens next?</p>
                                    <ul className="space-y-1 text-left">
                                        <li>• Our team will review your registration details</li>
                                        <li>• We may contact you for additional information</li>
                                        <li>• You'll receive email notification once approved</li>
                                        <li>• Approval typically takes 1-2 business days</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 justify-center">
                                <FiMail className="text-blue-500" size={16} />
                                <p className="text-sm text-blue-800">
                                    We'll send updates to <strong>{user?.email}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                        >
                            <FiLogOut size={18} />
                            Sign Out
                        </button>
                        
                        <p className="text-xs text-gray-500">
                            Need help? Contact support at{' '}
                            <a href="mailto:support@travelagency.com" className="text-blue-600 hover:underline">
                                support@travelagency.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
