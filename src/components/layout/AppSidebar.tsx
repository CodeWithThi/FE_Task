import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Bell,
  BarChart3,
  Users,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
} from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/dashboard',
    roles: ['admin', 'director', 'pmo', 'leader', 'staff'],
  },
  {
    icon: FolderKanban,
    label: 'Dự án',
    path: '/projects',
    roles: ['admin', 'director', 'pmo', 'leader', 'staff'],
  },
  {
    icon: ListTodo,
    label: 'Công việc',
    path: '/tasks',
    roles: ['admin', 'director', 'pmo', 'leader', 'staff'],
  },
  {
    icon: Bell,
    label: 'Nhắc việc',
    path: '/reminders',
    roles: ['admin', 'director', 'pmo', 'leader', 'staff'],
  },
  {
    icon: BarChart3,
    label: 'Báo cáo',
    path: '/reports',
    roles: ['admin', 'director', 'pmo', 'leader'],
  },
  {
    icon: Users,
    label: 'Nhân sự',
    path: '/users',
    roles: ['admin', 'director', 'pmo'],
  },
  {
    icon: Building2,
    label: 'Phòng ban',
    path: '/departments',
    roles: ['admin', 'director', 'pmo'],
  },
  {
    icon: FileText,
    label: 'Nhật ký hệ thống',
    path: '/logs',
    roles: ['admin'],
  },
  {
    icon: Settings,
    label: 'Cấu hình',
    path: '/settings',
    roles: ['admin'],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">TT</span>
            </div>
            <span className="text-sidebar-foreground font-semibold">Trung Tâm</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className="sidebar-item"
                activeClassName="sidebar-item-active"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="p-2 border-t border-sidebar-border">
        {user && (
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg',
            collapsed ? 'justify-center' : ''
          )}>
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-medium text-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-muted truncate">
                  {user.department}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'sidebar-item w-full mt-1 text-sidebar-muted hover:text-red-400',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
