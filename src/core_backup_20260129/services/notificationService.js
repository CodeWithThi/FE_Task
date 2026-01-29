import { httpClient } from '@core/api';

export const notificationService = {
    /**
     * Get notifications for the current user
     * @param {number} page 
     * @param {number} limit 
     * @param {boolean} unreadOnly 
     */
    getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
        try {
            const response = await httpClient.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);

            // httpClient returns unmodified Axios response object
            // response.data contains the backend payload: { status: 200, data: [...], pagination: {...} }
            // Some responses might come directly if interceptor was changed, but here we see it returns "response"

            // Check if response.data exists
            const payload = response.data;

            if (!payload) {
                return { ok: false, message: 'Empty response' };
            }

            // Backend returns: { status: 200, data: [...] }
            if (payload.status && payload.status !== 200) {
                return {
                    ok: false,
                    message: payload.message || 'Không thể tải thông báo',
                };
            }

            // Ensure data is array
            const data = Array.isArray(payload.data) ? payload.data : [];

            return {
                ok: true,
                data: data,
                pagination: payload.pagination || {},
            };
        } catch (error) {
            console.error('getNotifications error:', error);
            // Check if error response has message
            const msg = error.response?.data?.message || error.message;
            return { ok: false, message: msg };
        }
    },

    /**
     * Mark a notification as read
     * @param {string} id 
     */
    markAsRead: async (id) => {
        try {
            const response = await httpClient.put(`/notifications/${id}/read`);
            // Expecting payload: { status: 200, message: "..." }
            const payload = response.data;
            if (payload.status && payload.status !== 200) {
                return { ok: false, message: payload.message };
            }
            return { ok: true, message: 'Đã đánh dấu đã đọc' };
        } catch (error) {
            console.error('markAsRead error:', error);
            const msg = error.response?.data?.message || error.message;
            return { ok: false, message: msg };
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        try {
            const response = await httpClient.put(`/notifications/read-all`);
            const payload = response.data;
            if (payload.status && payload.status !== 200) {
                return { ok: false, message: payload.message };
            }
            return { ok: true, message: 'Đã đánh dấu tất cả đã đọc' };
        } catch (error) {
            console.error('markAllAsRead error:', error);
            const msg = error.response?.data?.message || error.message;
            return { ok: false, message: msg };
        }
    }
};
