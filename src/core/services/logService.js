import { httpClient } from '@core/api';

export const logService = {
    getLogs: async (page = 1, limit = 20, filters = {}) => {
        try {
            const params = { page, limit, ...filters };
            const response = await httpClient.get('/system-logs', { params });
            return { ok: true, data: response.data.logs, pagination: response.data.pagination };
        } catch (error) {
            return { ok: false, message: error.response?.data?.message || 'Failed to fetch logs' };
        }
    },
};
