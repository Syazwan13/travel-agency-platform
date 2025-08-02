import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users/favorites`, { withCredentials: true });
            setFavorites(response.data || []);
        } catch (err) {
            setFavorites([]);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavorites([]);
        }
    }, [user]);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users/loggedIn`, {
                withCredentials: true
            });
            if (response.data) {
                const userResponse = await axios.get(`${API_URL}/api/users/getuser`, {
                    withCredentials: true
                });
                setUser(userResponse.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/users/login`,
                { email, password },
                { withCredentials: true }
            );
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/users/register`,
                userData,
                { withCredentials: true }
            );
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await axios.get(
                `${API_URL}/api/users/logout`,
                { withCredentials: true }
            );
            setUser(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Logout failed');
            throw err;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/profile/update`,
                profileData,
                { withCredentials: true }
            );
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Profile update failed');
            throw err;
        }
    };

    const addFavorite = async (packageId) => {
        try {
            await axios.post(`${API_URL}/api/users/favorites`, { packageId, packageType: 'Package' }, { withCredentials: true });
            await fetchFavorites(); // Refetch the full favorites list from backend
        } catch (err) {
            throw err;
        }
    };

    const removeFavorite = async (packageId) => {
        try {
            await axios.delete(`${API_URL}/api/users/favorites/${packageId}`, { withCredentials: true });
            await fetchFavorites(); // Refetch the full favorites list from backend
        } catch (err) {
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        checkAuthStatus,
        favorites,
        addFavorite,
        removeFavorite
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 