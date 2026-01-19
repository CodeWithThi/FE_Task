/**
 * HTTP Client - Axios Instance with Interceptors
 * 
 * This is the centralized HTTP client for all API calls.
 * - Adds authentication token to requests
 * - Handles token refresh on 401 errors
 * - Provides consistent error handling
 * 
 * @module httpClient
 */

import axios from 'axios';

// Create axios instance with default config
const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3069/api/v1',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add authentication token
httpClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle errors and token refresh
httpClient.interceptors.response.use(
    (response) => {
        // Return successful response as-is
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');

                if (refreshToken) {
                    const response = await axios.post(
                        `${httpClient.defaults.baseURL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { token: newToken } = response.data;

                    // Save new token
                    localStorage.setItem('accessToken', newToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return httpClient(originalRequest);
                } else {
                    // No refresh token - session expired, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Redirect to login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        // Return error for other cases
        return Promise.reject(error);
    }
);

export { httpClient };
