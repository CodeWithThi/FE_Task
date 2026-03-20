import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { roleLabels } from '@/models';
import { Bell, ChevronDown, User, Lock, LogOut, Menu, Phone, Mail } from 'lucide-react';
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
    <header className="h-16 bg-[#0F172A] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-300 shadow-sm border-b border-slate-800/50">
      {/* Left side: Menu button (mobile) */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button - Mobile Only */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-slate-700/50 text-[#E2E8F0]"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        )}
      </div>

      {/* Right side: Toolbar Icons */}
      <div className="flex items-center gap-4 md:gap-5">

        {/* 1. Phone - Green */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="tel:079204481"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-[#86EFAC] hover:text-[#4ADE80] hover:bg-emerald-500/10 transition-all duration-200"
            >
              <Phone className="w-5 h-5" strokeWidth={2} />
            </a>
          </TooltipTrigger>
          <TooltipContent><p>Hotline: 0792 220 4481</p></TooltipContent>
        </Tooltip>

        {/* 2. Mail - Blue */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="mailto:thi2842005@gmail.com"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-[#93C5FD] hover:text-[#60A5FA] hover:bg-blue-500/10 transition-all duration-200"
            >
              <Mail className="w-5 h-5" strokeWidth={2} />
            </a>
          </TooltipTrigger>
          <TooltipContent><p>Email: Thi2842005@gmail.com</p></TooltipContent>
        </Tooltip>

        {/* 3. Notification - Orange */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center justify-center w-10 h-10 rounded-lg text-[#FDBA74] hover:text-[#FB923C] hover:bg-orange-500/10 transition-all duration-200">
              <Bell className="w-5 h-5" strokeWidth={2} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
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

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-1.5 py-1 rounded-xl hover:bg-slate-700/40 transition-all duration-200">
              <Avatar className="h-9 w-9 ring-2 ring-blue-500/30">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-sm font-bold">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-100">
                  {user?.name || user?.username}
                </span>
                <span className="text-[11px] text-slate-400">
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/members/${user?.username || 'me'}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/account/changePassword')}
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

