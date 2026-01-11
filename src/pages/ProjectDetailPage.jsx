import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Users, ListTodo, Edit, Plus, Clock, } from 'lucide-react';
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
const mockProject = {
    id: '1',
    name: 'Chương trình Hè 2024',
    description: 'Tổ chức các lớp học hè cho học sinh các cấp. Bao gồm các môn Toán, Lý, Hóa, Văn, Anh với mục tiêu củng cố kiến thức và chuẩn bị cho năm học mới.',
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    manager: { id: '1', name: 'Lê Văn PMO', role: 'pmo', department: 'Phòng Điều phối' },
    departments: ['Bộ môn Toán', 'Bộ môn Lý', 'Bộ môn Hóa'],
    status: 'active',
    progress: 75,
};
const mockMainTasks = [
    {
        id: '1',
        title: 'Chuẩn bị giáo án môn Toán',
        leader: 'Phạm Thị Leader',
        department: 'Bộ môn Toán',
        status: 'in-progress',
        priority: 'high',
        progress: 80,
        deadline: '2024-05-15',
        subtaskCount: 5,
    },
    {
        id: '2',
        title: 'Chuẩn bị giáo án môn Lý',
        leader: 'Phạm Thị Leader',
        department: 'Bộ môn Lý',
        status: 'completed',
        priority: 'high',
        progress: 100,
        deadline: '2024-05-10',
        subtaskCount: 4,
    },
    {
        id: '3',
        title: 'Thiết kế bài tập thực hành',
        leader: 'Phạm Thị Leader',
        department: 'Bộ môn Hóa',
        status: 'waiting-approval',
        priority: 'medium',
        progress: 100,
        deadline: '2024-05-20',
        subtaskCount: 3,
    },
    {
        id: '4',
        title: 'Lên lịch giảng dạy',
        leader: 'Phạm Thị Leader',
        department: 'Phòng Điều phối',
        status: 'not-assigned',
        priority: 'low',
        progress: 0,
        deadline: '2024-05-25',
        subtaskCount: 2,
    },
];
const mockMembers = [
    { id: '1', name: 'Lê Văn PMO', role: 'Quản lý dự án', department: 'Phòng Điều phối', taskCount: 0 },
    { id: '2', name: 'Phạm Thị Leader', role: 'Trưởng nhóm', department: 'Bộ môn Toán', taskCount: 8 },
    { id: '3', name: 'Hoàng Văn Nhân Viên', role: 'Nhân viên', department: 'Bộ môn Toán', taskCount: 6 },
    { id: '4', name: 'Nguyễn Thị Staff', role: 'Nhân viên', department: 'Bộ môn Lý', taskCount: 4 },
];
export default function ProjectDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const permissions = usePermissions();
    return (<div>
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/projects')}>
        <ArrowLeft className="w-4 h-4 mr-2"/>
        Quay lại danh sách
      </Button>

      <PageHeader title={mockProject.name} description={mockProject.description} actions={<div className="flex gap-2">
            {permissions?.canEditProject && (<Button variant="outline">
                <Edit className="w-4 h-4 mr-2"/>
                Chỉnh sửa
              </Button>)}
            {permissions?.canCreateMainTask && (<Button>
                <Plus className="w-4 h-4 mr-2"/>
                Thêm Main Task
              </Button>)}
          </div>}/>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary"/>
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
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge className={projectStatusStyles[mockProject.status]}>
                  {projectStatusLabels[mockProject.status]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400"/>
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
            <ProgressBar value={mockProject.progress}/>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <ListTodo className="w-4 h-4 mr-2"/>
            Main Tasks ({mockMainTasks.length})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2"/>
            Thành viên ({mockMembers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockMainTasks.map((task) => (<div key={task.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                          <PriorityBadge priority={task.priority}/>
                          <StatusBadge status={task.status}/>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.department} • {task.leader} • {task.subtaskCount} subtasks
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4"/>
                          {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <ProgressBar value={task.progress} size="sm"/>
                  </div>))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockMembers.map((member) => (<div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
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
                  </div>))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}
