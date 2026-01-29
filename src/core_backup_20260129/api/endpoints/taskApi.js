/**
 * Task API Endpoints
 * 
 * CRUD operations for tasks.
 */

import { httpClient } from '../client/httpClient';

export const taskApi = {
    /**
     * Get all tasks
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>}
     */
    getAll: (params = {}) =>
        httpClient.get('/tasks', { params }),

    /**
     * Get task by ID
     * @param {string} id
     * @returns {Promise<Object>}
     */
    getById: (id) =>
        httpClient.get(`/tasks/${id}`),

    /**
     * Create new task
     * @param {Object} taskData
     * @returns {Promise<Object>}
     */
    create: (taskData) =>
        httpClient.post('/tasks', taskData),

    /**
     * Update task
     * @param {string} id
     * @param {Object} taskData
     * @returns {Promise<Object>}
     */
    update: (id, taskData) =>
        httpClient.put(`/tasks/${id}`, taskData),

    /**
     * Delete task
     * @param {string} id
     * @returns {Promise}
     */
    delete: (id) =>
        httpClient.delete(`/tasks/${id}`),

    /**
     * Update task status
     * @param {string} id
     * @param {string} status
     * @returns {Promise<Object>}
     */
    updateStatus: (id, status) =>
        httpClient.patch(`/tasks/${id}/status`, { status }),

    /**
     * Assign task to user
     * @param {string} id
     * @param {string} assigneeId
     * @returns {Promise<Object>}
     */
    assign: (id, assigneeId) =>
        httpClient.patch(`/tasks/${id}/assign`, { assigneeId }),

    // Generic methods for dynamic endpoints (Trello features)
    post: (path, data) =>
        httpClient.post(`/tasks${path}`, data),

    put: (path, data) =>
        httpClient.put(`/tasks${path}`, data),

    remove: (path) =>
        httpClient.delete(`/tasks${path}`),
};
