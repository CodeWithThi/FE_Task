import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderKanban,
  ListTodo,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const projectProgress = [
  { name: 'Chương trình Hè', planned: 80, actual: 75 },
  { name: 'Đào tạo GV', planned: 100, actual: 100 },
  { name: 'CNTT', planned: 60, actual: 45 },
  { name: 'Năm học mới', planned: 40, actual: 20 },
];

const overdueItems = [
  {
    id: '1',
    title: 'Hoàn thành giáo án chương 5',
    project: 'Chương trình Hè 2024',
    assignee: 'Nguyễn Văn A',
    dueDate: '2024-01-08',
    daysOverdue: 3,
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Cập nhật slide bài giảng',
    project: 'Nâng cấp hệ thống CNTT',
    assignee: 'Trần Thị B',
    dueDate: '2024-01-09',
    daysOverdue: 2,
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Báo cáo tiến độ tháng',
    project: 'Đào tạo giáo viên mới',
    assignee: 'Lê Văn C',
    dueDate: '2024-01-10',
    daysOverdue: 1,
    priority: 'high' as const,
  },
];

const watchedProjects = [
  { id: '1', name: 'Chương trình Hè 2024', progress: 75, status: 'in-progress' as const, taskCount: 24 },
  { id: '2', name: 'Nâng cấp hệ thống CNTT', progress: 45, status: 'in-progress' as const, taskCount: 18 },
  { id: '3', name: 'Chuẩn bị năm học mới', progress: 20, status: 'pending' as const, taskCount: 32 },
];

export function PMODashboard() {
  return (
    <div>
      <PageHeader
        title="Tổng quan - PMO"
        description="Theo dõi và điều phối tiến độ các dự án"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Dự án đang theo dõi"
          value={8}
          icon={Eye}
          variant="primary"
        />
        <StatCard
          title="Công việc đang chạy"
          value={42}
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
          title="Chờ phê duyệt"
          value={12}
          icon={Clock}
          variant="warning"
        />
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
            <Button variant="ghost" size="sm" className="text-primary">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {watchedProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{project.name}</span>
                    <StatusBadge status={project.status} />
                  </div>
                  <ProgressBar value={project.progress} size="sm" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {project.taskCount} công việc
                  </p>
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
            {overdueItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border"
              >
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
                    Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
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
