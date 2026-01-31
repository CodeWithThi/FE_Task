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
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { toast } from 'sonner';
import { ListTodo, Users, Clock, CheckCircle2, UserCheck, ArrowRight, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { dashboardService } from '@core/services/dashboardService';
import { taskService } from '@core/services/taskService';
import { projectService } from '@core/services/projectService';
import { TaskFormModal } from '../modals/TaskFormModal';

export function LeaderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teamSize: 0,
    totalTasks: 0,
    pendingApprovals: 0,
    completedWeek: 0,
    personalStats: {
      inProgress: 0,
      dueSoon: 0,
      overdue: 0
    }
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          dashboardService.getStats(),
          taskService.getAllTasks(),
          projectService.getAllProjects()
        ]);

        const allTasks = tasksRes.ok ? tasksRes.data : [];
        const dashboardData = statsRes.ok ? statsRes.data : null;

        // Load Projects
        if (projectsRes.ok) {
          setProjects(projectsRes.data || []);
        }

        // 0. Get Trusted Team Members from Stats (Backend Scoped)
        const teamMemberIds = new Set();
        let validTeamMembers = [];

        if (dashboardData && dashboardData.members && Array.isArray(dashboardData.members.workload)) {
          // Filter out System/Admin accounts
          validTeamMembers = dashboardData.members.workload.filter(m => {
            const name = (m.name || '').toLowerCase();
            return !name.includes('system') && !name.includes('admin') && !name.includes('quản trị');
          });
          validTeamMembers.forEach(m => teamMemberIds.add(m.id));
        }

        // Filter tasks to only those assigned to my team members
        const scopedTasks = dashboardData ? allTasks.filter(t => t.assignee && teamMemberIds.has(t.assignee.id)) : [];

        // 1. Pending Approvals
        const pending = scopedTasks.filter(t => t.status === 'waiting-approval');
        setPendingApprovals(pending);

        // 2. Team Tasks
        setTeamTasks(scopedTasks);

        // 3. Team Members Map
        const memberMap = new Map();
        validTeamMembers.forEach(m => {
          memberMap.set(m.id, {
            id: m.id,
            name: m.name,
            tasks: 0,
            completed: 0,
            department: m.department // Keep department info if available for modal
          });
        });

        scopedTasks.forEach(task => {
          if (task.assignee && task.assignee.id && memberMap.has(task.assignee.id)) {
            const member = memberMap.get(task.assignee.id);
            member.tasks++;
            if (task.status === 'completed' || task.status === 'done') {
              member.completed++;
            }
          }
        });
        setTeamMembers(Array.from(memberMap.values()));

        // 4. Stats - calculate overdue tasks
        const now = new Date();
        const overdueTasks = scopedTasks.filter(t => {
          if (!t.deadline) return false;
          const isCompleted = ['completed', 'done', 'cancelled'].includes(t.status);
          return !isCompleted && new Date(t.deadline) < now;
        });

        setStats({
          teamSize: validTeamMembers.length,
          totalTasks: scopedTasks.length,
          pendingApprovals: pending.length,
          completedWeek: scopedTasks.filter(t => t.status === 'completed' || t.status === 'done').length,
          overdueTasks: overdueTasks.length,
          personalStats: dashboardData?.personalStats || { inProgress: 0, dueSoon: 0, overdue: 0 }
        });

      } catch (error) {
        console.error('Failed to load leader dashboard', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApprove = async (task) => {
    try {
      const finalStatus = 'completed';
      const updateRes = await taskService.updateTask(task.id, { status: finalStatus });

      if (updateRes.ok) {
        toast.success('Đã duyệt công việc');
        setPendingApprovals(prev => prev.filter(t => t.id !== task.id));
        setTeamTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: finalStatus, progress: 100 } : t));
      } else {
        toast.error('Không thể duyệt công việc');
      }
    } catch (err) {
      toast.error('Lỗi hệ thống');
    }
  };

  const handleReject = async (task) => {
    try {
      const res = await taskService.updateTask(task.id, { status: 'returned' });
      if (res.ok) {
        toast.success('Đã trả lại công việc');
        setPendingApprovals(prev => prev.filter(t => t.id !== task.id));
        setTeamTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'returned' } : t));
      } else {
        toast.error('Không thể trả lại công việc');
      }
    } catch (err) {
      toast.error('Lỗi hệ thống');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const res = await taskService.createTask(taskData);
      if (res.ok || res.status === 201) {
        toast.success('Giao việc thành công');
        setShowTaskModal(false);
        // Optimistic update or reload? 
        // Reload is safer to get full assignee object/relations
        // But let's verify if we can just append
        // For simplicity reusing scopedTasks logic, might be best to trigger a mini-reload or rely on real-time. 
        // Or manual append:
        const newTask = res.data;
        if (newTask) {
          setTeamTasks(prev => [newTask, ...prev]);
          // Also update stats manually?
          setStats(prev => ({ ...prev, totalTasks: prev.totalTasks + 1 }));
        }
      } else {
        toast.error('Không thể giao việc');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tạo công việc');
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Xin chào, {user?.name ? user.name.split(' ').slice(-1) : 'Leader'}! 👋
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            Tổng quan công việc hôm nay.
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* 1. Top Stats Cards - 4 columns, reordered by importance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Trễ hạn (Overdue) - Most critical */}
        <div className="bg-gradient-to-br from-red-50 to-rose-100/50 p-5 rounded-2xl border border-red-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
          <div>
            <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Trễ hạn</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-red-700">{stats.overdueTasks || 0}</h3>
              {(stats.overdueTasks || 0) > 0 ?
                <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                  Cần xử lý
                </span> :
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tốt
                </span>
              }
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Team Tasks */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 p-5 rounded-2xl border border-blue-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
          <div>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Việc đội nhóm</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-blue-700">{stats.totalTasks}</h3>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Hoạt động
              </span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 p-5 rounded-2xl border border-amber-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
          <div>
            <p className="text-sm font-medium text-amber-600 uppercase tracking-wider">Chờ duyệt</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-amber-700">{stats.pendingApprovals}</h3>
              {stats.pendingApprovals > 0 ?
                <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">Cần xử lý</span> :
                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Đã xong</span>
              }
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 p-5 rounded-2xl border border-emerald-200/60 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
          <div>
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Hoàn thành</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-emerald-700">{stats.completedWeek}</h3>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Tốt
              </span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Layout - Balanced Spacing & Equal Height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">

        {/* 2. Pending Approvals */}
        <Card className="border-none shadow-sm h-full flex flex-col">
          <CardHeader className="py-5 px-6 border-b flex flex-row items-center justify-between bg-white rounded-t-xl shrink-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Chờ duyệt
            </CardTitle>
            {stats.pendingApprovals > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">{stats.pendingApprovals}</span>}
          </CardHeader>
          <CardContent className="p-0 bg-gray-50/30 flex-1 overflow-auto min-h-[400px]">
            {pendingApprovals.length === 0 ?
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-white">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-900">Không có yêu cầu nào</p>
                <p className="text-sm text-muted-foreground mt-1">Tuyệt vời, bạn đã xử lý hết!</p>
              </div>
              :
              <div className="divide-y divide-gray-100">
                {pendingApprovals.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-5 bg-white hover:bg-purple-50/20 transition-colors">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="font-semibold text-base text-gray-900 line-clamp-1 flex-1" title={item.title}>{item.title}</h4>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Avatar className="h-6 w-6 border">
                          <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">{item.assignee?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[140px] font-medium">{item.assignee?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'Không hạn'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="h-9 flex-1 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors" onClick={() => handleReject(item)}>
                        Từ chối
                      </Button>
                      <Button size="sm" className="h-9 flex-1 bg-purple-600 hover:bg-purple-700 shadow-sm" onClick={() => handleApprove(item)}>
                        Duyệt ngay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        {/* 3. Team Tasks */}
        <Card className="border-none shadow-sm h-full flex flex-col">
          <CardHeader className="py-5 px-6 border-b flex flex-row items-center justify-between bg-white rounded-t-xl shrink-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              Việc đội nhóm
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => setShowTaskModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Giao việc
            </Button>
          </CardHeader>
          <CardContent className="p-0 bg-white flex-1 overflow-auto min-h-[400px]">
            {teamTasks.length === 0 ?
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-900">Chưa có công việc nào</p>
                <p className="text-sm text-muted-foreground mt-1">Danh sách công việc của nhóm đang trống</p>
              </div>
              :
              <div className="divide-y divide-gray-50">
                {teamTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 hover:bg-indigo-50/50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-indigo-500"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-gray-900 truncate pr-2 group-hover:text-indigo-700 transition-colors">{task.title}</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          {task.assignee?.name || 'Chưa gán'}
                        </div>
                        <span>•</span>
                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="w-16 flex items-center gap-2">
                      <ProgressBar value={task.progress || 0} size="sm" showLabel={false} />
                      <span className="text-xs font-semibold text-indigo-600 w-8 text-right">{task.progress || 0}%</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>

      <TaskFormModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        title="Giao việc mới cho nhân viên"
        type="sub-task"
        onSubmit={handleCreateTask}
        accounts={teamMembers}
        projects={projects}
        mode="create"
      />
    </div>
  );
}
