import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { toast } from 'sonner';
import { FolderKanban, ListTodo, AlertTriangle, Eye, Clock, ArrowRight, Loader2, TrendingUp, TrendingDown, Activity, Target, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { dashboardService } from '@core/services/dashboardService';
import { projectService } from '@core/services/projectService';
import { taskService } from '@core/services/taskService';
import { accountService } from '@core/services/accountService';
import { departmentService } from '@core/services/departmentService';
import { cn } from '@core/lib/utils';

// Premium Stat Card Component
function PremiumStatCard({ title, value, icon: Icon, variant = 'default', subtitle, trend, onClick }) {
  const variants = {
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20',
      border: 'border-red-200/60 dark:border-red-800/40',
      iconBg: 'bg-red-500',
      iconShadow: 'shadow-red-500/30',
      textColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-700 dark:text-red-300',
    },
    primary: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-900/20',
      border: 'border-blue-200/60 dark:border-blue-800/40',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconShadow: 'shadow-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-700 dark:text-blue-300',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-900/20',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconShadow: 'shadow-amber-500/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-300',
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950/30 dark:to-green-900/20',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      iconShadow: 'shadow-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-300',
    },
    default: {
      bg: 'bg-gradient-to-br from-slate-50 to-gray-100/50 dark:from-slate-950/30 dark:to-gray-900/20',
      border: 'border-slate-200/60 dark:border-slate-800/40',
      iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
      iconShadow: 'shadow-slate-500/30',
      textColor: 'text-slate-600 dark:text-slate-400',
      valueColor: 'text-slate-700 dark:text-slate-300',
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-300',
        style.bg,
        style.border,
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
        'group'
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn('text-sm font-medium', style.textColor)}>{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', style.valueColor)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(trend)}% so với tuần trước</span>
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-3 shadow-lg transition-transform group-hover:scale-110',
          style.iconBg,
          style.iconShadow
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function PMODashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const [stats, setStats] = useState({
    activeProjects: 0,
    runningTasks: 0,
    overdueTasks: 0,
    pendingTasks: 0,
    completedTasks: 0
  });

  const [watchedProjects, setWatchedProjects] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await dashboardService.getStats();
        const dashboardData = statsRes.ok ? statsRes.data : null;

        const projectsRes = await projectService.getAllProjects({ status: 'active' });
        const projects = projectsRes.ok ? projectsRes.data : [];

        const tasksRes = await taskService.getAllTasks({ isDeleted: false });
        const allTasks = tasksRes.ok ? tasksRes.data : [];

        const now = new Date();

        // Calculate task stats
        const overdue = allTasks.filter(t => {
          if (!t.deadline) return false;
          const isCompleted = ['completed', 'done', 'cancelled'].includes(t.status);
          return !isCompleted && new Date(t.deadline) < now;
        });

        const pendingStatuses = ['pending', 'not-assigned', 'not_assigned', 'todo'];
        const runningStatuses = ['in-progress', 'in_progress', 'processing', 'doing'];
        const completedStatuses = ['completed', 'done'];

        const pendingCount = allTasks.filter(t => pendingStatuses.includes(t.status || 'not_assigned')).length;
        const runningCount = allTasks.filter(t => runningStatuses.includes(t.status)).length;
        const completedCount = allTasks.filter(t => completedStatuses.includes(t.status)).length;

        if (dashboardData) {
          const activeProj = dashboardData.projectsByStatus?.find(p => p.status === 'active')?.count || projects.length;

          setStats({
            activeProjects: activeProj,
            runningTasks: runningCount,
            overdueTasks: overdue.length,
            pendingTasks: pendingCount,
            completedTasks: completedCount
          });
        }

        // Chart data with better colors - store fullName for tooltip
        const newChartData = projects.slice(0, 5).map(p => {
          let planned = 0;
          if (p.startDate && p.endDate) {
            const start = new Date(p.startDate).getTime();
            const end = new Date(p.endDate).getTime();
            const total = end - start;
            const elapsed = now.getTime() - start;
            if (total > 0) planned = Math.round((elapsed / total) * 100);
            planned = Math.max(0, Math.min(100, planned));
          }

          let actual = 0;
          const pTasks = p.Task || p.tasks || [];
          if (pTasks.length > 0) {
            const completed = pTasks.filter(t => ['completed', 'done'].includes(t.Status || t.status)).length;
            actual = Math.round((completed / pTasks.length) * 100);
          }

          // Store full name for tooltip, abbreviated for Y-axis
          const fullName = p.name || 'Dự án';
          const shortName = fullName.length > 12 ? fullName.slice(0, 12) + '...' : fullName;

          return { name: shortName, fullName, planned, actual };
        });
        setChartData(newChartData);

        // Watched projects
        setWatchedProjects(projects.slice(0, 5).map(p => {
          const pTasks = p.Task || p.tasks || [];
          let progress = 0;
          if (pTasks.length > 0) {
            const completed = pTasks.filter(t => ['completed', 'done'].includes(t.Status || t.status)).length;
            progress = Math.round((completed / pTasks.length) * 100);
          }
          return { ...p, progress, taskCount: pTasks.length };
        }));

        // Overdue items
        setOverdueItems(overdue.slice(0, 5).map(t => ({
          id: t.id,
          title: t.title,
          project: t.projectName || 'Unknown',
          assignee: t.assignee?.name || 'Chưa phân công',
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
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const chartColors = {
    planned: '#93c5fd',
    actual: '#3b82f6'
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Tổng quan - PMO"
        description="Quản lý dự án, theo dõi tiến độ và xử lý cảnh báo trễ hạn"
      />

      {/* Stats Grid - Reordered by importance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumStatCard
          title="Công việc trễ hạn"
          value={stats.overdueTasks}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Cần xử lý ngay"
          onClick={() => navigate('/tasks?status=overdue')}
        />
        <PremiumStatCard
          title="Dự án đang theo dõi"
          value={stats.activeProjects}
          icon={Eye}
          variant="primary"
          subtitle="Đang hoạt động"
          onClick={() => navigate('/projects')}
        />
        <PremiumStatCard
          title="Công việc đang chạy"
          value={stats.runningTasks}
          icon={Activity}
          variant="warning"
          onClick={() => navigate('/tasks?status=in_progress')}
        />
        <PremiumStatCard
          title="Chờ xử lý"
          value={stats.pendingTasks}
          icon={Clock}
          variant="default"
          onClick={() => navigate('/tasks?status=not_assigned')}
        />
        <PremiumStatCard
          title="Hoàn thành"
          value={stats.completedTasks}
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/tasks?status=completed')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Comparison Chart */}
        <Card className="lg:col-span-2 shadow-sm border-0 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span>So sánh tiến độ Kế hoạch vs Thực tế</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Chưa có dữ liệu dự án
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      padding: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value, name) => [`${value}%`, name]}
                    labelFormatter={(label, payload) => {
                      // Show full name in tooltip
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="planned" name="Kế hoạch" fill={chartColors.planned} radius={[0, 6, 6, 0]} />
                  <Bar dataKey="actual" name="Thực tế" fill={chartColors.actual} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Watched Projects */}
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <FolderKanban className="w-4 h-4 text-white" />
              </div>
              <span>Dự án theo dõi</span>
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => navigate('/projects')}>
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {watchedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Không có dự án nào</p>
              ) : (
                watchedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium truncate max-w-[150px]">{project.name}</span>
                      <span className="text-xs font-semibold text-primary">{project.progress}%</span>
                    </div>
                    <ProgressBar value={project.progress} size="sm" />
                    <p className="text-xs text-muted-foreground mt-2">{project.taskCount} công việc</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Warning */}
      {overdueItems.length > 0 && (
        <Card className="border-red-200/50 dark:border-red-800/30 bg-gradient-to-r from-red-50/80 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <span>Cảnh báo công việc trễ hạn ({overdueItems.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 border border-red-100 dark:border-red-900/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/tasks/${item.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.project} • {item.assignee}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                      Trễ {item.daysOverdue} ngày
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hạn: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No overdue message */}
      {overdueItems.length === 0 && (
        <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50/80 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/10 shadow-sm">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium">Không có công việc trễ hạn. Tuyệt vời!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
