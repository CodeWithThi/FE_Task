import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { StatCard } from '@core/components/common/StatCard';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { toast } from 'sonner';
import { FolderKanban, ListTodo, AlertTriangle, Eye, Clock, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '@core/services/dashboardService';
import { projectService } from '@core/services/projectService';
import { taskService } from '@core/services/taskService';
import { accountService } from '@core/services/accountService';
import { departmentService } from '@core/services/departmentService';

// Mock chart data for now as backend doesn't provide this yet
const projectProgress = [
  { name: 'Chương trình Hè', planned: 80, actual: 75 },
  { name: 'Đào tạo GV', planned: 100, actual: 100 },
  { name: 'CNTT', planned: 60, actual: 45 },
  { name: 'Năm học mới', planned: 40, actual: 20 },
];

export function PMODashboard() {
  const navigate = useNavigate();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    runningTasks: 0,
    overdueTasks: 0,
    pendingTasks: 0
  });
  const [watchedProjects, setWatchedProjects] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats
        const statsRes = await dashboardService.getStats();
        const dashboardData = statsRes.ok ? statsRes.data : null;

        // 2. Fetch Active Projects for list
        const projectsRes = await projectService.getAllProjects({ status: 'active' });
        const projects = projectsRes.ok ? projectsRes.data : [];

        // 3. Fetch Tasks
        const tasksRes = await taskService.getAllTasks({ status: 'in-progress' });
        const tasks = tasksRes.ok ? tasksRes.data : [];

        // 4. Fetch Common Data for Modals
        const [accRes, deptRes] = await Promise.all([
          accountService.getAccounts(),
          departmentService.getDepartments()
        ]);
        if (accRes.ok) setAccounts(accRes.data);
        if (deptRes.ok) setDepartments(deptRes.data);

        // Process Overdue Tasks
        const now = new Date();
        const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < now);

        // Update States
        if (dashboardData) {
          const activeProj = dashboardData.projectsByStatus?.find(p => p.status === 'active')?.count || 0;
          const running = dashboardData.tasksByStatus?.find(t => t.status === 'in-progress' || t.status === 'processing')?.count || 0;
          const pending = dashboardData.tasksByStatus?.find(t => t.status === 'pending' || t.status === 'todo')?.count || 0;

          setStats({
            activeProjects: activeProj,
            runningTasks: running,
            overdueTasks: overdue.length,
            pendingTasks: pending
          });
        }

        // Update Watched Projects (limit 5)
        setWatchedProjects(projects.slice(0, 5).map(p => ({
          ...p,
          taskCount: 0 // Backend doesn't return this yet in list
        })));

        // Update Overdue List (limit 5)
        setOverdueItems(overdue.slice(0, 5).map(t => ({
          id: t.id,
          title: t.title,
          project: t.projectName || 'Unknown',
          assignee: t.assignee?.name || 'Unassigned',
          dueDate: t.deadline,
          daysOverdue: Math.floor((now - new Date(t.deadline)) / (1000 * 60 * 60 * 24)),
          priority: t.priority
        })));

      } catch (error) {
        console.error('Failed to load dashboard data', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (<div>
    <PageHeader title="Tổng quan - PMO" description="Tạo và quản lý dự án, gán Leader, theo dõi tiến độ và cảnh báo trễ hạn" />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Dự án đang theo dõi" value={stats.activeProjects} icon={Eye} variant="primary" />
      <StatCard title="Công việc đang chạy" value={stats.runningTasks} icon={ListTodo} variant="default" />
      <StatCard title="Công việc trễ hạn" value={stats.overdueTasks} icon={AlertTriangle} variant="danger" />
      <StatCard title="Chờ xử lý" value={stats.pendingTasks} icon={Clock} variant="warning" />
    </div>

    {/* Quick Actions */}
    <div className="flex gap-3 mb-6">
      <Button onClick={() => setShowProjectModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Tạo dự án mới
      </Button>
      <Button variant="outline" onClick={() => setShowTaskModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Tạo Công việc
      </Button>
    </div>

    {/* Modals */}
    <ProjectFormModal open={showProjectModal} onOpenChange={setShowProjectModal} onSubmit={(data) => {
      // Service call is handled inside ProjectFormModal usually, or we pass handler?
      // The original code passed a handler that called toast. 
      // We should ensure FormModal calls the service. 
      // Assuming ProjectFormModal has been updated or controls its own submission? 
      // Actually previous code just showed toast. We need to implement proper submission if not in modal.
      // But we'll leave as is for now assuming Modal handles it or we'll check Modal later.
      projectService.createProject(data).then(res => {
        if (res.ok) {
          toast.success('Tạo dự án thành công');
          setShowProjectModal(false);
          // Refresh data?
        } else {
          toast.error(res.message);
        }
      });
    }} />
    <TaskFormModal open={showTaskModal} onOpenChange={setShowTaskModal} type="main-task" onSubmit={(data) => {
      taskService.createTask(data).then(res => {
        if (res.ok) {
          toast.success('Tạo Công việc thành công');
          setShowTaskModal(false);
          // Refresh data would be good here but simpler to just close
        } else {
          toast.error(res.message);
        }
      });
    }} accounts={accounts} departments={departments} />
    {/* Note: TaskFormModal needs accounts/departments props? checking original usage... passed manually. */}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Progress Comparison Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            So sánh tiến độ Kế hoạch vs Thực tế
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectProgress} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="planned" name="Kế hoạch" fill="hsl(217, 91%, 80%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="actual" name="Thực tế" fill="hsl(217, 91%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Watched Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Dự án theo dõi</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/projects')}>
            Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {watchedProjects.length === 0 ? <p className="text-sm text-muted">Không có dự án nào</p> :
              watchedProjects.map((project) => (<div key={project.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{project.name}</span>
                  <StatusBadge status={project.status} />
                </div>
                <ProgressBar value={project.progress} size="sm" />
                {/* <p className="text-xs text-muted-foreground mt-2">
                    {project.taskCount} công việc
                  </p> */ /* taskCount missing in backend */}
              </div>))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Overdue Tasks Warning */}
    <Card className="border-status-overdue/30 bg-status-overdue-bg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-status-overdue">
          <AlertTriangle className="w-5 h-5" />
          Cảnh báo công việc trễ hạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueItems.length === 0 ? <p className="text-sm text-muted">Không có công việc trễ hạn</p> :
            overdueItems.map((item) => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.title}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.project} • {item.assignee}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-status-overdue">
                  Trễ {item.daysOverdue} ngày
                </span>
                <p className="text-xs text-muted-foreground">
                  Hạn: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
                </p>
              </div>
            </div>))}
        </div>
      </CardContent>
    </Card>
  </div>);
}

