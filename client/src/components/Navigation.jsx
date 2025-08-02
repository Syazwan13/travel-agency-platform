import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

// Helper function to get the appropriate dashboard route based on user role
const getDashboardRoute = (role) => {
    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'travel_agency':
            return '/dashboard/agency';
        case 'user':
        default:
            return '/dashboard/user';
    }
};

const Navigation = () => {
    const { user } = useAuth();
    // Remove profile dropdown for dashboard pages
    return (
        <nav className="bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <h1 className="text-xl font-bold">HolidayPackages</h1>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Home
                                </Link>
                                <Link to="/packages" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Packages
                                </Link>
                                <Link to="/map" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Map
                                </Link>
                                <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark">
                                    About
                                </Link>
                                <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Remove profile dropdown for dashboard pages */}
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 