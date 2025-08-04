import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? "http://localhost:5001" : "http://167.172.66.203:5001");

// Determine if we're in production
const isProduction = window.location.hostname !== 'localhost';

console.log('API Config - Environment:', isProduction ? 'Production' : 'Development');
console.log('API Config - API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Always send credentials (cookies)
    headers: {
        'Content-Type': 'application/json',
        // Add explicit origin headers in production to help with CORS
        ...(isProduction && {
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
        })
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        // Try to get the token from localStorage if it exists
        const token = localStorage.getItem('authToken');
        
        // If token exists, add it to the authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            
            // Log token existence for debugging (not the actual token)
            console.log('API Request - Auth token included: Yes');
        } else {
            console.log('API Request - Auth token included: No');
        }
        
        // Log API request for debugging
        console.log(`API Request - ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
        
        return config;
    },
    (error) => {
        console.error('API Request Error:', error.message);
        return Promise.reject(error);
    }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        console.log(`API Response - ${response.config.method?.toUpperCase() || 'GET'} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase() || 'GET',
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        // Handle different error types
        if (error.response) {
            // Server responded with error status code
            if (error.response.status === 401) {
                console.error('Authentication error: User not authenticated');
                // You could redirect to login page or clear the auth state here
            } else if (error.response.status === 400) {
                console.error('Bad request error:', error.response.data?.message || 'Invalid request data');
            } else if (error.response.status === 403) {
                console.error('Authorization error: Insufficient permissions');
            }
        } else if (error.request) {
            // Request was made but no response was received
            console.error('No response received from server');
        } else {
            // Something happened in setting up the request
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
