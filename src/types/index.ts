// ===================
// ROLE DEFINITIONS
// ===================
// 1. SYSTEM ADMIN - Quản lý user, phân quyền, cấu hình hệ thống, xem log. KHÔNG tham gia nghiệp vụ dự án
// 2. DIRECTOR (Ban Giám đốc) - Xem Dashboard tổng hợp, xem báo cáo. KHÔNG chỉnh sửa dữ liệu, KHÔNG giao task
// 3. PMO - Tạo/quản lý Dự án, tạo Main Task, gán Leader, theo dõi tiến độ, cảnh báo trễ hạn, tổng hợp báo cáo
// 4. LEADER - Nhận Main Task, tạo Subtask, phân công Nhân viên, duyệt/trả lại Subtask, đánh giá tiến độ
// 5. STAFF (Nhân viên) - Nhận/từ chối Subtask, cập nhật tiến độ, upload tài liệu, gửi trình duyệt

export type UserRole = 'admin' | 'director' | 'pmo' | 'leader' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status: 'active' | 'locked';
}

// Task statuses with proper workflow
export type TaskStatus = 
  | 'not-assigned'    // Chưa nhận
  | 'in-progress'     // Đang làm
  | 'waiting-approval'// Chờ duyệt
  | 'returned'        // Trả lại
  | 'completed'       // Hoàn thành
  | 'overdue';        // Trễ hạn

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: User;  // PMO who manages the project
  departments: string[];
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  mainTaskCount: number;
  createdBy: string;
  createdAt: string;
}

export interface MainTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  department: string;
  leader: User;       // Leader assigned to this task
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  progress: number;
  subtaskCount: number;
  completedSubtasks: number;
  createdBy: string;  // PMO who created this task
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  mainTaskId: string;
  mainTaskTitle: string;
  assignee: User;     // Staff assigned to this subtask
  createdBy: string;  // Leader who created this subtask
  status: TaskStatus;
  deadline: string;
  progress: number;
  attachments: Attachment[];
  activityLog: ActivityLog[];
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  leader?: User;
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'deadline';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface SystemConfig {
  centerName: string;
  logo?: string;
  deadlineWarningDays: number;
  maxUsers: number;
}

// Vietnamese labels
export const roleLabels: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  director: 'Ban Giám đốc',
  pmo: 'PMO',
  leader: 'Trưởng nhóm',
  staff: 'Nhân viên',
};

export const statusLabels: Record<TaskStatus, string> = {
  'not-assigned': 'Chưa nhận',
  'in-progress': 'Đang làm',
  'waiting-approval': 'Chờ duyệt',
  'returned': 'Trả lại',
  'completed': 'Hoàn thành',
  'overdue': 'Trễ hạn',
};

export const priorityLabels: Record<TaskPriority, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

// Role-based permissions
export const rolePermissions: Record<UserRole, {
  canViewDashboard: boolean;
  canViewProjects: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canViewTasks: boolean;
  canCreateMainTask: boolean;
  canCreateSubtask: boolean;
  canAssignTask: boolean;
  canApproveTask: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageDepartments: boolean;
  canViewSystemLogs: boolean;
  canConfigureSystem: boolean;
}> = {
  admin: {
    canViewDashboard: true,
    canViewProjects: false,      // Admin không tham gia nghiệp vụ dự án
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
    canCreateProject: false,     // Director chỉ xem, không tạo
    canEditProject: false,       // Director chỉ xem, không sửa
    canViewTasks: true,
    canCreateMainTask: false,
    canCreateSubtask: false,
    canAssignTask: false,        // Director không giao task
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
    canCreateProject: true,      // PMO tạo và quản lý dự án
    canEditProject: true,
    canViewTasks: true,
    canCreateMainTask: true,     // PMO tạo Main Task
    canCreateSubtask: false,
    canAssignTask: true,         // PMO gán Leader cho Main Task
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
    canCreateSubtask: true,      // Leader tạo Subtask
    canAssignTask: true,         // Leader phân công nhân viên
    canApproveTask: true,        // Leader duyệt/trả lại Subtask
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
