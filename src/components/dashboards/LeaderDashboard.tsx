import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ListTodo,
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Nguyễn Văn A', tasks: 5, completed: 3 },
  { id: '2', name: 'Trần Thị B', tasks: 4, completed: 2 },
  { id: '3', name: 'Lê Văn C', tasks: 6, completed: 4 },
  { id: '4', name: 'Phạm Thị D', tasks: 3, completed: 1 },
];

const pendingApprovals = [
  {
    id: '1',
    title: 'Hoàn thành giáo án chương 3',
    submitter: 'Nguyễn Văn A',
    submittedAt: '2024-01-10T10:30:00',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Cập nhật bài tập thực hành',
    submitter: 'Trần Thị B',
    submittedAt: '2024-01-10T14:15:00',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Báo cáo tuần 2',
    submitter: 'Lê Văn C',
    submittedAt: '2024-01-11T09:00:00',
    priority: 'low' as const,
  },
];

const teamTasks = [
  {
    id: '1',
    title: 'Soạn giáo án bài 15',
    assignee: 'Nguyễn Văn A',
    status: 'in-progress' as const,
    progress: 60,
    deadline: '2024-01-15',
  },
  {
    id: '2',
    title: 'Chuẩn bị đề kiểm tra',
    assignee: 'Trần Thị B',
    status: 'waiting-approval' as const,
    progress: 100,
    deadline: '2024-01-14',
  },
  {
    id: '3',
    title: 'Review tài liệu tham khảo',
    assignee: 'Lê Văn C',
    status: 'pending' as const,
    progress: 0,
    deadline: '2024-01-16',
  },
  {
    id: '4',
    title: 'Họp tổng kết tháng',
    assignee: 'Phạm Thị D',
    status: 'overdue' as const,
    progress: 30,
    deadline: '2024-01-08',
  },
];

export function LeaderDashboard() {
  return (
    <div>
      <PageHeader
        title="Tổng quan - Trưởng nhóm"
        description="Quản lý công việc và nhân sự của đội nhóm"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Nhân sự trong nhóm"
          value={4}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Công việc đội nhóm"
          value={18}
          icon={ListTodo}
          variant="default"
        />
        <StatCard
          title="Chờ duyệt"
          value={3}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Hoàn thành trong tuần"
          value={8}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Nhân sự được phân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.completed}/{member.tasks} công việc hoàn thành
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary">
                      {Math.round((member.completed / member.tasks) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-status-waiting" />
              Công việc chờ duyệt
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-status-waiting-bg/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gửi bởi: {item.submitter} • {new Date(item.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Trả lại
                    </Button>
                    <Button size="sm">
                      Duyệt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Công việc đội nhóm
          </CardTitle>
          <Button variant="outline" size="sm">
            + Tạo công việc mới
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.assignee} • Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="w-32">
                  <ProgressBar value={task.progress} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
