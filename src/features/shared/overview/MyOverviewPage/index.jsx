import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { ProgressBar, ProgressLegend, PriorityLegend } from '@core/components/common/ProgressBar';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { Kanban, Clock, AlertTriangle, CheckCircle2, ArrowRight, Calendar, } from 'lucide-react';
import { taskService } from '@core/services/taskService';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function MyOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [myTasks, setMyTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // Merge all tasks to find the selected one
  const allTasks = [...myTasks, ...upcomingTasks, ...overdueTasks];
  // Deduplicate by ID just in case they overlap (unlikely with current filter logic but safe)
  const taskMap = new Map();
  allTasks.forEach(t => taskMap.set(t.id, t));

  const selectedTask = selectedTaskId ? taskMap.get(selectedTaskId) : null;


  useEffect(() => {
    if (user?.m_id) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      const res = await taskService.getAllTasks({ assignedTo: user.m_id });
      if (res.ok) {
        const allTasks = res.data;
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const inProgress = [];
        const upcoming = [];
        const overdue = [];

        allTasks.forEach(t => {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          const isCompleted = t.status === 'completed';

          // Overdue: Not completed AND deadline passed
          if (deadline && deadline < now && !isCompleted) {
            overdue.push(t);
          }

          // Upcoming: Not completed AND deadline within 3 days AND not overdue
          else if (deadline && deadline <= threeDaysFromNow && deadline >= now && !isCompleted) {
            upcoming.push(t);
          }

          // In Progress: status is in-progress (and maybe others?)
          // Or just show everything assigned that is active? 
          // Let's stick to status 'in-progress' as "Doing" list.
          if (t.status === 'in-progress') {
            inProgress.push(t);
          }
        });

        setMyTasks(inProgress);
        setUpcomingTasks(upcoming);
        setOverdueTasks(overdue);
      }
    } catch (error) {
      console.error("Failed to fetch my tasks", error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTaskId(task.id);
    setShowDetail(true);
  };

  const handleTaskUpdate = () => {
    fetchMyTasks();
  };

  const TaskItem = ({ task }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
    return (<div onClick={() => handleTaskClick(task)} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {task.assignee?.name?.charAt(0) || user?.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {/* Màu độ ưu tiên trên tiêu đề */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-priority-high' :
            task.priority === 'medium' ? 'bg-priority-medium' : 'bg-priority-low'}`} />
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors flex-1">
            {task.title}
          </p>
          {/* Progress bar cùng dòng với tiêu đề */}
          <div className="w-24 flex-shrink-0">
            <ProgressBar value={task.progress} size="sm" showLabel={false} />
          </div>
          <span className="text-xs font-medium text-muted-foreground w-8 text-right">
            {task.progress}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{task.projectName || 'General'}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="w-3 h-3" />
          {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>);
  };
  return (<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {user?.name ? user.name.split(' ').slice(-1) : 'Bạn'}!</h1>
        <p className="text-muted-foreground">Tổng quan công việc của bạn</p>
      </div>
      <Button onClick={() => navigate('/tasks-board')}>
        <Kanban className="w-4 h-4 mr-2" />
        Vào bảng công việc
      </Button>
    </div>

    {/* Chú thích màu */}
    <div className="flex flex-wrap items-center gap-6 p-4 bg-card rounded-lg border">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Tiến độ</p>
        <ProgressLegend />
      </div>
      <div className="h-8 w-px bg-border" />
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Độ ưu tiên</p>
        <PriorityLegend />
      </div>
    </div>

    {/* Thống kê nhanh */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-[hsl(var(--status-in-progress))] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-in-progress-bg))] flex items-center justify-center transition-colors duration-200">
              <Clock className="w-5 h-5 text-[hsl(var(--status-in-progress))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myTasks.length}</p>
              <p className="text-sm text-muted-foreground">Đang thực hiện</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[hsl(var(--status-pending))] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-pending-bg))] flex items-center justify-center transition-colors duration-200">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-pending))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Sắp đến hạn</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[hsl(var(--status-overdue))] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-overdue-bg))] flex items-center justify-center transition-colors duration-200">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-overdue))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueTasks.length}</p>
              <p className="text-sm text-muted-foreground">Trễ hạn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Công việc đang làm */}
    <Card className="transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-[hsl(var(--status-in-progress))]" />
          Công việc đang thực hiện
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/tasks-board')} className="transition-all duration-200 hover:scale-105">
          Xem tất cả
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {myTasks.length > 0 ? (myTasks.map(task => <TaskItem key={task.id} task={task} />)) : (<div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Không có công việc nào đang thực hiện</p>
        </div>)}
      </CardContent>
    </Card>

    {/* Sắp đến hạn */}
    {upcomingTasks.length > 0 && (<Card className="border-[hsl(var(--status-pending)/0.3)] transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-pending))]" />
          Sắp đến hạn (trong 3 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
      </CardContent>
    </Card>)}

    {/* Trễ hạn */}
    {overdueTasks.length > 0 && (<Card className="border-[hsl(var(--status-overdue)/0.3)] transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Trễ hạn - Cần xử lý ngay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {overdueTasks.map(task => <TaskItem key={task.id} task={task} />)}
      </CardContent>
    </Card>)}

    {/* Chi tiết thẻ */}
    <SubtaskDetailModal
      open={showDetail}
      onOpenChange={(open) => {
        setShowDetail(open);
        if (!open) setSelectedTaskId(null);
      }}
      task={selectedTask}
      onTaskUpdate={handleTaskUpdate}
    />

  </div>);
}

