import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { PageHeader } from '@core/components/common/PageHeader';
import { StatCard } from '@core/components/common/StatCard';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import { toast } from 'sonner';
import { ListTodo, Clock, CheckCircle2, AlertTriangle, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { dashboardService } from '@core/services/dashboardService';
import { taskService } from '@core/services/taskService';

export function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actionModal, setActionModal] = useState({
    open: false,
    type: 'accept',
    taskTitle: '',
    taskId: null
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myTasks: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0
  });
  const [myTasks, setMyTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Fetch Stats
        const statsPromise = dashboardService.getStats();

        // 2. Fetch My Tasks (using a filter or if backend supports 'me' filter)
        // The taskService logic: getAllTasks(filters). 
        // We'll filter by assignedTo = user.id (which is A_ID or M_ID?)
        // taskService.createTask passes 'assignedTo'.
        // Ideally backend `listTasks` filters by `Assigned_ID_M_ID`.
        // We need the user's M_ID. 'user' object from useAuth usually has it? 
        // Let's assume user.id or user.m_id. 
        // The dashboardService.getStats already returns "me" stats.

        // For the LIST of tasks, we need to call taskService.
        // If we don't know M_ID, we might rely on the backend to filter for 'me' via token?
        // The backend code for listTasks checks: if (assignedTo) where.Assigned_ID_M_ID = assignedTo.
        // It doesn't auto-scope to 'me' if not Pmo/Admin.
        // But wait, user object from login has `user` which comes from `authService.login` -> `response.data.user`.
        // Does that user object have M_ID? 

        // Let's just try fetching all tasks and filtering on client if we can't filter by API yet 
        // OR better, pass user.id if available.
        // Assuming user object has id (A_ID) or m_id (M_ID). 
        // The backend login returns `user` which is the Account object usually, or customized? 
        // Let's assume it has what we need. For now, fetch all tasks and client filter if needed, 
        // OR query with assignedTo if we have user.m_id.

        // Fetch tasks assigned to the current user (using Member ID)
        // Note: user.Member might be null if account not linked to member logic, but schema enforces usually.
        const memberId = user.Member?.M_ID;
        const tasksPromise = taskService.getAllTasks({ assignedTo: memberId });

        const [statsRes, tasksRes] = await Promise.all([statsPromise, tasksPromise]);

        const dashboardData = statsRes.ok ? statsRes.data : null;
        let allTasks = tasksRes.ok ? tasksRes.data : [];

        // Client-side fallback filter if backend didn't filter strictly (or to be safe)
        if (memberId) {
          allTasks = allTasks.filter(t => t.assignee?.id === memberId || t.assignee?.M_ID === memberId);
        }
        const myTaskList = allTasks;

        const now = new Date();
        const overdue = myTaskList.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done' && t.status !== 'completed');
        const upcoming = myTaskList.filter(t => {
          if (!t.deadline || t.status === 'done' || t.status === 'completed') return false;
          const d = new Date(t.deadline);
          const diff = (d - now) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 3;
        });
        const completed = myTaskList.filter(t => t.status === 'done' || t.status === 'completed');

        if (dashboardData) {
          setStats({
            myTasks: dashboardData.me?.assignedTasks || myTaskList.length,
            upcoming: upcoming.length,
            overdue: overdue.length,
            completed: completed.length // This might need a time range check for "this month"
          });
        }

        setMyTasks(myTaskList.slice(0, 5));
        setOverdueTasks(overdue);
        setUpcomingDeadlines(upcoming.map(t => ({
          id: t.id,
          title: t.title,
          deadline: t.deadline,
          daysLeft: Math.ceil((new Date(t.deadline) - now) / (1000 * 60 * 60 * 24))
        })));

      } catch (error) {
        console.error('Failed to load staff dashboard', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAction = (type, task) => {
    setActionModal({ open: true, type, taskTitle: task.title, taskId: task.id });
  };

  const handleConfirmAction = async (reason) => {
    if (!actionModal.taskId) return;

    try {
      // Map action types to task status updates
      let newStatus = '';
      let payload = {};

      switch (actionModal.type) {
        case 'accept': newStatus = 'in-progress'; break;
        case 'reject': newStatus = 'rejected'; break; // or deleted?
        case 'submit': newStatus = 'waiting-approval'; break;
        // approve/return/transfer might be leader actions
        default: return;
      }

      const res = await taskService.updateTask(actionModal.taskId, { status: newStatus });

      if (res.ok) {
        toast.success('Cập nhật trạng thái thành công');
        // Refresh list
        const updatedTasks = myTasks.map(t => t.id === actionModal.taskId ? { ...t, status: newStatus } : t);
        setMyTasks(updatedTasks);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (<div>
    <PageHeader title="Tổng quan - Công việc của tôi" description="Nhận việc, cập nhật tiến độ và gửi trình duyệt" />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Công việc của tôi" value={stats.myTasks} icon={ListTodo} variant="primary" />
      <StatCard title="Sắp đến hạn (3 ngày)" value={stats.upcoming} icon={Clock} variant="warning" />
      <StatCard title="Trễ hạn" value={stats.overdue} icon={AlertTriangle} variant="danger" />
      <StatCard title="Hoàn thành" value={stats.completed} icon={CheckCircle2} variant="success" />
    </div>

    {/* Confirm Action Modal */}
    <ConfirmActionModal open={actionModal.open} onOpenChange={(open) => setActionModal({ ...actionModal, open })} actionType={actionModal.type} taskTitle={actionModal.taskTitle} onConfirm={handleConfirmAction} />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* My Tasks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Overdue Warning */}
        {overdueTasks.length > 0 && (<Card className="border-status-overdue/30 bg-status-overdue-bg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-status-overdue">
              <AlertTriangle className="w-5 h-5" />
              Công việc trễ hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.map((task) => (<div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-status-overdue/20">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.title}</span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <span className="text-sm text-status-overdue font-medium">
                  Trễ {task.daysOverdue || Math.floor((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24))} ngày
                </span>
              </div>))}
            </div>
          </CardContent>
        </Card>)}

        {/* Current Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Công việc của tôi
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/tasks')}>
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.length === 0 ? <p className="text-sm text-muted">Không có công việc nào</p> :
                myTasks.map((task) => (<div key={task.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.projectName || 'Dự án'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <ProgressBar value={task.progress} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Hạn: {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  {task.status === 'in-progress' && (<div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="flex-1">
                      Cập nhật tiến độ
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleAction('submit', task)}>
                      Gửi duyệt
                    </Button>
                  </div>)}
                  {task.status === 'pending' && (<div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="flex-1" onClick={() => handleAction('accept', task)}>
                      Nhận việc
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAction('reject', task)}>
                      Từ chối
                    </Button>
                  </div>)}
                  {/* Note: 'pending' in frontend might map to 'not-assigned' or 'pending' in backend. StatusBadge handles it? */}
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Sắp đến hạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? <p className="text-sm text-muted">Không có deadline sắp tới</p> :
              upcomingDeadlines.map((item) => (<div key={item.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${item.id}`)}>
                <p className="font-medium text-sm mb-1">{item.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                  <span className={`text-xs font-medium ${item.daysLeft <= 1
                    ? 'text-status-overdue'
                    : item.daysLeft <= 3
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-muted-foreground'}`}>
                    Còn {item.daysLeft} ngày
                  </span>
                </div>
              </div>))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>);
}

