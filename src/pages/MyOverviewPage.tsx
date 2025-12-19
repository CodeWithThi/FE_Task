import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SubtaskCardData } from '@/components/tasks/SubtaskCard';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import {
  Kanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from 'lucide-react';

// Mock data - công việc của tôi
const mockMyTasks: SubtaskCardData[] = [
  {
    id: '3',
    title: 'Soạn giáo án chương 3 - Giải tích',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-05-08',
    progress: 60,
  },
  {
    id: '6',
    title: 'Rà soát nội dung chương 1',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'returned',
    priority: 'high',
    deadline: '2024-05-06',
    progress: 80,
  },
  {
    id: '7',
    title: 'Upload tài liệu tham khảo',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    department: 'Bộ môn Toán',
    status: 'in-progress',
    priority: 'low',
    deadline: '2024-05-12',
    progress: 30,
  },
];

const mockUpcomingTasks: SubtaskCardData[] = [
  {
    id: '4',
    title: 'Thiết kế bài tập thực hành',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    department: 'Bộ môn Toán',
    status: 'waiting-approval',
    priority: 'medium',
    deadline: '2024-05-10',
    progress: 100,
  },
];

const mockOverdueTasks: SubtaskCardData[] = [
  {
    id: '6',
    title: 'Rà soát nội dung chương 1',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'returned',
    priority: 'high',
    deadline: '2024-05-06',
    progress: 80,
  },
];

export default function MyOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<SubtaskCardData | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleTaskClick = (task: SubtaskCardData) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const TaskItem = ({ task }: { task: SubtaskCardData }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
    
    return (
      <div
        onClick={() => handleTaskClick(task)}
        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {task.assignee.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {task.title}
          </p>
          <p className="text-xs text-muted-foreground">{task.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Calendar className="w-3 h-3" />
            {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {user?.name.split(' ').slice(-1)}!</h1>
          <p className="text-muted-foreground">Tổng quan công việc của bạn</p>
        </div>
        <Button onClick={() => navigate('/tasks-board')}>
          <Kanban className="w-4 h-4 mr-2" />
          Vào bảng công việc
        </Button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMyTasks.length}</p>
                <p className="text-sm text-muted-foreground">Đang thực hiện</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUpcomingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Sắp đến hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOverdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Trễ hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Công việc đang làm */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Công việc đang thực hiện
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tasks-board')}>
            Xem tất cả
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockMyTasks.length > 0 ? (
            mockMyTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không có công việc nào đang thực hiện</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sắp đến hạn */}
      {mockUpcomingTasks.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Sắp đến hạn (trong 3 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockUpcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </CardContent>
        </Card>
      )}

      {/* Trễ hạn */}
      {mockOverdueTasks.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Trễ hạn - Cần xử lý ngay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockOverdueTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </CardContent>
        </Card>
      )}

      {/* Chi tiết thẻ */}
      <SubtaskDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        task={selectedTask}
      />
    </div>
  );
}
