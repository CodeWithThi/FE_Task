import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { FolderKanban, ListTodo, CheckCircle2, AlertTriangle, TrendingUp, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';

const projectStatusLabels = {
  'active': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'on-hold': 'Tạm dừng',
};

const projectStatusStyles = {
  'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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
        const [statsRes, projectsRes] = await Promise.all([
          dashboardService.getStats(),
          projectService.getAllProjects()
        ]);

        if (statsRes.ok) {
          setStats(statsRes.data);
        }

        if (projectsRes.ok) {
          setProjects(projectsRes.data.slice(0, 4)); // Get recent 4 projects
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

  // Prepare chart data from stats
  const tasksByStatus = stats?.tasksByStatus || [];
  const completed = tasksByStatus.find(s => s.status === 'completed')?.count || 0;
  const inProgress = tasksByStatus.find(s => s.status === 'in-progress' || s.status === 'processing')?.count || 0;
  const pending = tasksByStatus.find(s => s.status === 'pending' || s.status === 'todo')?.count || 0;
  const overdue = 0; // Backend doesn't provide this yet

  const statusData = stats ? [
    { name: 'Hoàn thành', value: completed, color: 'hsl(142, 71%, 45%)' },
    { name: 'Đang làm', value: inProgress, color: 'hsl(217, 91%, 50%)' },
    { name: 'Chờ duyệt', value: pending, color: 'hsl(262, 83%, 58%)' },
    { name: 'Trễ hạn', value: overdue, color: 'hsl(0, 84%, 60%)' },
  ] : [];

  const totalTasks = stats?.totalTasks || 0;
  const activeTasks = inProgress;
  const completedTasks = completed;
  const overdueTasks = overdue;
  const totalProjects = stats?.totalProjects || projects.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan - Ban Giám đốc"
        description="Xem tổng quan hoạt động dự án và công việc của trung tâm (chỉ xem, không chỉnh sửa)"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng dự án"
          value={totalProjects}
          icon={FolderKanban}
          variant="primary"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Công việc đang thực hiện"
          value={activeTasks}
          icon={ListTodo}
          variant="default"
          onClick={() => navigate('/tasks?status=in-progress')}
        />
        <StatCard
          title="Công việc trễ hạn"
          value={overdueTasks}
          icon={AlertTriangle}
          variant="danger"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Hoàn thành"
          value={completedTasks}
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/tasks?status=completed')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân bố trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              Dự án gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dự án</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">
                        {project.name}
                      </span>
                      <Badge className={projectStatusStyles[project.status] || projectStatusStyles['active']}>
                        {projectStatusLabels[project.status] || project.status}
                      </Badge>
                    </div>
                    <ProgressBar value={project.progress || 0} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
