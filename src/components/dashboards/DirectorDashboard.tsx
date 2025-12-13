import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const departmentData = [
  { name: 'Toán', tasks: 24, completed: 18 },
  { name: 'Lý', tasks: 18, completed: 12 },
  { name: 'Hóa', tasks: 15, completed: 10 },
  { name: 'Văn', tasks: 20, completed: 16 },
  { name: 'Anh', tasks: 22, completed: 19 },
];

const statusData = [
  { name: 'Hoàn thành', value: 45, color: 'hsl(142, 71%, 45%)' },
  { name: 'Đang làm', value: 30, color: 'hsl(217, 91%, 50%)' },
  { name: 'Chờ duyệt', value: 15, color: 'hsl(262, 83%, 58%)' },
  { name: 'Trễ hạn', value: 10, color: 'hsl(0, 84%, 60%)' },
];

const progressData = [
  { month: 'T1', progress: 65 },
  { month: 'T2', progress: 72 },
  { month: 'T3', progress: 68 },
  { month: 'T4', progress: 85 },
  { month: 'T5', progress: 78 },
  { month: 'T6', progress: 82 },
];

// Project status for Director Dashboard
type ProjectStatus = 'active' | 'completed' | 'on-hold';

const projectStatusLabels: Record<ProjectStatus, string> = {
  'active': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'on-hold': 'Tạm dừng',
};

const projectStatusStyles: Record<ProjectStatus, string> = {
  'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const recentProjects: { id: string; name: string; progress: number; status: ProjectStatus }[] = [
  { id: '1', name: 'Chương trình Hè 2024', progress: 75, status: 'active' },
  { id: '2', name: 'Đào tạo giáo viên mới', progress: 100, status: 'completed' },
  { id: '3', name: 'Nâng cấp hệ thống CNTT', progress: 45, status: 'active' },
  { id: '4', name: 'Chuẩn bị năm học mới', progress: 20, status: 'on-hold' },
];

export function DirectorDashboard() {
  return (
    <div>
      <PageHeader
        title="Tổng quan - Ban Giám đốc"
        description="Xem tổng quan hoạt động dự án và công việc của trung tâm (chỉ xem, không chỉnh sửa)"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tổng dự án"
          value={12}
          icon={FolderKanban}
          variant="primary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Công việc đang thực hiện"
          value={48}
          icon={ListTodo}
          variant="default"
        />
        <StatCard
          title="Công việc trễ hạn"
          value={5}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Hoàn thành trong tuần"
          value={23}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar Chart - Department Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Hiệu suất theo Bộ môn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" name="Tổng công việc" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Hoàn thành" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân bố trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Progress Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Xu hướng tiến độ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="progress"
                  name="Tiến độ (%)"
                  stroke="hsl(217, 91%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(217, 91%, 50%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {project.name}
                    </span>
                    <Badge className={projectStatusStyles[project.status]}>
                      {projectStatusLabels[project.status]}
                    </Badge>
                  </div>
                  <ProgressBar value={project.progress} size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
