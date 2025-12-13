import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Upload,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Building2,
  Paperclip,
  Plus,
} from 'lucide-react';

import { TaskStatus, TaskPriority } from '@/types';

const mockTask: {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  department: string;
  cooperatingDepts: string[];
  assignee: { id: string; name: string; department: string };
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  progress: number;
} = {
  id: '1',
  title: 'Chuẩn bị giáo án môn Toán chương 1-5',
  description: 'Soạn giáo án chi tiết cho 5 chương đầu tiên của chương trình học hè. Bao gồm:\n- Mục tiêu học tập\n- Nội dung bài giảng\n- Bài tập thực hành\n- Đánh giá và kiểm tra',
  projectId: '1',
  projectName: 'Chương trình Hè 2024',
  department: 'Bộ môn Toán',
  cooperatingDepts: ['Bộ môn Lý', 'Phòng đào tạo'],
  assignee: { id: '1', name: 'Nguyễn Văn A', department: 'Bộ môn Toán' },
  priority: 'high',
  status: 'in-progress',
  startDate: '2024-05-01',
  deadline: '2024-05-15',
  progress: 80,
};

const mockSubtasks = [
  { id: '1', title: 'Soạn giáo án chương 1', assignee: 'Nguyễn Văn A', status: 'completed' as const, deadline: '2024-05-03' },
  { id: '2', title: 'Soạn giáo án chương 2', assignee: 'Nguyễn Văn A', status: 'completed' as const, deadline: '2024-05-05' },
  { id: '3', title: 'Soạn giáo án chương 3', assignee: 'Nguyễn Văn A', status: 'completed' as const, deadline: '2024-05-08' },
  { id: '4', title: 'Soạn giáo án chương 4', assignee: 'Nguyễn Văn A', status: 'completed' as const, deadline: '2024-05-10' },
  { id: '5', title: 'Soạn giáo án chương 5', assignee: 'Nguyễn Văn A', status: 'in-progress' as const, deadline: '2024-05-15' },
];

const mockFiles = [
  { id: '1', name: 'Giao_an_chuong_1.docx', size: '256 KB', uploadedAt: '2024-05-03' },
  { id: '2', name: 'Giao_an_chuong_2.docx', size: '312 KB', uploadedAt: '2024-05-05' },
  { id: '3', name: 'Bai_tap_tham_khao.pdf', size: '1.2 MB', uploadedAt: '2024-05-08' },
];

const mockActivityLog = [
  { id: '1', user: 'Nguyễn Văn A', action: 'Cập nhật tiến độ 60% → 80%', time: '2 giờ trước' },
  { id: '2', user: 'Nguyễn Văn A', action: 'Upload file "Giao_an_chuong_4.docx"', time: '1 ngày trước' },
  { id: '3', user: 'Trần Thị B', action: 'Phê duyệt subtask "Soạn giáo án chương 3"', time: '3 ngày trước' },
  { id: '4', user: 'Nguyễn Văn A', action: 'Hoàn thành subtask "Soạn giáo án chương 3"', time: '3 ngày trước' },
  { id: '5', user: 'Admin', action: 'Tạo công việc', time: '14 ngày trước' },
];

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const isStaff = user?.role === 'staff';
  const isLeader = user?.role === 'leader';
  const canApprove = isLeader || user?.role === 'pmo' || user?.role === 'director';

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/tasks')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 70% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{mockTask.title}</h1>
                    <PriorityBadge priority={mockTask.priority} />
                    <StatusBadge status={mockTask.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dự án: {mockTask.projectName}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-2">Mô tả</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {mockTask.description}
                </p>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-3">Tiến độ</h3>
                <ProgressBar value={mockTask.progress} />
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Subtasks ({mockSubtasks.length})</CardTitle>
              {isLeader && (
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm Subtask
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          subtask.status === 'completed'
                            ? 'bg-status-completed border-status-completed'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {subtask.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {subtask.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subtask.assignee} • Hạn: {new Date(subtask.deadline).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={subtask.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                File đính kèm ({mockFiles.length})
              </CardTitle>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  >
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Nhật ký thay đổi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {mockActivityLog.map((log) => (
                  <div key={log.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-sm">{log.user}</span>
                        <span className="text-sm text-muted-foreground"> {log.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 30% */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isStaff && mockTask.status === 'pending' && (
                <>
                  <Button className="w-full" onClick={() => setShowAcceptDialog(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Nhận việc
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowRejectDialog(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                </>
              )}

              {isStaff && mockTask.status === 'in-progress' && (
                <>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Cập nhật tiến độ
                  </Button>
                  <Button className="w-full" onClick={() => setShowSubmitDialog(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi duyệt
                  </Button>
                </>
              )}

              {canApprove && mockTask.status === 'waiting-approval' && (
                <>
                  <Button className="w-full" onClick={() => setShowApproveDialog(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Phê duyệt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowReturnDialog(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Trả lại
                  </Button>
                </>
              )}

              {isLeader && (
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Chuyển giao
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Người phụ trách</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {mockTask.assignee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{mockTask.assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{mockTask.assignee.department}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Bộ phận chính</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{mockTask.department}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Bộ phận phối hợp</p>
                <div className="flex flex-wrap gap-2">
                  {mockTask.cooperatingDepts.map((dept) => (
                    <span key={dept} className="text-xs bg-muted px-2 py-1 rounded">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày bắt đầu</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(mockTask.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-status-overdue" />
                    <span className="text-sm font-medium">{new Date(mockTask.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Xác nhận nhận việc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn nhận công việc này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>Hủy</Button>
            <Button onClick={() => setShowAcceptDialog(false)}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Từ chối phân công</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối công việc này.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => setShowRejectDialog(false)}>Từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Gửi duyệt công việc</DialogTitle>
            <DialogDescription>
              Xác nhận gửi công việc để Leader phê duyệt?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Hủy</Button>
            <Button onClick={() => setShowSubmitDialog(false)}>Gửi duyệt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Phê duyệt công việc</DialogTitle>
            <DialogDescription>
              Xác nhận phê duyệt công việc này đã hoàn thành?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Hủy</Button>
            <Button onClick={() => setShowApproveDialog(false)}>Phê duyệt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Trả lại công việc</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do trả lại công việc.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Lý do trả lại..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => setShowReturnDialog(false)}>Trả lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
