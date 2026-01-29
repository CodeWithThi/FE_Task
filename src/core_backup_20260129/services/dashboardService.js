import { projectApi, departmentApi, accountApi, dashboardApi, httpClient } from '@core/api';

/**
 * DASHBOARD SERVICE
 * Connects to backend API at /dashboard
 */
export const dashboardService = {
    /**
     * Get dashboard stats (admin/global)
     * GET /dashboard/stats
     */
    getStats: async (type) => {
        try {
            const query = type ? `?type=${type}` : '';
            const res = await httpClient.get(`/dashboard/stats${query}`);

            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Không thể tải thống kê',
                    data: null
                };
            }

            return {
                ok: true,
                data: res.data?.data || res.data
            };
        } catch (err) {
            console.error('dashboardService.getStats error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: null
            };
        }
    }
};

