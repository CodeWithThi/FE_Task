import apiClient from '@/lib/apiClient';

// Helper for consistency since requirements had simple department handling
export const departmentService = {
    getDepartments: async () => {
        try {
            const res = await apiClient.get('/departments');
            if (res.status === 200 || res.ok) {
                // Backend might return { status: 200, data: [...] } or just [...]
                // Safely extract data
                const rawData = res.data || res;
                const departments = Array.isArray(rawData) ? rawData : (rawData.data || []);

                return {
                    ok: true,
                    data: departments
                };
            }
            return {
                ok: false,
                message: res.message || 'Không thể tải danh sách phòng ban'
            };
        } catch (error) {
            console.error('departmentService error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};
