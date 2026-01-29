/**
 * Department API Endpoints
 */

import { httpClient } from '../client/httpClient';

export const departmentApi = {
    getAll: () => httpClient.get('/departments'),
    getById: (id) => httpClient.get(`/departments/${id}`),
    create: (data) => httpClient.post('/departments', data),
    update: (id, data) => httpClient.put(`/departments/${id}`, data),
    delete: (id) => httpClient.delete(`/departments/${id}`),
};
