import apiClient from '@/config/api';

/**
 * PROJECT SERVICE - Real API
 * Connects to backend API at /projects
 * Standardizes backend schema (P_Name, Begin_Date) to frontend schema (name, startDate)
 */

// Adapter to transform Backend Project -> Frontend Project
const mapProjectToFrontend = (backendProject) => {
    if (!backendProject) return null;

    // Normalize status to lowercase to match frontend keys
    let status = 'active'; // Default
    if (backendProject.Status) {
        const s = backendProject.Status.toLowerCase();
        if (s.includes('complete') || s === 'completed') status = 'completed';
        else if (s.includes('hold') || s === 'on-hold') status = 'on-hold';
        else if (s.includes('active')) status = 'active';
        else status = s; // Fallback
    }

    return {
        id: backendProject.P_ID,
        name: backendProject.P_Name,
        description: backendProject.P_Name,
        departmentId: backendProject.D_ID,
        department: backendProject.Department?.D_Name,
        startDate: backendProject.Begin_Date,
        endDate: backendProject.End_Date,
        status: status,
        manager: backendProject.Account ? { name: backendProject.Account.UserName } : null,
        progress: 0,
        isDeleted: backendProject.IsDeleted
    };
};

export const projectService = {
    /**
     * Get all projects
     * GET /projects
     */
    async getAllProjects(filters = {}) {
        try {
            const params = {};
            if (filters.departmentId) params.departmentId = filters.departmentId;
            if (filters.status) params.status = filters.status;

            const res = await apiClient.get('/projects', { params });

            // Backend returns: { status: 200, data: [...] }
            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Không thể tải danh sách dự án',
                    data: []
                };
            }

            const projects = Array.isArray(res.data)
                ? res.data.map(mapProjectToFrontend)
                : [];

            return {
                ok: true,
                data: projects
            };
        } catch (err) {
            console.error('projectService.getAllProjects error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: []
            };
        }
    },

    /**
     * Get project by ID
     * GET /projects/:id
     */
    async getProjectById(projectId) {
        try {
            const res = await apiClient.get(`/projects/${projectId}`);

            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Không tìm thấy dự án',
                    data: null
                };
            }

            return {
                ok: true,
                data: mapProjectToFrontend(res.data)
            };
        } catch (err) {
            console.error('projectService.getProjectById error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server',
                data: null
            };
        }
    },

    /**
     * Create new project
     * POST /projects
     * Payload: { name, departmentId, beginDate, endDate }
     */
    async createProject(projectData) {
        try {
            // Map frontend data to backend expectation
            const payload = {
                name: projectData.name,
                departmentId: projectData.departmentId,
                beginDate: projectData.startDate,
                endDate: projectData.endDate
            };

            const res = await apiClient.post('/projects', payload);

            if (res.status !== 201 && res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Tạo dự án thất bại'
                };
            }

            return {
                ok: true,
                data: mapProjectToFrontend(res.data),
                message: 'Tạo dự án thành công'
            };
        } catch (err) {
            console.error('projectService.createProject error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Update project
     * PUT /projects/:id
     */
    async updateProject(projectId, projectData) {
        try {
            const payload = {
                name: projectData.name,
                departmentId: projectData.departmentId,
                beginDate: projectData.startDate,
                endDate: projectData.endDate,
                status: projectData.status
            };

            const res = await apiClient.put(`/projects/${projectId}`, payload);

            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Cập nhật dự án thất bại'
                };
            }

            return {
                ok: true,
                data: mapProjectToFrontend(res.data),
                message: 'Cập nhật dự án thành công'
            };
        } catch (err) {
            console.error('projectService.updateProject error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Delete project (soft delete)
     * DELETE /projects/:id
     */
    async deleteProject(projectId) {
        try {
            const res = await apiClient.delete(`/projects/${projectId}`);

            if (res.status !== 200) {
                return {
                    ok: false,
                    message: res.message || 'Xóa dự án thất bại'
                };
            }

            return {
                ok: true,
                message: 'Xóa dự án thành công'
            };
        } catch (err) {
            console.error('projectService.deleteProject error:', err);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};

export default projectService;
