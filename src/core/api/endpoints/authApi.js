/**
 * Authentication API Endpoints
 * 
 * Pure HTTP calls for authentication operations.
 * No business logic - just raw API calls.
 */

import { httpClient } from '../client/httpClient';

export const authApi = {
    /**
     * Login user
     * @param {Object} credentials - { username, password }
     * @returns {Promise} Response with token and user data
     */
    login: (credentials) =>
        httpClient.post('/auth/login', credentials),

    /**
     * Logout user
     * @returns {Promise}
     */
    logout: () =>
        httpClient.post('/auth/logout'),

    /**
     * Send forgot password email
     * @param {string} email
     * @returns {Promise}
     */
    forgotPassword: (email) =>
        httpClient.post('/auth/forgot-password', { email }),

    /**
     * Reset password with token
     * @param {string} token
     * @param {string} email
     * @param {string} newPassword
     * @returns {Promise}
     */
    resetPassword: (token, email, newPassword) =>
        httpClient.post('/auth/reset-password', { token, email, newPassword }),

    /**
     * Refresh access token
     * @param {string} refreshToken
     * @returns {Promise} New access token
     */
    refreshToken: (refreshToken) =>
        httpClient.post('/auth/refresh', { refreshToken }),
};
