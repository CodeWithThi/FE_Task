import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { roleLabels } from '@/models';
import { useTheme } from '@core/hooks/use-theme';
import { Search, Bell, ChevronDown, User, Lock, LogOut, Sun, Moon } from 'lucide-react';
import { Input } from '@core/components/ui/input';
import { Button } from '@core/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@core/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@core/components/ui/tooltip';
export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationCount] = useState(3);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (<header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
    {/* Tìm kiếm */}
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-muted" />
      <Input placeholder="Tìm kiếm dự án, công việc..." className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted focus-visible:ring-1 focus-visible:ring-sidebar-ring transition-colors duration-200" />
    </div>

    {/* Phần bên phải */}
    <div className="flex items-center gap-2">
      {/* Nút chuyển đổi theme */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-all duration-200 hover:scale-105">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-400" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-300" />
            <span className="sr-only">Chuyển đổi giao diện</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Thông báo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-all duration-200 hover:scale-105">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (<span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
              {notificationCount}
            </span>)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-popover">
          <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/my-overview')}>
              <p className="text-sm font-medium">Công việc mới được giao</p>
              <p className="text-xs text-muted-foreground">Bạn được giao công việc "Chuẩn bị giáo án tháng 1"</p>
              <span className="text-xs text-muted-foreground">5 phút trước</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/tasks-board')}>
              <p className="text-sm font-medium">Công việc đã được duyệt</p>
              <p className="text-xs text-muted-foreground">"Soạn đề kiểm tra" đã hoàn thành</p>
              <span className="text-xs text-muted-foreground">2 giờ trước</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/projects')}>
              <p className="text-sm font-medium">Thay đổi thời hạn dự án</p>
              <p className="text-xs text-muted-foreground">Dự án "Chương trình học kỳ 2" được gia hạn</p>
              <span className="text-xs text-muted-foreground">1 ngày trước</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.name || user?.username}
              </span>
              <span className="text-xs text-sidebar-muted">
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Hồ sơ cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/change-password')}
          >
            <Lock className="w-4 h-4 mr-2" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>);
}

