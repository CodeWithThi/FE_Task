import apiClient from '../lib/apiClient';

/**
 * TASK REPORT SERVICE - Real API
 * Connects to backend API at /task-reports
 */

export const taskReportService = {
    /**
     * Get all reports for a specific task
     * GET /tasks/:taskId/reports
     */
    /**
     * Get all reports for a specific task
     * GET /tasks/:taskId/reports
     */
    async getReportsByTask(taskId) {
        try {
            const res = await apiClient.get(`/tasks/${taskId}/reports`);

            if (res.status === 200 || res.ok) {
                const rawData = res.data || res;
                const items = Array.isArray(rawData) ? rawData : (rawData.data || []);
                return {
                    ok: true,
                    data: items
                };
            }

            return {
                ok: false,
                message: res.message || 'Không thể tải báo cáo',
                data: []
            };
        } catch (err) {
            console.error('taskReportService.getReportsByTask error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: []
            };
        }
    },

    /**
     * Get report by ID
     * GET /task-reports/:id
     */
    async getReportById(reportId) {
        try {
            const res = await apiClient.get(`/task-reports/${reportId}`);

            if (res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data || res
                };
            }

            return {
                ok: false,
                message: res.message || 'Không tìm thấy báo cáo',
                data: null
            };
        } catch (err) {
            console.error('taskReportService.getReportById error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: null
            };
        }
    },

    /**
     * Create new task report
     * POST /task-reports
     */
    async createReport(taskId, content, additionalData = {}) {
        try {
            const payload = {
                T_ID: taskId,
                Content: content,
                ...additionalData
            };

            const res = await apiClient.post('/task-reports', payload);

            if (res.status === 201 || res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data,
                    message: 'Tạo báo cáo thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Tạo báo cáo thất bại'
            };
        } catch (err) {
            console.error('taskReportService.createReport error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Update task report
     * PUT /task-reports/:id
     */
    async updateReport(reportId, reportData) {
        try {
            const res = await apiClient.put(`/task-reports/${reportId}`, reportData);

            if (res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data,
                    message: 'Cập nhật báo cáo thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Cập nhật báo cáo thất bại'
            };
        } catch (err) {
            console.error('taskReportService.updateReport error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Delete task report (soft delete)
     * DELETE /task-reports/:id
     */
    async deleteReport(reportId) {
        try {
            const res = await apiClient.delete(`/task-reports/${reportId}`);

            if (res.status === 200 || res.ok) {
                return {
                    ok: true,
                    message: 'Xóa báo cáo thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Xóa báo cáo thất bại'
            };
        } catch (err) {
            console.error('taskReportService.deleteReport error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};

export default taskReportService;
