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
        progress: 0
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

            const tasks = Array.isArray(res.data)
                ? res.data.map(mapTaskToFrontend)
                : [];

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

            return {
                ok: true,
                data: mapTaskToFrontend(res.data)
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
                parentTaskId: taskData.parentTaskId || null
            };

            const res = await taskApi.create(payload);

            return {
                ok: true,
                data: mapTaskToFrontend(res.data),
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
                status: taskData.status
            };

            const res = await taskApi.update(taskId, payload);

            return {
                ok: true,
                data: mapTaskToFrontend(res.data),
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
    }
};

export default taskService;

