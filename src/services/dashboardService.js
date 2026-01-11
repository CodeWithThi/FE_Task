import apiClient from '../lib/apiClient';

/**
 * DASHBOARD SERVICE
 * Connects to backend API at /dashboard
 */

export const dashboardService = {
    /**
     * Get dashboard statistics
     * GET /dashboard/stats
     */
    async getStats() {
        try {
            const res = await apiClient.get('/dashboard/stats');

            // Backend returns { status: 200, data: { ... } }
            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Không thể tải thống kê',
                    data: null
                };
            }

            return {
                ok: true,
                data: res.data
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

export default dashboardService;
