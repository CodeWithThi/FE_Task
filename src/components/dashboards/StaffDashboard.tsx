import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/types';
import { ConfirmActionModal, ActionType } from '@/components/modals/ConfirmActionModal';
import { toast } from 'sonner';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from 'lucide-react';

const myTasks: { id: string; title: string; project: string; status: TaskStatus; priority: 'high' | 'medium' | 'low'; progress: number; deadline: string }[] = [
  {
    id: '1',
    title: 'Soạn giáo án bài 15 - Phương trình bậc 2',
    project: 'Chương trình Hè 2024',
    status: 'in-progress',
    priority: 'high',
    progress: 60,
    deadline: '2024-01-15',
  },
  {
    id: '2',
    title: 'Chuẩn bị slide bài giảng',
    project: 'Chương trình Hè 2024',
    status: 'not-assigned',
    priority: 'medium',
    progress: 0,
    deadline: '2024-01-16',
  },
  {
    id: '3',
    title: 'Review bài tập chương 4',
    project: 'Nâng cấp hệ thống CNTT',
    status: 'waiting-approval',
    priority: 'low',
    progress: 100,
    deadline: '2024-01-14',
  },
];

const upcomingDeadlines = [
  { id: '1', title: 'Hoàn thành đề cương', deadline: '2024-01-12', daysLeft: 1 },
  { id: '2', title: 'Nộp báo cáo tuần', deadline: '2024-01-14', daysLeft: 3 },
  { id: '3', title: 'Cập nhật tiến độ dự án', deadline: '2024-01-15', daysLeft: 4 },
];

const overdueTasks = [
  {
    id: '1',
    title: 'Họp tổng kết tháng',
    deadline: '2024-01-08',
    daysOverdue: 3,
    priority: 'high' as const,
  },
];

export function StaffDashboard() {
  const navigate = useNavigate();
  const [actionModal, setActionModal] = useState<{ open: boolean; type: ActionType; taskTitle: string }>({
    open: false,
    type: 'accept',
    taskTitle: '',
  });

  const handleAction = (type: ActionType, taskTitle: string) => {
    setActionModal({ open: true, type, taskTitle });
  };

  const handleConfirmAction = (reason?: string) => {
    const messages: Record<ActionType, string> = {
      accept: 'Đã nhận việc thành công',
      reject: 'Đã từ chối công việc',
      submit: 'Đã gửi duyệt thành công',
      approve: 'Đã phê duyệt công việc',
      return: 'Đã trả lại công việc',
      transfer: 'Đã chuyển giao công việc',
    };
    toast.success(messages[actionModal.type]);
  };

  return (
    <div>
      <PageHeader
        title="Tổng quan - Công việc của tôi"
        description="Nhận việc, cập nhật tiến độ và gửi trình duyệt"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Công việc của tôi"
          value={5}
          icon={ListTodo}
          variant="primary"
        />
        <StatCard
          title="Sắp đến hạn (3 ngày)"
          value={3}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Trễ hạn"
          value={1}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Hoàn thành tháng này"
          value={12}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        open={actionModal.open}
        onOpenChange={(open) => setActionModal({ ...actionModal, open })}
        actionType={actionModal.type}
        taskTitle={actionModal.taskTitle}
        onConfirm={handleConfirmAction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Warning */}
          {overdueTasks.length > 0 && (
            <Card className="border-status-overdue/30 bg-status-overdue-bg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-overdue">
                  <AlertTriangle className="w-5 h-5" />
                  Công việc trễ hạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-status-overdue/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{task.title}</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <span className="text-sm text-status-overdue font-medium">
                        Trễ {task.daysOverdue} ngày
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                Công việc của tôi
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.project}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <ProgressBar value={task.progress} size="sm" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {task.status === 'in-progress' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline" className="flex-1">
                          Cập nhật tiến độ
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleAction('submit', task.title)}>
                          Gửi duyệt
                        </Button>
                      </div>
                    )}
                    {task.status === 'not-assigned' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" className="flex-1" onClick={() => handleAction('accept', task.title)}>
                          Nhận việc
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAction('reject', task.title)}>
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Sắp đến hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-sm mb-1">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.deadline).toLocaleDateString('vi-VN')}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        item.daysLeft <= 1
                          ? 'text-status-overdue'
                          : item.daysLeft <= 3
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Còn {item.daysLeft} ngày
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
