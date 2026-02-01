import { useState } from 'react';
import { NavLink } from '@core/components/common/NavLink';
import { useAuth } from '@core/contexts/AuthContext';
import { cn } from '@core/lib/utils';
import { LayoutDashboard, FolderKanban, Kanban, Bell, BarChart3, Users, Building2, Settings, ChevronLeft, ChevronRight, FileText, GraduationCap, X, } from 'lucide-react';

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

export function AppSidebar({ collapsed, setCollapsed, isMobile = false, mobileOpen = false, setMobileOpen }) {
  const { user } = useAuth();
  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  // Group items by section
  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  // Handle nav link click on mobile - close sidebar
  const handleNavClick = () => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  // Determine visibility
  const isVisible = isMobile ? mobileOpen : true;
  const sidebarWidth = isMobile ? 'w-64' : (collapsed ? 'w-16' : 'w-64');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#0F172A] flex flex-col transition-all duration-300 z-40 shadow-xl border-r border-slate-800/50',
        sidebarWidth,
        // Mobile: slide in/out animation
        isMobile && !mobileOpen && '-translate-x-full',
        isMobile && mobileOpen && 'translate-x-0 shadow-2xl'
      )}
    >
      {/* Header: Logo + Center Name */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50 flex-shrink-0 bg-[#0F172A]">
        {(isMobile || !collapsed) ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center transition-transform duration-200 hover:scale-105 shadow-lg shadow-blue-900/40">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-lg">Trung Tâm</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto transition-transform duration-200 hover:scale-105 shadow-lg shadow-blue-900/40">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Close button for mobile, collapse toggle for desktop */}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#162235] text-slate-400 hover:text-white transition-all duration-200"
            title="Đóng menu"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-[#162235] text-slate-400 hover:text-white transition-all duration-200 hover:scale-105',
              collapsed && 'absolute right-1 top-1/2 -translate-y-1/2'
            )}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Navigation Menu with Scroll */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-4">
            {(isMobile || !collapsed) && sectionLabels[section] && (
              <p className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {sectionLabels[section]}
              </p>
            )}
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-md text-[#CBD5E1] transition-all duration-200 cursor-pointer group',
                      'hover:bg-[#162235] hover:text-white',
                      !isMobile && collapsed && 'justify-center px-2 mx-0'
                    )}
                    activeClassName="bg-[#1E293B] text-white font-medium border-l-[3px] border-blue-500 rounded-l-none"
                    title={(!isMobile && collapsed) ? item.label : undefined}
                    onClick={handleNavClick}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0 transition-colors group-hover:text-white" />
                    {(isMobile || !collapsed) && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

