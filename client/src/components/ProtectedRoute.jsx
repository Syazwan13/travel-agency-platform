import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
    children,
    adminOnly = false,
    travelAgencyOnly = false,
    allowedRoles = null
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login page but save the location they tried to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if travel agency account is pending approval
    if (user.role === 'travel_agency' && user.status === 'pending') {
        return <Navigate to="/pending-approval" replace />;
    }

    // Check if account is suspended or inactive
    if (user.status && user.status !== 'active') {
        return <Navigate to="/pending-approval" replace />;
    }

    // Check role-based access
    if (adminOnly && user.role !== 'admin') {
        // If the route requires admin access and user is not an admin, redirect to appropriate dashboard
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    if (travelAgencyOnly && user.role !== 'travel_agency') {
        // If the route requires travel agency access and user is not a travel agency, redirect to appropriate dashboard
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If specific roles are allowed and user doesn't have the right role, redirect to appropriate dashboard
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    return children;
};

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

export default ProtectedRoute; 