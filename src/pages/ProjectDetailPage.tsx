import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  Users,
  ListTodo,
  Edit,
  Plus,
  Clock,
} from 'lucide-react';

const mockProject = {
  id: '1',
  name: 'Chương trình Hè 2024',
  description: 'Tổ chức các lớp học hè cho học sinh các cấp. Bao gồm các môn Toán, Lý, Hóa, Văn, Anh với mục tiêu củng cố kiến thức và chuẩn bị cho năm học mới.',
  startDate: '2024-05-01',
  endDate: '2024-08-31',
  manager: { id: '1', name: 'Trần Thị B', role: 'leader', department: 'Bộ môn Toán' },
  departments: ['Bộ môn Toán', 'Bộ môn Lý', 'Bộ môn Hóa'],
  status: 'in-progress' as const,
  progress: 75,
};

const mockMainTasks = [
  {
    id: '1',
    title: 'Chuẩn bị giáo án môn Toán',
    assignee: 'Nguyễn Văn A',
    department: 'Bộ môn Toán',
    status: 'in-progress' as const,
    priority: 'high' as const,
    progress: 80,
    deadline: '2024-05-15',
    subtaskCount: 5,
  },
  {
    id: '2',
    title: 'Chuẩn bị giáo án môn Lý',
    assignee: 'Trần Thị B',
    department: 'Bộ môn Lý',
    status: 'completed' as const,
    priority: 'high' as const,
    progress: 100,
    deadline: '2024-05-10',
    subtaskCount: 4,
  },
  {
    id: '3',
    title: 'Thiết kế bài tập thực hành',
    assignee: 'Lê Văn C',
    department: 'Bộ môn Hóa',
    status: 'waiting-approval' as const,
    priority: 'medium' as const,
    progress: 100,
    deadline: '2024-05-20',
    subtaskCount: 3,
  },
  {
    id: '4',
    title: 'Lên lịch giảng dạy',
    assignee: 'Phạm Thị D',
    department: 'Ban điều hành',
    status: 'pending' as const,
    priority: 'low' as const,
    progress: 0,
    deadline: '2024-05-25',
    subtaskCount: 2,
  },
];

const mockMembers = [
  { id: '1', name: 'Trần Thị B', role: 'Quản lý dự án', department: 'Bộ môn Toán', taskCount: 5 },
  { id: '2', name: 'Nguyễn Văn A', role: 'Thành viên', department: 'Bộ môn Toán', taskCount: 8 },
  { id: '3', name: 'Lê Văn C', role: 'Thành viên', department: 'Bộ môn Lý', taskCount: 6 },
  { id: '4', name: 'Phạm Thị D', role: 'Thành viên', department: 'Bộ môn Hóa', taskCount: 4 },
];

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <PageHeader
        title={mockProject.name}
        description={mockProject.description}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Main Task
            </Button>
          </div>
        }
      />

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="text-sm font-medium">
                  {new Date(mockProject.startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(mockProject.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-in-progress-bg">
                <ListTodo className="w-5 h-5 text-status-in-progress" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <StatusBadge status={mockProject.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-completed-bg">
                <Users className="w-5 h-5 text-status-completed" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thành viên</p>
                <p className="text-sm font-medium">{mockMembers.length} người</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Tiến độ tổng quan</p>
            <ProgressBar value={mockProject.progress} />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <ListTodo className="w-4 h-4 mr-2" />
            Main Tasks ({mockMainTasks.length})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Thành viên ({mockMembers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockMainTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.department} • {task.assignee} • {task.subtaskCount} subtasks
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <ProgressBar value={task.progress} size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role} • {member.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.taskCount} công việc</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
