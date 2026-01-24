import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { StatCard } from '@core/components/common/StatCard';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { toast } from 'sonner';
import { FolderKanban, ListTodo, AlertTriangle, Eye, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '@core/services/dashboardService';
import { projectService } from '@core/services/projectService';
import { taskService } from '@core/services/taskService';
import { accountService } from '@core/services/accountService';
import { departmentService } from '@core/services/departmentService';

export function PMODashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

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

        // 2. Fetch Active Projects
        const projectsRes = await projectService.getAllProjects({ status: 'active' });
        const projects = projectsRes.ok ? projectsRes.data : [];

        // 3. Fetch Active Tasks
        const tasksRes = await taskService.getAllTasks({ isDeleted: false });
        const allTasks = tasksRes.ok ? tasksRes.data : [];

        // 4. Fetch Common Data
        const [accRes, deptRes] = await Promise.all([
          accountService.getAccounts(),
          departmentService.getDepartments()
        ]);
        if (accRes.ok) setAccounts(accRes.data);
        if (deptRes.ok) setDepartments(deptRes.data);

        // --- PROCESS DATA ---
        const now = new Date();

        // A. Overdue Tasks
        const overdue = allTasks.filter(t => {
          if (!t.deadline) return false;
          const isCompleted = ['completed', 'done', 'cancelled'].includes(t.status);
          return !isCompleted && new Date(t.deadline) < now;
        });

        // B. Pending & Running
        const pendingCount = allTasks.filter(t => ['pending', 'not-assigned', 'todo'].includes(t.status || 'not-assigned')).length;
        const runningCount = allTasks.filter(t => ['in-progress', 'processing', 'doing'].includes(t.status)).length;

        // Update Stats State
        if (dashboardData) {
          const activeProj = dashboardData.projectsByStatus?.find(p => p.status === 'active')?.count || 0;

          setStats({
            activeProjects: activeProj,
            runningTasks: runningCount,
            overdueTasks: overdue.length,
            pendingTasks: pendingCount
          });
        }

        // C. Calculate Chart Data (Planned vs Actual)
        const newChartData = projects.map(p => {
          // Planned Progress
          let planned = 0;
          if (p.startDate && p.endDate) {
            const start = new Date(p.startDate).getTime();
            const end = new Date(p.endDate).getTime();
            const total = end - start;
            const elapsed = now.getTime() - start;

            if (total > 0) planned = Math.round((elapsed / total) * 100);
            if (planned < 0) planned = 0;
            if (planned > 100) planned = 100;
          }

          // Actual Progress (from backend included Task status)
          let actual = 0;
          const pTasks = p.Task || p.tasks || [];
          if (pTasks.length > 0) {
            const completed = pTasks.filter(t => ['completed', 'done'].includes(t.Status || t.status)).length;
            actual = Math.round((completed / pTasks.length) * 100);
          }

          return { name: p.name, planned, actual };
        });
        setChartData(newChartData);

        // D. Update Watched Projects
        setWatchedProjects(projects.slice(0, 5).map(p => {
          const pTasks = p.Task || p.tasks || [];
          let progress = 0;
          if (pTasks.length > 0) {
            const completed = pTasks.filter(t => ['completed', 'done'].includes(t.Status || t.status)).length;
            progress = Math.round((completed / pTasks.length) * 100);
          }
          return {
            ...p,
            progress,
            taskCount: pTasks.length
          };
        }));

        // E. Update Overdue List
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

  return (
    <div>
      <PageHeader title="Tổng quan - PMO" description="Tạo và quản lý dự án, gán Leader, theo dõi tiến độ và cảnh báo trễ hạn" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Dự án đang theo dõi" value={stats.activeProjects} icon={Eye} variant="primary" />
        <StatCard title="Công việc đang chạy" value={stats.runningTasks} icon={ListTodo} variant="default" />
        <StatCard title="Công việc trễ hạn" value={stats.overdueTasks} icon={AlertTriangle} variant="danger" />
        <StatCard title="Chờ xử lý" value={stats.pendingTasks} icon={Clock} variant="warning" />
      </div>

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
              <BarChart data={chartData} layout="vertical">
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
                watchedProjects.map((project) => (
                  <div key={project.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{project.name}</span>
                      <StatusBadge status={project.status} />
                    </div>
                    <ProgressBar value={project.progress} size="sm" />
                  </div>
                ))}
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
              overdueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
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
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
