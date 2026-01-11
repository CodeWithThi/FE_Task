// ===================
// ROLE DEFINITIONS
// ===================
// 1. SYSTEM ADMIN - Quản lý user, phân quyền, cấu hình hệ thống, xem log. KHÔNG tham gia nghiệp vụ dự án
// 2. DIRECTOR (Ban Giám đốc) - Xem Dashboard tổng hợp, xem báo cáo. KHÔNG chỉnh sửa dữ liệu, KHÔNG giao task
// 3. PMO - Tạo/quản lý Dự án, tạo Main Task, gán Leader, theo dõi tiến độ, cảnh báo trễ hạn, tổng hợp báo cáo
// 4. LEADER - Nhận Main Task, tạo Subtask, phân công Nhân viên, duyệt/trả lại Subtask, đánh giá tiến độ
// 5. STAFF (Nhân viên) - Nhận/từ chối Subtask, cập nhật tiến độ, upload tài liệu, gửi trình duyệt
// Vietnamese labels
export const roleLabels = {
    admin: 'Quản trị viên',
    director: 'Ban Giám đốc',
    pmo: 'PMO',
    leader: 'Trưởng nhóm',
    staff: 'Nhân viên',
};
export const statusLabels = {
    'not-assigned': 'Chưa nhận',
    'in-progress': 'Đang làm',
    'waiting-approval': 'Chờ duyệt',
    'returned': 'Trả lại',
    'completed': 'Hoàn thành',
    'overdue': 'Trễ hạn',
};
export const priorityLabels = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
};
// Role-based permissions
export const rolePermissions = {
    admin: {
        canViewDashboard: true,
        canViewProjects: false, // Admin không tham gia nghiệp vụ dự án
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
        canCreateProject: false, // Director chỉ xem, không tạo
        canEditProject: false, // Director chỉ xem, không sửa
        canViewTasks: true,
        canCreateMainTask: false,
        canCreateSubtask: false,
        canAssignTask: false, // Director không giao task
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
        canCreateProject: true, // PMO tạo và quản lý dự án
        canEditProject: true,
        canViewTasks: true,
        canCreateMainTask: true, // PMO tạo Main Task
        canCreateSubtask: false,
        canAssignTask: true, // PMO gán Leader cho Main Task
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
        canCreateSubtask: true, // Leader tạo Subtask
        canAssignTask: true, // Leader phân công nhân viên
        canApproveTask: true, // Leader duyệt/trả lại Subtask
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
