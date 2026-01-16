/**
 * Project API Endpoints
 */

import { httpClient } from '../client/httpClient';

export const projectApi = {
    getAll: (params = {}) => httpClient.get('/projects', { params }),
    getById: (id) => httpClient.get(`/projects/${id}`),
    create: (data) => httpClient.post('/projects', data),
    update: (id, data) => httpClient.put(`/projects/${id}`, data),
    delete: (id) => httpClient.delete(`/projects/${id}`),
};
