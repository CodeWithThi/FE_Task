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
import { useAuth, usePermissions } from '@/contexts/AuthContext';
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
} from 'lucide-react';

interface SubtaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtask: SubtaskCardData | null;
}

// Mock data
const mockAttachments = [
  { id: '1', name: 'Giao_an_chuong_1.docx', size: '256 KB', type: 'file' },
  { id: '2', name: 'Tai_lieu_tham_khao.pdf', size: '1.2 MB', type: 'file' },
];

const mockLinks = [
  { id: '1', title: 'Google Docs - Nội dung bài giảng', url: 'https://docs.google.com/...' },
  { id: '2', title: 'Drive - Thư mục tài liệu', url: 'https://drive.google.com/...' },
];

const mockActivityLog = [
  { id: '1', user: 'Hoàng Văn Nhân Viên', action: 'Cập nhật tiến độ 60% → 80%', time: '2 giờ trước' },
  { id: '2', user: 'Hoàng Văn Nhân Viên', action: 'Upload file "Giao_an_chuong_1.docx"', time: '1 ngày trước' },
  { id: '3', user: 'Phạm Thị Leader', action: 'Giao việc cho Hoàng Văn Nhân Viên', time: '3 ngày trước' },
];

export function SubtaskDetailModal({ open, onOpenChange, subtask }: SubtaskDetailModalProps) {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [progress, setProgress] = useState(subtask?.progress || 0);
  const [newComment, setNewComment] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);

  if (!subtask) return null;

  const isStaff = user?.role === 'staff';
  const isLeader = user?.role === 'leader';
  const canEdit = isStaff && (subtask.status === 'not-assigned' || subtask.status === 'in-progress');
  const canApprove = isLeader && subtask.status === 'waiting-approval';

  const handleUpdateProgress = () => {
    toast.success(`Đã cập nhật tiến độ: ${progress}%`);
  };

  const handleSubmitForApproval = () => {
    toast.success('Đã gửi trình duyệt!');
  };

  const handleApprove = () => {
    toast.success('Đã phê duyệt công việc!');
    onOpenChange(false);
  };

  const handleReturn = () => {
    toast.info('Đã trả lại công việc');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg mb-2">{subtask.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <StatusBadge status={subtask.status} />
                <PriorityBadge priority={subtask.priority} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {subtask.description && (
            <div>
              <Label className="text-muted-foreground">Mô tả</Label>
              <p className="mt-1 text-sm">{subtask.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Người thực hiện</Label>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {subtask.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{subtask.assignee.name}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Deadline</Label>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {new Date(subtask.deadline).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          <Separator />

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tiến độ</Label>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
            {canEdit && (
              <div className="flex items-center gap-2 mt-3">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleUpdateProgress}>
                  Cập nhật
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                File đính kèm
              </Label>
              {canEdit && (
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {mockAttachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                  {canEdit && (
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Liên kết
              </Label>
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => setShowAddLink(!showAddLink)}>
                  <Plus className="w-4 h-4 mr-1" />
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

          {/* Activity Log */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Nhật ký hoạt động
            </Label>
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
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <Label className="mb-3 block">Ghi chú / Bình luận</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Thêm ghi chú..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button size="sm" className="self-end">
                Gửi
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {isStaff && subtask.status === 'in-progress' && (
              <Button className="flex-1" onClick={handleSubmitForApproval}>
                <Send className="w-4 h-4 mr-2" />
                Gửi duyệt
              </Button>
            )}
            
            {canApprove && (
              <>
                <Button className="flex-1" onClick={handleApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleReturn}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Trả lại
                </Button>
              </>
            )}
            
            {!canEdit && !canApprove && (
              <p className="text-sm text-muted-foreground text-center w-full py-2">
                Bạn chỉ có quyền xem công việc này
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
