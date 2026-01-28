import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { roleLabels } from '@/models';
import { useTheme } from '@core/hooks/use-theme';
import { Search, Bell, ChevronDown, User, Lock, LogOut, Sun, Moon, Menu, Check } from 'lucide-react';
import { Input } from '@core/components/ui/input';
import { Button } from '@core/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@core/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@core/components/ui/tooltip';
import { notificationService } from '@core/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function AppHeader({ isMobile = false, onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await notificationService.getNotifications(1, 10, false); // Get latest 10
    if (res.ok) {
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.IsRead).length; // Calculate unread from loaded, or ideally backend returns count
      // For now, let's just use what we loaded or check if backend provides meta. 
      // Backend pagination usually gives total items, not total unread.
      // We can fetch unreadOnly=true to get count, but for dropdown we need mixed.
      // Let's just count unread in the visible list for now + maybe a separate call for count if needed.
      // Improving: let's just show unread count of visible items or assume backend might provide it later.
      setNotificationCount(unread);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Simple polling every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.IsRead) {
      await notificationService.markAsRead(notification.N_ID);
      // Update local state to reflect read status instantly
      setNotifications(prev => prev.map(n => n.N_ID === notification.N_ID ? { ...n, IsRead: true } : n));
      setNotificationCount(prev => Math.max(0, prev - 1));
    }

    // Navigate based on type/related entity
    // TaskId, ProjectId
    if (notification.TaskId) {
      navigate(`/tasks/${notification.TaskId}`);
    } else if (notification.ProjectId) {
      navigate(`/projects/${notification.ProjectId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
    setNotificationCount(0);
  };

  return (
    <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Left side: Menu button (mobile) */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button - Mobile Only */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        {/* Search icon for mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground sm:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-all duration-200 hover:scale-105"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-400" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-300" />
              <span className="sr-only">Chuyển đổi giao diện</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-all duration-200 hover:scale-105">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-popover max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold">Thông báo</span>
              {notificationCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs text-primary">
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.N_ID}
                    className={`flex flex-col items-start gap-1 cursor-pointer transition-colors p-3 rounded-md ${!notif.IsRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <p className={`text-sm ${!notif.IsRead ? 'font-semibold' : 'font-medium'}`}>{notif.Message}</p>
                      {!notif.IsRead && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.CreatedAt), { addSuffix: true, locale: vi })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="link" size="sm" className="w-full text-xs" onClick={() => navigate('/reminders?tab=notifications')}>
                Xem tất cả
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Hide user info on mobile, show on tablet+ */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {user?.name || user?.username}
                </span>
                <span className="text-xs text-sidebar-muted">
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-muted hidden md:block" />
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
    </header>
  );
}

