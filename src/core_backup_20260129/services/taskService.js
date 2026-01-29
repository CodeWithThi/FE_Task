import { taskApi } from '@core/api';

/**
 * TASK SERVICE - Real API
 * Connects to backend API at /tasks
 * Standardizes backend schema (T_ID, Title, Begin_Date) to frontend schema (id, title, startDate)
 */

// Adapter to transform Backend Task -> Frontend Task
const mapTaskToFrontend = (backendTask) => {
    if (!backendTask) return null;

    // Normalize Status
    let status = 'not-assigned';
    if (backendTask.Status) {
        const s = backendTask.Status.toLowerCase();
        if (s === 'not-assigned' || s === 'not_assigned' || s === 'pending') status = 'not-assigned';
        else if (s === 'in-progress' || s === 'in_progress' || s === 'running') status = 'in-progress';
        else if (s === 'waiting-approval' || s === 'waiting_approval' || s === 'submitted') status = 'waiting-approval';
        else if (s === 'returned' || s === 'rejected') status = 'returned';
        else if (s === 'completed' || s === 'done' || s === 'finished') status = 'completed';
        else if (s === 'overdue') status = 'overdue';
        else status = s;
    }

    // Normalize Priority
    let priority = 'medium';
    if (backendTask.Priority) {
        const p = backendTask.Priority.toLowerCase();
        if (p === 'high' || p === 'cao') priority = 'high';
        else if (p === 'medium' || p === 'trung bình' || p === 'normal') priority = 'medium';
        else if (p === 'low' || p === 'thấp') priority = 'low';
        else priority = p;
    }

    return {
        id: backendTask.T_ID,
        title: backendTask.Title,
        description: backendTask.Description,
        projectId: backendTask.P_ID,
        projectName: backendTask.Project?.P_Name,
        departmentId: backendTask.Department?.D_ID || backendTask.Project?.Department?.D_ID,
        departmentName: backendTask.Department?.D_Name || backendTask.Project?.Department?.D_Name,
        priority: priority,
        status: status,
        startDate: backendTask.Begin_Date,
        deadline: backendTask.Due_Date,
        completedAt: backendTask.Complete_At,
        assignee: backendTask.Member ? {
            name: backendTask.Member.FullName,
            id: backendTask.Member.M_ID,
            department: backendTask.Member.Department?.D_Name
        } : null,
        createdBy: backendTask.Account?.UserName,
        parentTaskId: backendTask.Parent_T_ID,
        subtasks: backendTask.Subtasks ? backendTask.Subtasks.map(mapTaskToFrontend) : [],
        subtaskCount: backendTask.Subtasks?.length || 0,
        completedSubtasks: backendTask.Subtasks?.filter(st => st.Status?.toLowerCase() === 'completed').length || 0,
        progress: 0,
        Task_Member: backendTask.Task_Member || [], // Pass through for multi-member
        checklist: backendTask.ChecklistItems?.map(i => ({ id: i.CL_ID, content: i.Content, completed: i.IsCompleted })) || [],
        labels: backendTask.Task_Labels?.map(tl => ({ id: tl.Label.L_ID, name: tl.Label.Name, color: tl.Label.Color })) || [],
        attachments: backendTask.Attachments?.map(a => ({ id: a.AT_ID, fileName: a.FileName, fileUrl: a.FileUrl, uploadDate: a.UploadDate })) || [],
        comments: backendTask.TaskComments?.map(c => ({
            id: c.TC_ID,
            content: c.Content,
            createdAt: c.Created_At,
            user: {
                id: c.Account?.M_ID,
                name: c.Account?.UserName,
                avatar: c.Account?.Avatar
            }
        })) || []
    };
};

