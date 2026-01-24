import { useState, useEffect } from 'react';
import { PageHeader } from '@core/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Button } from '@core/components/ui/button';
import { Clock, AlertTriangle, Calendar, Bell, Loader2, CheckCircle2, Info, Check } from 'lucide-react';
import { taskService } from '@core/services/taskService';
import { notificationService } from '@core/services/notificationService';
import { useAuth } from '@core/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function RemindersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'reminders';

  const handleTabChange = (val) => {
    setSearchParams({ tab: val });
  };
  const [loading, setLoading] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getAllTasks();
      if (res.ok && Array.isArray(res.data)) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const overdue = [];
        const dueToday = [];
        const upcoming = [];

        res.data.forEach(task => {
          // Skip completed tasks
          if (task.status === 'completed') return;

          if (!task.deadline) return;

          const deadline = new Date(task.deadline);
          const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

          // Calculate days difference
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const taskWithDays = {
            ...task,
            daysLeft: diffDays,
            daysOverdue: -diffDays,
          };

          if (deadlineDate < today) {
            // Overdue
            overdue.push(taskWithDays);
          } else if (deadlineDate.getTime() === today.getTime()) {
            // Due today
            dueToday.push(taskWithDays);
          } else if (deadlineDate <= weekFromNow) {
            // Upcoming (within 7 days)
            upcoming.push(taskWithDays);
          }
        });

        // Sort by deadline
        overdue.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        dueToday.sort((a, b) => (a.priority === 'high' ? -1 : 1));
        upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        setOverdueTasks(overdue);
        setTodayTasks(dueToday);
        setUpcomingTasks(upcoming);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nhắc việc:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(1, 50);
      if (res.ok) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.IsRead) {
      await notificationService.markAsRead(notification.N_ID);
      setNotifications(prev => prev.map(n => n.N_ID === notification.N_ID ? { ...n, IsRead: true } : n));
    }
    if (notification.TaskId) navigate(`/tasks/${notification.TaskId}`);
    else if (notification.ProjectId) navigate(`/projects/${notification.ProjectId}`);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  const totalReminders = overdueTasks.length + todayTasks.length + upcomingTasks.length;
  const unreadNotifications = notifications.filter(n => !n.IsRead).length;

  return (
    <div>
      <PageHeader
        title="Nhắc việc & Thông báo"
        description="Theo dõi công việc sắp đến hạn và các thông báo quan trọng"
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="reminders">
            <Clock className="w-4 h-4 mr-2" />
            Nhắc việc
            {totalReminders > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {totalReminders}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
            {unreadNotifications > 0 && (
              <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overdue */}
            <Card className="border-red-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Trễ hạn ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mb-2 text-green-500" />
                      <span className="text-sm">Không có công việc trễ hạn</span>
                    </div>
                  ) : (
                    overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{task.title}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.projectName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xs font-medium text-red-600">
                            Trễ {task.daysOverdue} ngày
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today */}
            <Card className="border-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                  <Calendar className="w-5 h-5" />
                  Đến hạn hôm nay ({todayTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mb-2 text-green-500" />
                      <span className="text-sm">Không có công việc đến hạn hôm nay</span>
                    </div>
                  ) : (
                    todayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className="p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{task.title}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <p className="text-xs text-muted-foreground">{task.projectName}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  Sắp đến hạn ({upcomingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mb-2 text-green-500" />
                      <span className="text-sm">Không có công việc sắp đến hạn</span>
                    </div>
                  ) : (
                    upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{task.title}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.projectName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            Còn {task.daysLeft} ngày
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tất cả thông báo</CardTitle>
              {notifications.some(n => !n.IsRead) && (
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Info className="w-12 h-12 mb-3 text-blue-400" />
                  <span className="text-base font-medium mb-1">Chưa có thông báo</span>
                  <span className="text-sm">Các thông báo mới sẽ xuất hiện ở đây</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.N_ID}
                      className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${!notif.IsRead ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`mt-1 p-2 rounded-full ${!notif.IsRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm ${!notif.IsRead ? 'font-semibold' : 'font-medium'}`}>{notif.Message}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notif.CreatedAt), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">{notif.Type}</span>
                          {notif.IsRead && <span className="flex items-center text-xs text-green-600"><Check className="w-3 h-3 mr-1" /> Đã xem</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

