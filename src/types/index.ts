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

export type TaskStatus = 'pending' | 'in-progress' | 'waiting-approval' | 'completed' | 'overdue';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: User;
  departments: string[];
  status: TaskStatus;
  progress: number;
  mainTaskCount: number;
}

export interface MainTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  department: string;
  assignee: User;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  progress: number;
  subtaskCount: number;
  completedSubtasks: number;
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  mainTaskId: string;
  assignee: User;
  status: TaskStatus;
  deadline: string;
  progress: number;
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
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Quản trị hệ thống',
  director: 'Giám đốc',
  pmo: 'PMO',
  leader: 'Trưởng nhóm',
  staff: 'Nhân viên',
};

export const statusLabels: Record<TaskStatus, string> = {
  pending: 'Chờ xử lý',
  'in-progress': 'Đang thực hiện',
  'waiting-approval': 'Chờ duyệt',
  completed: 'Hoàn thành',
  overdue: 'Trễ hạn',
};

export const priorityLabels: Record<TaskPriority, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};
