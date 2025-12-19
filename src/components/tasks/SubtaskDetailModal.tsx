import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { SubtaskCardData } from './SubtaskCard';
import { toast } from 'sonner';
import {
  Calendar,
  Paperclip,
  Link2,
  Upload,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Trash2,
  Plus,
  Building2,
  User,
  X,
} from 'lucide-react';

interface SubtaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: SubtaskCardData | null;
}

// Mock data
const mockAttachments = [
  { id: '1', name: 'Giao_an_chuong_1.docx', size: '256 KB' },
  { id: '2', name: 'Tai_lieu_tham_khao.pdf', size: '1.2 MB' },
];

const mockLinks = [
  { id: '1', title: 'Google Docs - Nội dung bài giảng', url: 'https://docs.google.com/...' },
  { id: '2', title: 'Drive - Thư mục tài liệu', url: 'https://drive.google.com/...' },
];

const mockChecklist = [
  { id: '1', text: 'Soạn phần lý thuyết', completed: true },
  { id: '2', text: 'Tạo bài tập mẫu', completed: true },
  { id: '3', text: 'Thiết kế slide', completed: false },
  { id: '4', text: 'Review và chỉnh sửa', completed: false },
];

const mockActivityLog = [
  { id: '1', user: 'Hoàng Văn Nhân Viên', action: 'Cập nhật tiến độ 60% → 80%', time: '2 giờ trước' },
  { id: '2', user: 'Hoàng Văn Nhân Viên', action: 'Upload file "Giao_an_chuong_1.docx"', time: '1 ngày trước' },
  { id: '3', user: 'Phạm Thị Leader', action: 'Giao việc cho Hoàng Văn Nhân Viên', time: '3 ngày trước' },
];

export function SubtaskDetailModal({ open, onOpenChange, task }: SubtaskDetailModalProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(task?.progress || 0);
  const [newComment, setNewComment] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [checklist, setChecklist] = useState(mockChecklist);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  if (!task) return null;

  const isStaff = user?.role === 'staff';
  const isLeader = user?.role === 'leader';
  const canEdit = isStaff && (task.status === 'not-assigned' || task.status === 'in-progress' || task.status === 'returned');
  const canApprove = isLeader && task.status === 'waiting-approval';

  const handleUpdateProgress = () => {
    toast.success(`Đã cập nhật tiến độ: ${progress}%`);
  };

  const handleSubmitForApproval = () => {
    toast.success('Đã gửi duyệt!');
  };

  const handleApprove = () => {
    toast.success('Đã phê duyệt công việc!');
    onOpenChange(false);
  };

  const handleReturn = () => {
    if (!returnReason.trim()) {
      toast.error('Vui lòng nhập lý do trả lại!');
      return;
    }
    toast.info('Đã trả lại công việc');
    setShowReturnDialog(false);
    setReturnReason('');
    onOpenChange(false);
  };

  const handleAddLink = () => {
    if (newLinkTitle && newLinkUrl) {
      toast.success('Đã thêm liên kết!');
      setNewLinkTitle('');
      setNewLinkUrl('');
      setShowAddLink(false);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedChecklistCount = checklist.filter(item => item.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl pr-8">{task.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content - 2 Column Layout (Trello-style) */}
        <div className="flex flex-col md:flex-row max-h-[calc(90vh-100px)] overflow-hidden">
          {/* CỘT TRÁI - Nội dung */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r">
            {/* Mô tả chi tiết */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Mô tả chi tiết</Label>
              {canEdit ? (
                <Textarea
                  placeholder="Thêm mô tả chi tiết..."
                  defaultValue={task.description}
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {task.description || 'Chưa có mô tả'}
                </p>
              )}
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Checklist ({completedChecklistCount}/{checklist.length})
                </Label>
                {canEdit && (
                  <Button size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Thêm
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => canEdit && toggleChecklistItem(item.id)}
                      disabled={!canEdit}
                    />
                    <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* File đính kèm */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  File đính kèm ({mockAttachments.length})
                </Label>
                {canEdit && (
                  <Button size="sm" variant="outline">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {mockAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 group"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    {canEdit && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Liên kết */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Liên kết ({mockLinks.length})
                </Label>
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => setShowAddLink(!showAddLink)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Thêm
                  </Button>
                )}
              </div>

              {showAddLink && (
                <div className="space-y-2 mb-3 p-3 bg-muted/50 rounded-lg">
                  <Input
                    placeholder="Tiêu đề"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddLink}>Lưu</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddLink(false)}>Hủy</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {mockLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 group"
                  >
                    <ExternalLink className="w-5 h-5 text-primary" />
                    <span className="text-sm group-hover:underline">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>

            <Separator />

            {/* Hoạt động / Bình luận */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" />
                Hoạt động
              </Label>

              {/* Thêm bình luận */}
              <div className="flex gap-2 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button size="sm" disabled={!newComment.trim()}>Gửi</Button>
                </div>
              </div>

              {/* Dòng thời gian */}
              <div className="space-y-3">
                {mockActivityLog.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{log.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">{log.user}</span>
                        <span className="text-muted-foreground"> {log.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - Thông tin & Hành động */}
          <div className="w-full md:w-72 p-6 bg-muted/30 space-y-4">
            {/* Trạng thái */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Trạng thái</Label>
              <div className="mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>

            {/* Độ ưu tiên */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Độ ưu tiên</Label>
              <div className="mt-1">
                <PriorityBadge priority={task.priority} />
              </div>
            </div>

            {/* Người thực hiện */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <User className="w-3 h-3" />
                Người thực hiện
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {task.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.assignee.name}</span>
              </div>
            </div>

            {/* Phòng ban */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Phòng ban
              </Label>
              <p className="text-sm mt-1">{task.department || 'Chưa có phòng ban'}</p>
            </div>

            {/* Thời hạn */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Thời hạn
              </Label>
              <p className="text-sm mt-1">
                {new Date(task.deadline).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>

            <Separator />

            {/* Tiến độ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tiến độ</Label>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              {canEdit && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full"
                  />
                  <Button size="sm" className="w-full" variant="outline" onClick={handleUpdateProgress}>
                    Cập nhật tiến độ
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Hành động theo vai trò */}
            <div className="space-y-2">
              {/* Nhân viên: Gửi duyệt */}
              {isStaff && (task.status === 'in-progress' || task.status === 'returned') && (
                <Button className="w-full" onClick={handleSubmitForApproval}>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi duyệt
                </Button>
              )}

              {/* Trưởng nhóm: Duyệt / Trả lại */}
              {canApprove && (
                <>
                  <Button className="w-full" onClick={handleApprove}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Phê duyệt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowReturnDialog(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Trả lại
                  </Button>
                </>
              )}

              {!canEdit && !canApprove && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Bạn chỉ có quyền xem công việc này
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dialog trả lại - BẮT BUỘC nhập lý do */}
        {showReturnDialog && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-6">
            <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">Trả lại công việc</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng nhập lý do trả lại công việc này.
              </p>
              <Textarea
                placeholder="Nhập lý do..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleReturn}>
                  Xác nhận trả lại
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
