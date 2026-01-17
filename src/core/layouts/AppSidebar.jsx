import { useState } from 'react';
import { NavLink } from '@core/components/common/NavLink';
import { useAuth } from '@core/contexts/AuthContext';
import { cn } from '@core/lib/utils';
import { LayoutDashboard, FolderKanban, Kanban, Bell, BarChart3, Users, Building2, Settings, ChevronLeft, ChevronRight, FileText, GraduationCap, } from 'lucide-react';
// Menu theo role:
// - Director: Tổng quan (chỉ xem)
// - PMO: Dự án (Workspace)
// - Leader/Staff: Tổng quan công việc → Bảng công việc
// - Admin: Quản lý hệ thống
const menuItems = [
  // Tổng quan - Director, PMO, Admin
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/dashboard',
    roles: ['admin', 'director', 'pmo'],
    section: 'main',
  },
  // Tổng quan công việc của tôi - Leader/Staff
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/my-overview',
    roles: ['leader', 'staff'],
    section: 'main',
  },

  // Dự án - Director, PMO (không phải Leader/Staff)
  {
    icon: FolderKanban,
    label: 'Dự án',
    path: '/projects',
    roles: ['director', 'pmo', 'leader', 'staff'],
    section: 'project',
  },
  // Danh sách công việc
  {
    icon: Kanban,
    label: 'Công việc',
    path: '/tasks',
    roles: ['leader', 'staff', 'pmo', 'director'],
    section: 'project',
  },
  // Nhắc việc - PMO, Leader, Staff
  {
    icon: Bell,
    label: 'Nhắc việc',
    path: '/reminders',
    roles: ['pmo', 'leader', 'staff'],
    section: 'project',
  },
  // Báo cáo - Director, PMO, Leader (không phải Staff)
  {
    icon: BarChart3,
    label: 'Báo cáo',
    path: '/reports',
    roles: ['director', 'pmo', 'leader'],
    section: 'report',
  },
  // Quản lý nhân sự - Admin và PMO
  {
    icon: Users,
    label: 'Nhân sự',
    path: '/users',
    roles: ['admin', 'pmo'],
    section: 'management',
  },
  {
    icon: Building2,
    label: 'Phòng ban',
    path: '/departments',
    roles: ['admin', 'pmo'],
    section: 'management',
  },
  // Hệ thống - Chỉ Admin
  {
    icon: FileText,
    label: 'Nhật ký hệ thống',
    path: '/logs',
    roles: ['admin'],
    section: 'system',
  },
  {
    icon: Settings,
    label: 'Cấu hình',
    path: '/settings',
    roles: ['admin'],
    section: 'system',
  },
];
const sectionLabels = {
  main: '',
  project: 'Quản lý',
  report: 'Báo cáo',
  management: 'Quản lý',
  system: 'Hệ thống',
};
export function AppSidebar({ collapsed, setCollapsed }) {
  // const [collapsed, setCollapsed] = useState(false); // Removed local state
  const { user } = useAuth();
  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));
  // Group items by section
  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section])
      acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});
  return (<aside className={cn('fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40', collapsed ? 'w-16' : 'w-64')}>
    {/* Phần trên: Logo + Tên trung tâm */}
    <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
      {collapsed ? (<div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto transition-transform duration-200 hover:scale-105">
        <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
      </div>) : (<div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sidebar-foreground font-semibold">Trung Tâm Dạy Học</span>
      </div>)}
      <button onClick={() => setCollapsed(!collapsed)} className={cn('p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-all duration-200 hover:scale-105', collapsed && 'absolute right-1 top-1/2 -translate-y-1/2')} title={collapsed ? 'Mở rộng' : 'Thu gọn'}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>

    {/* Phần dưới: Menu chức năng với thanh cuộn */}
    <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
      {Object.entries(groupedItems).map(([section, items]) => (<div key={section} className="mb-4">
        {!collapsed && sectionLabels[section] && (<p className="px-3 mb-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
          {sectionLabels[section]}
        </p>)}
        <ul className="space-y-1">
          {items.map((item) => (<li key={item.path}>
            <NavLink to={item.path} className={cn('sidebar-item', collapsed && 'justify-center px-2')} activeClassName="sidebar-item-active" title={collapsed ? item.label : undefined}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>))}
        </ul>
      </div>))}
    </nav>
  </aside>);
}

