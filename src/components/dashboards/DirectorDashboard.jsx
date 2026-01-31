import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Badge } from '@core/components/ui/badge';
import { LoadingScreen } from '@core/components/common/LoadingScreen';
import { FolderKanban, ListTodo, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Building2, Activity, BarChart3, Users, Clock, Target, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService } from '@core/services/dashboardService';
import { projectService } from '@core/services/projectService';
import { toast } from 'sonner';
import { taskService } from '@core/services/taskService';
import { Button } from '@core/components/ui/button';
import { cn } from '@core/lib/utils';

const projectStatusLabels = {
  'active': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'on-hold': 'Tạm dừng',
};

const projectStatusStyles = {
  'active': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'on-hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// Premium Stat Card Component
function PremiumStatCard({ title, value, icon: Icon, variant = 'default', subtitle, trend, onClick, className }) {
  const variants = {
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20',
      border: 'border-red-200/60 dark:border-red-800/40',
      iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
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
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-100/50 dark:from-purple-950/30 dark:to-violet-900/20',
      border: 'border-purple-200/60 dark:border-purple-800/40',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconShadow: 'shadow-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-700 dark:text-purple-300',
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
        'group',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />

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
              <span>{trend >= 0 ? '+' : ''}{trend}% so với tuần trước</span>
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

// Custom Pie Chart Label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {value}
    </text>
  );
};

export function DirectorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          dashboardService.getStats(),
          projectService.getAllProjects(),
          taskService.getAllTasks({ isDeleted: false })
        ]);

        const allTasks = tasksRes.ok ? tasksRes.data : [];
        const now = new Date();

        // Calculate task statistics
        const overdueCount = allTasks.filter(t => {
          if (!t.deadline) return false;
          const isCompleted = ['completed', 'done', 'cancelled'].includes(t.status);
          return !isCompleted && new Date(t.deadline) < now;
        }).length;

        const inProgressStatuses = ['in-progress', 'in_progress', 'processing', 'doing'];
        const completedStatuses = ['completed', 'done'];
        const pendingStatuses = ['pending', 'not-assigned', 'not_assigned', 'todo', 'review_request', 'waiting-approval'];

        const inProgressCount = allTasks.filter(t => inProgressStatuses.includes(t.status)).length;
        const completedCount = allTasks.filter(t => completedStatuses.includes(t.status)).length;
        const pendingCount = allTasks.filter(t => pendingStatuses.includes(t.status || 'not_assigned')).length;

        if (statsRes.ok) {
          setStats({
            ...statsRes.data,
            overdueTasks: overdueCount,
            inProgressTasks: inProgressCount,
            completedTasks: completedCount,
            pendingTasks: pendingCount
          });
        }

        if (projectsRes.ok) {
          // Calculate progress for each project
          const projectsWithProgress = projectsRes.data.slice(0, 5).map(p => {
            const pTasks = p.Task || p.tasks || [];
            let progress = 0;
            if (pTasks.length > 0) {
              const completed = pTasks.filter(t => completedStatuses.includes(t.Status || t.status)).length;
              progress = Math.round((completed / pTasks.length) * 100);
            }
            return { ...p, progress, taskCount: pTasks.length };
          });
          setProjects(projectsWithProgress);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Prepare chart data
  const overdue = stats?.overdueTasks || 0;
  const inProgress = stats?.inProgressTasks || 0;
  const completed = stats?.completedTasks || 0;
  const pending = stats?.pendingTasks || 0;

  const statusData = [
    { name: 'Trễ hạn', value: overdue, color: '#ef4444' },
    { name: 'Đang làm', value: inProgress, color: '#3b82f6' },
    { name: 'Chờ duyệt', value: pending, color: '#f59e0b' },
    { name: 'Hoàn thành', value: completed, color: '#10b981' },
  ].filter(item => item.value > 0);

  const totalTasks = stats?.totalTasks || (overdue + inProgress + completed + pending);
  const totalProjects = stats?.totalProjects || projects.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Tổng quan - Ban Giám đốc"
        description="Xem tổng quan hoạt động dự án và công việc của trung tâm"
      />

      {/* Stats Grid - Reordered by importance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumStatCard
          title="Công việc trễ hạn"
          value={overdue}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Cần chú ý"
          onClick={() => navigate('/tasks')}
        />
        <PremiumStatCard
          title="Tổng dự án"
          value={totalProjects}
          icon={FolderKanban}
          variant="primary"
          subtitle="Đang quản lý"
          onClick={() => navigate('/projects')}
        />
        <PremiumStatCard
          title="Đang thực hiện"
          value={inProgress}
          icon={Activity}
          variant="warning"
          onClick={() => navigate('/tasks?status=in_progress')}
        />
        <PremiumStatCard
          title="Chờ duyệt"
          value={pending}
          icon={Clock}
          variant="purple"
          onClick={() => navigate('/tasks?status=review_request')}
        />
        <PremiumStatCard
          title="Hoàn thành"
          value={completed}
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/tasks?status=completed')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span>Phân bố trạng thái công việc</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Chưa có dữ liệu công việc
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <FolderKanban className="w-4 h-4 text-white" />
              </div>
              <span>Dự án gần đây</span>
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => navigate('/projects')}>
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dự án</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {project.name}
                      </span>
                      <Badge className={cn('text-xs', projectStatusStyles[project.status] || projectStatusStyles['active'])}>
                        {projectStatusLabels[project.status] || project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={project.progress || 0} size="sm" />
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">{project.progress || 0}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{project.taskCount || 0} công việc</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20">
        <CardContent className="py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalProjects}</p>
              <p className="text-sm text-muted-foreground">Tổng dự án</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalTasks}</p>
              <p className="text-sm text-muted-foreground">Tổng công việc</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className={cn(
                'text-3xl font-bold',
                overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {overdue}
              </p>
              <p className="text-sm text-muted-foreground">Trễ hạn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
