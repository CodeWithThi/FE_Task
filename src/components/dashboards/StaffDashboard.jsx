import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { Kanban, Clock, AlertTriangle, CheckCircle2, ArrowRight, Calendar, } from 'lucide-react';
import { taskService } from '@core/services/taskService';
import { toast } from 'sonner';

export function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [myTasks, setMyTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Merge all tasks to find the selected one
  const allTasks = [...myTasks, ...upcomingTasks, ...overdueTasks, ...completedTasks];
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
        const completed = [];

        allTasks.forEach(t => {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          const isCompleted = t.status === 'completed' || t.status === 'done';

          if (isCompleted) {
            completed.push(t);
          } else if (deadline && deadline < now) {
            overdue.push(t);
          } else if (deadline && deadline <= threeDaysFromNow && deadline >= now) {
            upcoming.push(t);
          } else if (t.status === 'in-progress' || t.status === 'todo') {
            inProgress.push(t);
          }
        });

        setMyTasks(inProgress);
        setUpcomingTasks(upcoming);
        setOverdueTasks(overdue);
        setCompletedTasks(completed);
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

  // Calculate total personal tasks (all tasks assigned to me)
  const totalPersonalTasks = myTasks.length + upcomingTasks.length + overdueTasks.length + completedTasks.length;

  const TaskItem = ({ task }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
    return (<div onClick={() => handleTaskClick(task)} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-indigo-50/50 cursor-pointer transition-all group border-l-2 border-l-transparent hover:border-l-indigo-500 hover:shadow-sm">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="text-sm bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-semibold">
          {task.assignee?.name?.charAt(0) || user?.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{task.projectName || 'General'}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 flex items-center gap-2">
          <ProgressBar value={task.progress || 0} size="sm" showLabel={false} />
          <span className="text-xs font-semibold text-indigo-600 w-8 text-right">{task.progress || 0}%</span>
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
          <Calendar className="w-3 h-3" />
          {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </div>);
  };
  return (<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Xin chào, {user?.name ? user.name.split(' ').slice(-1) : 'Bạn'}! 👋
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          Tổng quan công việc của bạn
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <Button onClick={() => navigate('/tasks-board')} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
          <Kanban className="w-4 h-4 mr-2" />
          Vào bảng công việc
        </Button>
      </div>
    </div>

    {/* KPI Cards Reordered */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Priority 1: Trễ hạn (Đỏ) */}
      <div className="bg-gradient-to-br from-red-50 to-rose-100/50 p-5 rounded-2xl border border-red-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
        <div>
          <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Trễ hạn</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-red-700">{overdueTasks.length}</h3>
            {overdueTasks.length > 0 ?
              <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">Cần xử lý</span> :
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Tốt</span>
            }
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/30">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Priority 2: Sắp đến hạn (Cam) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 p-5 rounded-2xl border border-amber-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
        <div>
          <p className="text-sm font-medium text-amber-600 uppercase tracking-wider">Sắp đến hạn</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-amber-700">{upcomingTasks.length}</h3>
            {upcomingTasks.length > 0 ?
              <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">Chú ý</span> :
              <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Tốt</span>
            }
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Priority 3: Đang thực hiện (Xanh dương) */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 p-5 rounded-2xl border border-blue-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
        <div>
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Đang làm</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-blue-700">{myTasks.length}</h3>
            <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
              Hoạt động
            </span>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Priority 4: Hoàn thành (Xanh lá) */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 p-5 rounded-2xl border border-emerald-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
        <div>
          <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Hoàn thành</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-emerald-700">{completedTasks.length}</h3>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Tuyệt vời
            </span>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Priority 5: Việc cá nhân (Tổng) */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-100/50 p-5 rounded-2xl border border-violet-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
        <div>
          <p className="text-sm font-medium text-violet-600 uppercase tracking-wider">Tổng cộng</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-violet-700">{totalPersonalTasks}</h3>
            <span className="text-xs text-violet-600 font-semibold bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200">
              Việc cá nhân
            </span>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/30">
          <Kanban className="w-5 h-5" />
        </div>
      </div>
    </div>

    {/* 2-Column Grid Layout for Task Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Trễ hạn */}
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Trễ hạn
          </h3>
          {overdueTasks.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">
              {overdueTasks.length}
            </span>
          )}
        </div>
        <div className="space-y-3">
          {overdueTasks.length > 0 ? (
            overdueTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium text-gray-600">Không có việc trễ hạn</p>
              <p className="text-xs text-gray-400 mt-1">Tuyệt vời!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Đang thực hiện */}
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-400 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Clock className="w-5 h-5" />
            Đang thực hiện
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tasks-board')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-sm">
            Xem tất cả
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {myTasks.length > 0 ? (
            myTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Không có việc đang làm</p>
              <p className="text-xs text-gray-400 mt-1">Bắt đầu một công việc mới</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Sắp đến hạn - Full width below */}
    {upcomingTasks.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-amber-400 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Sắp đến hạn (trong 3 ngày)
          </h3>
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold animate-pulse">
            {upcomingTasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
    )}

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
