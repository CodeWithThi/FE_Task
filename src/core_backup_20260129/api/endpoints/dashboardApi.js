/**
 * Dashboard API Endpoints
 */

import { httpClient } from '../client/httpClient';

export const dashboardApi = {
    getStats: () => httpClient.get('/dashboard/stats'),
};