export const taskService = {
    /**
     * Get all tasks (optionally filtered by project)
     * GET /tasks?projectId=xxx
     */
    async getAllTasks(filters = {}) {
        try {
            const params = {};
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.assignedTo) params.assignedTo = filters.assignedTo;
            if (filters.status) params.status = filters.status;

            // If we just have projectId as simple arg logic from before, support that too
            if (typeof filters === 'string') {
                params.projectId = filters;
            }

            const res = await taskApi.getAll(params);

            console.log('DEBUG taskService.getAllTasks response:', res);
            console.log('DEBUG res.data:', res.data);

            // Backend wraps in { status: 200, data: actualData }
            const backendPayload = res.data?.data || res.data;
            const tasks = Array.isArray(backendPayload)
                ? backendPayload.map(mapTaskToFrontend)
                : [];

            console.log('DEBUG tasks mapped:', tasks.length, 'tasks');

            return {
                ok: true,
                data: tasks
            };
        } catch (err) {
            console.error('taskService.getAllTasks error:', err);
            return {
                ok: false,
                message: err.response?.data?.message || 'Lỗi kết nối server',
                data: []
            };
        }
    },

    /**
     * Get tasks by project ID
     * GET /projects/:projectId/tasks
     * Use getAllTasks instead since backend has listTasks handling filtering
     */
    async getTasksByProject(projectId) {
        return this.getAllTasks({ projectId });
    },

    /**
     * Get task by ID
     * GET /tasks/:id
     */
    async getTaskById(taskId) {
        try {
            const res = await taskApi.getById(taskId);

            // Extract from double-wrapped response
            const backendPayload = res.data?.data || res.data;

            return {
                ok: true,
                data: mapTaskToFrontend(backendPayload)
            };
        } catch (err) {
            console.error('taskService.getTaskById error:', err);
            return {
                ok: false,
                message: err.response?.data?.message || 'Lỗi kết nối server',
                data: null
            };
        }
    },

    /**
     * Create new task
     * POST /tasks
     * Payload: { title, description, beginDate, dueDate, priority, projectId, assignedTo }
     */
    async createTask(taskData) {
        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                beginDate: taskData.startDate,
                dueDate: taskData.deadline,
                priority: taskData.priority,
                projectId: taskData.projectId,
                assignedTo: taskData.assigneeId,
                memberIds: taskData.memberIds, // Multi-member support
                parentTaskId: taskData.parentTaskId || null
            };

            const res = await taskApi.create(payload);

            const backendPayload = res.data?.data || res.data;

            return {
                ok: true,
                data: mapTaskToFrontend(backendPayload),
                message: 'Tạo công việc thành công'
            };
        } catch (err) {
            console.error('taskService.createTask error:', err);
            return {
                ok: false,
                message: err.response?.data?.message || 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Update task
     * PUT /tasks/:id
     */
    async updateTask(taskId, taskData) {
        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                beginDate: taskData.startDate,
                dueDate: taskData.deadline,
                priority: taskData.priority,
                assignedTo: taskData.assigneeId,
                memberIds: taskData.memberIds, // Multi-member support
                status: taskData.status
            };

            const res = await taskApi.update(taskId, payload);

            const backendPayload = res.data?.data || res.data;

            return {
                ok: true,
                data: mapTaskToFrontend(backendPayload),
                message: 'Cập nhật công việc thành công'
            };
        } catch (err) {
            console.error('taskService.updateTask error:', err);
            return {
                ok: false,
                message: err.response?.data?.message || 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Delete task (soft delete)
     * DELETE /tasks/:id
     */
    async deleteTask(taskId) {
        try {
            await taskApi.delete(taskId);

            return {
                ok: true,
                message: 'Xóa công việc thành công'
            };
        } catch (err) {
            console.error('taskService.deleteTask error:', err);
            return {
                ok: false,
                message: err.response?.data?.message || 'Lỗi kết nối server'
            };
        }
    },

    // --- Trello Features ---
    async addChecklistItem(taskId, content) {
        try {
            const res = await taskApi.post(`/${taskId}/checklist`, { content });
            const item = res.data.data;
            // Map backend PascalCase to frontend camelCase
            return {
                ok: true,
                data: {
                    id: item.CL_ID,
                    content: item.Content,
                    completed: item.IsCompleted || false
                }
            };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async updateChecklistItem(itemId, data) {
        try {
            const res = await taskApi.put(`/checklist/${itemId}`, data);
            return { ok: true, data: res.data.data };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async deleteChecklistItem(itemId) {
        try {
            await taskApi.remove(`/checklist/${itemId}`);
            return { ok: true };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async addLabel(taskId, { name, color }) {
        try {
            const res = await taskApi.post(`/${taskId}/labels`, { name, color });
            const backendLabel = res.data.data;
            // Map backend PascalCase to frontend camelCase
            return {
                ok: true,
                data: {
                    id: backendLabel.L_ID,
                    name: backendLabel.Name,
                    color: backendLabel.Color
                }
            };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async removeLabel(taskId, labelId) {
        try {
            await taskApi.remove(`/${taskId}/labels/${labelId}`);
            return { ok: true };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async addAttachment(taskId, { fileName, fileUrl }) {
        try {
            const res = await taskApi.post(`/${taskId}/attachments`, { fileName, fileUrl });
            const item = res.data.data;
            // Map backend PascalCase to frontend camelCase
            return {
                ok: true,
                data: {
                    id: item.AT_ID,
                    fileName: item.FileName,
                    fileUrl: item.FileUrl,
                    uploadDate: item.UploadDate || new Date().toISOString()
                }
            };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async deleteAttachment(taskId, attachmentId) {
        try {
            await taskApi.remove(`/${taskId}/attachments/${attachmentId}`);
            return { ok: true };
        } catch (err) { return { ok: false, message: err.message }; }
    },

    // Upload file to server
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(
                (import.meta.env.VITE_API_URL || 'http://localhost:3069/api/v1') + '/upload/attachment',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: formData
                }
            );

            const data = await response.json();
            if (data.ok) {
                return {
                    ok: true,
                    data: {
                        fileName: data.data.fileName,
                        fileUrl: data.data.fileUrl
                    }
                };
            }
            return { ok: false, message: data.message };
        } catch (err) {
            return { ok: false, message: err.message };
        }


    },

    // --- Comments ---
    async addComment(taskId, content) {
        try {
            const res = await taskApi.post(`/${taskId}/comments`, { content });
            const item = res.data.data;
            return {
                ok: true,
                data: {
                    id: item.TC_ID,
                    content: item.Content,
                    createdAt: item.Created_At,
                    user: {
                        id: item.Account?.M_ID,
                        name: item.Account?.UserName,
                        avatar: item.Account?.Avatar
                    }
                }
            };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async deleteComment(taskId, commentId) {
        try {
            await taskApi.delete(`/${taskId}/comments/${commentId}`);
            return { ok: true };
        } catch (err) { return { ok: false, message: err.message }; }
    },
    async editComment(taskId, commentId, content) {
        try {
            const res = await taskApi.put(`/${taskId}/comments/${commentId}`, { content });
            const item = res.data.data;
            return {
                ok: true,
                data: {
                    id: item.TC_ID,
                    content: item.Content,
                    createdAt: item.Created_At,
                    updatedAt: item.Updated_At,
                    user: {
                        id: item.Account?.M_ID,
                        name: item.Account?.UserName,
                        avatar: item.Account?.Avatar
                    }
                }
            };
        } catch (err) { return { ok: false, message: err.message }; }
    }
};

export default taskService;


