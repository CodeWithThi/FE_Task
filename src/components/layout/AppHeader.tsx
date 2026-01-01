import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { roleLabels } from '@/types';
import { useTheme } from '@/hooks/use-theme';
import { Search, Bell, ChevronDown, User, Lock, LogOut, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationCount] = useState(3);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Tìm kiếm */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm dự án, công việc..."
          className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 transition-colors duration-200"
        />
      </div>

      {/* Phần bên phải */}
      <div className="flex items-center gap-2">
        {/* Nút chuyển đổi theme */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative hover:bg-muted transition-all duration-200 hover:scale-105"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
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
            <button className="relative p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-105">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium">Công việc mới được giao</p>
                <p className="text-xs text-muted-foreground">Bạn được giao công việc "Chuẩn bị giáo án tháng 1"</p>
                <span className="text-xs text-muted-foreground">5 phút trước</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium">Công việc sắp đến hạn</p>
                <p className="text-xs text-muted-foreground">"Hoàn thành báo cáo" còn 2 ngày</p>
                <span className="text-xs text-muted-foreground">1 giờ trước</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium">Công việc đã được duyệt</p>
                <p className="text-xs text-muted-foreground">"Soạn đề kiểm tra" đã hoàn thành</p>
                <span className="text-xs text-muted-foreground">2 giờ trước</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-primary cursor-pointer justify-center hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/reminders')}
            >
              Xem tất cả thông báo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu người dùng */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-all duration-200">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role && roleLabels[user.role]} • {user?.department}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.role && roleLabels[user.role]} • {user?.department}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Thông tin cá nhân
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
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2 text-amber-500" />
                  Chế độ Sáng
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2 text-blue-400" />
                  Chế độ Tối
                </>
              )}
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
    </header>
  );
}
