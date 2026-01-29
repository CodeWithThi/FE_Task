import { httpClient } from '@core/api';

export const logService = {
    getLogs: async (page = 1, limit = 20, filters = {}) => {
        try {
            const params = { page, limit, ...filters };
            const response = await httpClient.get('/system-logs', { params });

            // Backend returns { status: 200, data: { logs: [...], pagination: {...} } }
            const responseData = response.data?.data || response.data || {};
            const logs = responseData.logs || [];
            const pagination = responseData.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

            return { ok: true, data: logs, pagination };
        } catch (error) {
            console.error('logService.getLogs error:', error);
            return {
                ok: false,
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
                message: error.response?.data?.message || 'Failed to fetch logs'
            };
        }
    },
};

