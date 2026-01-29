/**
 * Account API Endpoints
 */

import { httpClient } from '../client/httpClient';

export const accountApi = {
    getAll: () => httpClient.get('/accounts'),
    getById: (id) => httpClient.get(`/accounts/${id}`),
};
