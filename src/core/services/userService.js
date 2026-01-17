import { userApi, httpClient } from '@core/api';

/**
 * USER MANAGEMENT SERVICE (Admin only)
 * Handles user CRUD operations for system administrators
 */

export const userService = {
    /**
     * Get all users with pagination and filters
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {string} params.search - Search term
     * @param {string} params.roleId - Filter by role
     * @param {string} params.departmentId - Filter by department
     * @param {string} params.status - Filter by status
     */
    getUsers: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            if (params.roleId) queryParams.append('roleId', params.roleId);
            if (params.departmentId) queryParams.append('departmentId', params.departmentId);
            if (params.status) queryParams.append('status', params.status);
            if (params.includeDeleted) queryParams.append('includeDeleted', 'true');

            const response = await httpClient.get(`/accounts?${queryParams.toString()}`);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể tải danh sách người dùng',
                };
            }

            // Map backend data (PascalCase) to frontend structure (camelCase)
            console.log("DEBUG GET USERS RAW RESPONSE:", response);
            console.log("DEBUG response.data:", response.data);

            // Backend wraps in { status: 200, data: actualData }
            const backendPayload = response.data?.data || response.data;
            const rawList = Array.isArray(backendPayload) ? backendPayload : [];

            console.log("DEBUG backendPayload:", backendPayload);
            console.log("DEBUG rawList:", rawList);
            const mappedData = rawList.map(acc => ({
                aid: acc.A_ID || acc.id,
                userName: acc.UserName || acc.username,
                email: acc.Email || acc.email,
                role: acc.Role ? {
                    id: acc.Role.R_ID,
                    name: acc.Role.R_Name
                } : null,
                member: acc.Member ? {
                    id: acc.Member.M_ID,
                    fullName: acc.Member.FullName,
                    phoneNumber: acc.Member.PhoneNumber,
                    departmentId: acc.Member.Department?.D_ID,
                    departmentName: acc.Member.Department?.D_Name
                } : null,
                status: acc.Status || acc.status,
                isDeleted: acc.IsDeleted
            }));

            console.log("DEBUG GET USERS MAPPED:", mappedData);

            return {
                ok: true,
                data: mappedData,
                pagination: response.pagination,
            };
        } catch (error) {
            console.error('userService.getUsers error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server',
            };
        }
    },

    /**
     * Get user by ID
     */
    getUserById: async (id) => {
        try {
            const response = await httpClient.get(`/accounts/${id}`);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể tải thông tin người dùng',
                };
            }

            return {
                ok: true,
                data: response.data,
            };
        } catch (error) {
            console.error('userService.getUserById error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server',
            };
        }
    },

    /**
     * Create new user
     */
    createUser: async (userData) => {
        try {
            const response = await httpClient.post('/accounts', userData);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể tạo người dùng',
                };
            }

            return {
                ok: true,
                data: response.data,
                message: response.message || 'Tạo người dùng thành công',
            };
        } catch (error) {
            console.error('userService.createUser error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server',
            };
        }
    },

    /**
     * Update user
     */
    updateUser: async (id, userData) => {
        try {
            // Updated to correct backend endpoint
            const response = await httpClient.put(`/accounts/${id}`, userData);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể cập nhật người dùng',
                };
            }

            return {
                ok: true,
                message: response.message || 'Cập nhật người dùng thành công',
            };
        } catch (error) {
            console.error('userService.updateUser error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server',
            };
        }
    },

    /**
     * Delete user (soft delete)
     */
    deleteUser: async (id) => {
        try {
            const response = await httpClient.delete(`/accounts/${id}`);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể xóa người dùng',
                };
            }

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể xóa người dùng',
                };
            }

            return {
                ok: true,
                message: response.message || 'Xóa người dùng thành công',
            };
        } catch (error) {
            console.error('userService.deleteUser error:', error);
            // Handle cases where error is the response data object
            const msg = error.message || (error.error ? error.error : JSON.stringify(error));
            return {
                ok: false,
                message: msg || 'Lỗi kết nối server (Chi tiết: ' + JSON.stringify(error) + ')',
            };
        }
    },

    /**
     * Restore deleted user
     */
    restoreUser: async (id) => {
        try {
            // Backend endpoint for restore
            const response = await httpClient.post(`/accounts/${id}/restore`);

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Không thể khôi phục người dùng',
                };
            }

            return {
                ok: true,
                message: response.message || 'Khôi phục người dùng thành công',
            };
        } catch (error) {
            console.error('userService.restoreUser error:', error);
            return {
                ok: false,
                message: error.message || 'Lỗi kết nối server',
            };
        }
    },
};

export default userService;

