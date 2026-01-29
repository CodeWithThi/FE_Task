// Member Service - Real API

import { httpClient } from '@core/api';

/**
 * MEMBER SERVICE - Real API
 * Connects to backend API at /members
 */

export const memberService = {
    /**
     * Get all members (simplified, without mapping to frontend format)
     * GET /members
     */
    getMembers: async () => {
        try {
            const res = await httpClient.get('/members');
            if (res.status === 200 || res.ok) {
                const rawData = res.data || res;
                const members = Array.isArray(rawData) ? rawData : (rawData.data || []);
                return {
                    ok: true,
                    data: members
                };
            }
            return {
                ok: false,
                message: res.message || 'Không thể tải danh sách thành viên'
            };
        } catch (error) {
            console.error('memberService.getMembers error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Get all members
     * GET /members
     */
    /**
     * Get all members
     * GET /members
     */
    async getAllMembers() {
        try {
            const res = await httpClient.get('/members');

            if (res.status === 200 || res.ok) {
                const rawData = res.data || res;
                const items = Array.isArray(rawData) ? rawData : (rawData.data || []);

                // Map to frontend format
                const members = items.map(item => ({
                    id: item.M_ID || item.id,
                    name: item.M_Name || item.name,
                    email: item.Email || item.email,
                    phone: item.Phone || item.phone,
                    departmentId: item.Department_ID || item.departmentId,
                    role: item.Role || item.role,
                    status: item.Status || item.status
                }));

                return {
                    ok: true,
                    data: members
                };
            }

            return {
                ok: false,
                message: res.message || 'Không thể tải danh sách thành viên',
                data: []
            };
        } catch (err) {
            console.error('memberService.getAllMembers error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: []
            };
        }
    },

    /**
     * Get members by department
     * GET /departments/:departmentId/members
     */
    async getMembersByDepartment(departmentId) {
        try {
            const res = await httpClient.get(`/ departments / ${departmentId}/members`);

            if (res.status === 200 || res.ok) {
                const rawData = res.data || res;
                const items = Array.isArray(rawData) ? rawData : (rawData.data || []);

                const members = items.map(item => ({
                    id: item.M_ID || item.id,
                    name: item.M_Name || item.name,
                    email: item.Email || item.email,
                    departmentId: item.Department_ID || item.departmentId
                }));

                return {
                    ok: true,
                    data: members
                };
            }

            return {
                ok: false,
                message: res.message || 'Không thể tải thành viên phòng ban',
                data: []
            };
        } catch (err) {
            console.error('memberService.getMembersByDepartment error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: []
            };
        }
    },

    /**
     * Get member by ID
     * GET /members/:id
     */
    async getMemberById(memberId) {
        try {
            const res = await httpClient.get(`/members/${memberId}`);

            if (res.status === 200 || res.ok) {
                const item = res.data || res;
                if (!item) return { ok: false, message: 'Không tìm thấy thành viên' };

                const member = {
                    id: item.M_ID || item.id,
                    name: item.M_Name || item.name,
                    email: item.Email || item.email,
                    phone: item.Phone || item.phone,
                    departmentId: item.Department_ID || item.departmentId,
                    status: item.Status || item.status
                };

                return {
                    ok: true,
                    data: member
                };
            }

            return {
                ok: false,
                message: res.message || 'Không tìm thấy thành viên',
                data: null
            };
        } catch (err) {
            console.error('memberService.getMemberById error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: null
            };
        }
    },

    /**
     * Create new member
     * POST /members
     */
    async createMember(memberData) {
        try {
            // Map frontend data to backend schema if needed
            const payload = {
                M_Name: memberData.name,
                Email: memberData.email,
                Phone: memberData.phone,
                Department_ID: memberData.departmentId,
                // Add other fields as per schema
            };

            const res = await httpClient.post('/members', payload);

            if (res.status === 201 || res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data,
                    message: 'Tạo thành viên thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Tạo thành viên thất bại'
            };
        } catch (err) {
            console.error('memberService.createMember error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Update member
     * PUT /members/:id
     */
    async updateMember(memberId, memberData) {
        try {
            const payload = {
                M_Name: memberData.name,
                Email: memberData.email,
                Phone: memberData.phone,
                Department_ID: memberData.departmentId,
                Status: memberData.status
            };

            const res = await httpClient.put(`/members/${memberId}`, payload);

            if (res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data,
                    message: 'Cập nhật thành viên thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Cập nhật thành viên thất bại'
            };
        } catch (err) {
            console.error('memberService.updateMember error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Delete member (soft delete)
     * DELETE /members/:id
     */
    async deleteMember(memberId) {
        try {
            const res = await httpClient.delete(`/members/${memberId}`);

            if (res.status === 200 || res.ok) {
                return {
                    ok: true,
                    message: 'Xóa thành viên thành công'
                };
            }

            return {
                ok: false,
                message: res.message || 'Xóa thành viên thất bại'
            };
        } catch (err) {
            console.error('memberService.deleteMember error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};

export default memberService;

