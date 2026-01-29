/**
 * User API Endpoints
 * 
 * CRUD operations for users.
 */

import { httpClient } from '../client/httpClient';

export const userApi = {
    /**
     * Get all users
     * @returns {Promise<Array>}
     */
    getAll: () =>
        httpClient.get('/users'),

    /**
     * Get user by ID
     * @param {string} id
     * @returns {Promise<Object>}
     */
    getById: (id) =>
        httpClient.get(`/users/${id}`),

    /**
     * Create new user
     * @param {Object} userData
     * @returns {Promise<Object>}
     */
    create: (userData) =>
        httpClient.post('/users', userData),

    /**
     * Update user
     * @param {string} id
     * @param {Object} userData
     * @returns {Promise<Object>}
     */
    update: (id, userData) =>
        httpClient.put(`/users/${id}`, userData),

    /**
     * Delete user
     * @param {string} id
     * @returns {Promise}
     */
    delete: (id) =>
        httpClient.delete(`/users/${id}`),

    /**
     * Change user password
     * @param {string} id
     * @param {Object} passwordData - { currentPassword, newPassword }
     * @returns {Promise}
     */
    changePassword: (id, passwordData) =>
        httpClient.put(`/users/${id}/password`, passwordData),
};
