import { useState } from 'react';
import { Link } from 'react-router-dom';

const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState('');

    const roles = [
        {
            id: 'user',
            title: 'Customer',
            description: 'Browse and compare travel packages, save favorites, and manage your travel preferences.',
            icon: (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            features: ['Browse travel packages', 'Save favorites', 'Compare packages', 'Manage preferences']
        },
        {
            id: 'travel_agency',
            title: 'Travel Agency',
            description: 'Manage your travel packages, view analytics, and handle customer inquiries.',
            icon: (
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            features: ['Manage packages', 'View analytics', 'Handle inquiries', 'Track performance']
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Choose Your Account Type
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Select the type of account that best describes you
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={`relative rounded-lg border-2 p-6 cursor-pointer hover:border-primary transition-colors ${
                                selectedRole === role.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 bg-white'
                            }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4">
                                    {role.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {role.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {role.description}
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    {role.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {selectedRole === role.id && (
                                <div className="absolute top-2 right-2">
                                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to={selectedRole ? `/register/${selectedRole}` : '#'}
                        className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors ${
                            selectedRole
                                ? 'bg-primary hover:bg-primary-dark'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                            if (!selectedRole) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Continue with {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Selected Role'}
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
