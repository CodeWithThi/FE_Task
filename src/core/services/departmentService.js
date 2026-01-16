import apiClient from '@core/config/api';

export const departmentService = {
    getDepartments: async () => {
        try {
            const res = await apiClient.get('/departments');
            if (res.status === 200 || res.ok) {
                const rawData = res.data?.data || res.data || [];
                const departments = Array.isArray(rawData) ? rawData : [];

                // Map Backend (PascalCase) to Frontend (camelCase)
                const mapped = departments.map(d => ({
                    id: d.D_ID,
                    name: d.D_Name,
                    parentId: d.Parent_D_ID,
                    status: d.Status === 'active' ? 'active' : 'inactive',
                    memberCount: d._count?.Member || 0,
                    projectCount: d._count?.Project || 0
                }));

                console.log("Departments mapped:", mapped);
                return {
                    ok: true,
                    data: mapped
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
    },

    createDepartment: async (data) => {
        try {
            const res = await apiClient.post('/departments', data);
            if (res.ok || res.status === 201) {
                return {
                    ok: true,
                    message: res.data?.message || 'Tạo phòng ban thành công',
                    data: res.data?.data
                };
            }
            return {
                ok: false,
                message: res.data?.message || res.message || 'Không thể tạo phòng ban'
            };
        } catch (error) {
            console.error('createDepartment error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    },

    updateDepartment: async (id, data) => {
        try {
            const res = await apiClient.put(`/departments/${id}`, data);
            if (res.ok || res.status === 200) {
                return {
                    ok: true,
                    message: res.data?.message || 'Cập nhật phòng ban thành công',
                    data: res.data?.data
                };
            }
            return {
                ok: false,
                message: res.data?.message || res.message || 'Không thể cập nhật phòng ban'
            };
        } catch (error) {
            console.error('updateDepartment error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }
};

