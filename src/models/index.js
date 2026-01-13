// ===================
// ROLE DEFINITIONS
// ===================
export const roleLabels = {
    admin: 'Quản trị viên',
    director: 'Ban Giám đốc',
    pmo: 'PMO',
    leader: 'Trưởng nhóm',
    staff: 'Nhân viên',
};

// ===================
// STATUS & PRIORITY LABELS
// ===================
export const statusLabels = {
    'not-assigned': 'Chưa nhận',
    'in-progress': 'Đang làm',
    'waiting-approval': 'Chờ duyệt',
    'returned': 'Trả lại',
    'completed': 'Hoàn thành',
    'overdue': 'Trễ hạn',
};

export const projectStatusLabels = {
    'Running': 'Đang thực hiện',
    'Completed': 'Hoàn thành',
    'On-Hold': 'Tạm dừng',
    'Pending': 'Chờ xử lý',
    'active': 'Đang hoạt động',
    'inactive': 'Dừng hoạt động',
    'paused': 'Tạm dừng',
    'cancelled': 'Đã hủy',
};

export const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
    value,
    label,
}));

export const priorityLabels = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
};

export const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
    value,
    label,
}));

// ===================
// STYLES
// ===================
export const projectStatusStyles = {
    'Running': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'On-Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    'active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'paused': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const priorityStyles = {
    high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

export const taskStatusStyles = {
    'not-assigned': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    'in-progress': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'waiting-approval': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'returned': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    'completed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'overdue': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

// ===================
// PERMISSIONS
// ===================
export const rolePermissions = {
    admin: {
        canViewDashboard: true,
        canViewProjects: false,
        canCreateProject: false,
        canEditProject: false,
        canViewTasks: false,
        canCreateMainTask: false,
        canCreateSubtask: false,
        canAssignTask: false,
        canApproveTask: false,
        canViewReports: false,
        canManageUsers: true,
        canManageDepartments: true,
        canViewSystemLogs: true,
        canConfigureSystem: true,
    },
    director: {
        canViewDashboard: true,
        canViewProjects: true,
        canCreateProject: false,
        canEditProject: false,
        canViewTasks: true,
        canCreateMainTask: false,
        canCreateSubtask: false,
        canAssignTask: false,
        canApproveTask: false,
        canViewReports: true,
        canManageUsers: false,
        canManageDepartments: false,
        canViewSystemLogs: false,
        canConfigureSystem: false,
    },
    pmo: {
        canViewDashboard: true,
        canViewProjects: true,
        canCreateProject: true,
        canEditProject: true,
        canViewTasks: true,
        canCreateMainTask: true,
        canCreateSubtask: false,
        canAssignTask: true,
        canApproveTask: false,
        canViewReports: true,
        canManageUsers: true,
        canManageDepartments: true,
        canViewSystemLogs: false,
        canConfigureSystem: false,
    },
    leader: {
        canViewDashboard: true,
        canViewProjects: true,
        canCreateProject: false,
        canEditProject: false,
        canViewTasks: true,
        canCreateMainTask: false,
        canCreateSubtask: true,
        canAssignTask: true,
        canApproveTask: true,
        canViewReports: true,
        canManageUsers: false,
        canManageDepartments: false,
        canViewSystemLogs: false,
        canConfigureSystem: false,
    },
    staff: {
        canViewDashboard: true,
        canViewProjects: true,
        canCreateProject: false,
        canEditProject: false,
        canViewTasks: true,
        canCreateMainTask: false,
        canCreateSubtask: false,
        canAssignTask: false,
        canApproveTask: false,
        canViewReports: false,
        canManageUsers: false,
        canManageDepartments: false,
        canViewSystemLogs: false,
        canConfigureSystem: false,
    },
};
