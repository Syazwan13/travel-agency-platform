import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/apiConfig';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? "http://localhost:5001" : "http://167.172.66.203:5001");

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
            const response = await api.get('/api/users/favorites');
            setFavorites(response.data || []);
        } catch (err) {
            console.error("Error fetching favorites:", err.message);
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
            console.log('Checking auth status...');
            
            // Check if we have a token in localStorage
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                console.log('Found stored auth token');
            }
            
            // First check if logged in
            const response = await api.get('/api/users/loggedIn');
            console.log('Login status response:', response.data);
            
            if (response.data) {
                console.log('User is logged in, fetching user data...');
                try {
                    const userResponse = await api.get('/api/users/getuser');
                    console.log('User data retrieved successfully');
                    setUser(userResponse.data);
                    
                    // Store token in localStorage if it's in the response
                    if (response.data.token) {
                        localStorage.setItem('authToken', response.data.token);
                    }
                } catch (userErr) {
                    console.error('Error fetching user data:', userErr.message);
                    // If the token is invalid, clear it
                    if (userErr.response?.status === 401 || userErr.response?.status === 400) {
                        localStorage.removeItem('authToken');
                    }
                    setUser(null);
                }
            } else {
                console.log('User is not logged in');
                setUser(null);
                // Clear any potentially invalid token
                localStorage.removeItem('authToken');
            }
        } catch (err) {
            console.error('Auth check error:', err.message);
            setUser(null);
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            const response = await api.post(
                '/api/users/login',
                { email, password }
            );
            
            // Log successful login
            console.log('Login successful:', response.data.role);
            
            setUser(response.data);
            
            // Store token in localStorage if it exists in response
            if (response.data && response.data.token) {
                console.log('Auth token received and stored');
                localStorage.setItem('authToken', response.data.token);
            } else {
                console.warn('No auth token received in login response');
            }
            
            setError(null);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            console.error('Login error:', errorMessage);
            setError(errorMessage);
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post(
                '/api/users/register',
                userData
            );
            setUser(response.data);
            
            // Store token in localStorage if it exists in response
            if (response.data && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.get('/api/users/logout');
            // Clear user data
            setUser(null);
            setError(null);
            
            // Remove token from localStorage
            localStorage.removeItem('authToken');
        } catch (err) {
            setError(err.response?.data?.message || 'Logout failed');
            throw err;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put(
                '/api/profile/update',
                profileData
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
            await api.post('/api/users/favorites', { packageId, packageType: 'Package' });
            await fetchFavorites(); // Refetch the full favorites list from backend
        } catch (err) {
            console.error("Error adding favorite:", err.message);
            throw err;
        }
    };

    const removeFavorite = async (packageId) => {
        try {
            await api.delete(`/api/users/favorites/${packageId}`);
            await fetchFavorites(); // Refetch the full favorites list from backend
        } catch (err) {
            console.error("Error removing favorite:", err.message);
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