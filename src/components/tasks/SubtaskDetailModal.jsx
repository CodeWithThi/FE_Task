import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@core/components/ui/dialog';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Textarea } from '@core/components/ui/textarea';
import { Separator } from '@core/components/ui/separator';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { Checkbox } from '@core/components/ui/checkbox';
import { useAuth } from '@core/contexts/AuthContext';
import { toast } from 'sonner';
import { Calendar, Paperclip, Link2, Upload, Send, CheckCircle2, XCircle, Clock, FileText, ExternalLink, Trash2, Plus, Building2, User, X, } from 'lucide-react';
import { taskService } from '@core/services/taskService';
export function SubtaskDetailModal({ open, onOpenChange, task, accounts = [], onTaskUpdate }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(task?.progress || 0);
  const [newComment, setNewComment] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [currentAssignee, setCurrentAssignee] = useState(null);

  // Initialize assignee when task changes
  useEffect(() => {
    if (task?.assignee) {
      setCurrentAssignee({
        id: task.assignee.id,
        name: task.assignee.name,
        department: task.assignee.department
      });
    } else {
      setCurrentAssignee({ id: '', name: 'Chưa gán' });
    }
  }, [task]);
  if (!task)
    return null;
  const isStaff = user?.role === 'staff';
  const isLeader = user?.role === 'leader';
  const canEdit = isStaff && (task.status === 'not-assigned' || task.status === 'in-progress' || task.status === 'returned');
  const canApprove = isLeader && task.status === 'waiting-approval';
  const canAssign = isLeader; // Leader có thể gán/đổi người thực hiện
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
  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  const handleAssigneeChange = async (staff) => {
    try {
      const response = await taskService.updateTask(task.id, { assigneeId: staff.id });
      if (response.ok) {
        setCurrentAssignee(staff);
        setShowAssigneeDropdown(false);
        toast.success(`Đã gán công việc cho ${staff.name}`);
        // Refresh task list
        if (onTaskUpdate) {
          onTaskUpdate(task.projectId);
        }
      } else {
        toast.error(response.message || 'Gán việc thất bại');
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error('Lỗi khi gán việc');
    }
  };
  const completedChecklistCount = checklist.filter(item => item.completed).length;
  return (<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 bg-card">
      {/* Header */}
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-xl">{task.title}</DialogTitle>
      </DialogHeader>

      {/* Content - 2 Column Layout (Trello-style) */}
      <div className="flex flex-col md:flex-row max-h-[calc(90vh-100px)] overflow-hidden">
        {/* CỘT TRÁI - Nội dung */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r">
          {/* Mô tả chi tiết */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Mô tả chi tiết</Label>
            {canEdit ? (<Textarea placeholder="Thêm mô tả chi tiết..." defaultValue={task.description} rows={4} className="resize-none" />) : (<p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              {task.description || 'Chưa có mô tả'}
            </p>)}
          </div>

          {/* Checklist - Hidden (not yet implemented) */}
          {false && (<div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Checklist (0/0)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">Tính năng checklist sẽ sớm được bổ sung</p>
          </div>)}

          <Separator />

          {/* File đính kèm - Hidden (not yet implemented) */}
          {false && (<div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                File đính kèm (0)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">Tính năng đính kèm file sẽ sớm được bổ sung</p>
          </div>)}

          {/* Liên kết - Hidden (not yet implemented) */}
          {false && (<div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Liên kết (0)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">Tính năng liên kết sẽ sớm được bổ sung</p>
          </div>)}

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
                <Input placeholder="Thêm bình luận..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <Button size="sm" disabled={!newComment.trim()}>Gửi</Button>
              </div>
            </div>

            {/* Dòng thời gian - Placeholder */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có hoạt động nào</p>
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

          {/* Người thực hiện - Leader có thể gán/đổi */}
          <div className="relative">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <User className="w-3 h-3" />
              Người thực hiện
            </Label>
            <div className={`mt-1 flex items-center gap-2 p-2 rounded-lg ${canAssign ? 'hover:bg-muted cursor-pointer border border-transparent hover:border-border' : ''}`} onClick={() => canAssign && setShowAssigneeDropdown(!showAssigneeDropdown)}>
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {currentAssignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1">{currentAssignee.name}</span>
              {canAssign && (<span className="text-xs text-muted-foreground">Đổi</span>)}
            </div>

            {/* Dropdown chọn người thực hiện */}
            {showAssigneeDropdown && canAssign && (() => {
              // Filter staff: same department as task
              const taskDeptId = task.departmentId;
              const availableStaff = accounts.filter(acc =>
                acc.departmentId === taskDeptId &&
                acc.status === 'active' &&
                (acc.role === 'staff' || acc.role?.toLowerCase().includes('nhân viên'))
              );

              return (<div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10 overflow-hidden max-h-64 overflow-y-auto">
                <div className="p-2 text-xs text-muted-foreground border-b">Chọn người thực hiện</div>
                {availableStaff.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">Không có nhân viên nào trong phòng ban này</div>
                ) : (
                  availableStaff.map((staff) => (<div key={staff.id} onClick={() => handleAssigneeChange(staff)} className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {staff.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.department || task.departmentName}</p>
                    </div>
                  </div>))
                )}
              </div>);
            })()}
          </div>

          {/* Phòng ban */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Phòng ban
            </Label>
            <p className="text-sm mt-1">{task.departmentName || task.department || 'Chưa có phòng ban'}</p>
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
            {canEdit && (<div className="mt-2 space-y-2">
              <Input type="range" min="0" max="100" step="5" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full" />
              <Button size="sm" className="w-full" variant="outline" onClick={handleUpdateProgress}>
                Cập nhật tiến độ
              </Button>
            </div>)}
          </div>

          <Separator />

          {/* Hành động theo vai trò */}
          <div className="space-y-2">
            {/* Nhân viên: Gửi duyệt */}
            {isStaff && (task.status === 'in-progress' || task.status === 'returned') && (<Button className="w-full" onClick={handleSubmitForApproval}>
              <Send className="w-4 h-4 mr-2" />
              Gửi duyệt
            </Button>)}

            {/* Trưởng nhóm: Duyệt / Trả lại */}
            {canApprove && (<>
              <Button className="w-full" onClick={handleApprove}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Phê duyệt
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowReturnDialog(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Trả lại
              </Button>
            </>)}

            {!canEdit && !canApprove && (<p className="text-xs text-muted-foreground text-center py-2">
              Bạn chỉ có quyền xem công việc này
            </p>)}
          </div>
        </div>
      </div>

      {/* Dialog trả lại - BẮT BUỘC nhập lý do */}
      {showReturnDialog && (<div className="absolute inset-0 bg-background/80 flex items-center justify-center p-6">
        <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
          <h3 className="text-lg font-semibold">Trả lại công việc</h3>
          <p className="text-sm text-muted-foreground">
            Vui lòng nhập lý do trả lại công việc này.
          </p>
          <Textarea placeholder="Nhập lý do..." value={returnReason} onChange={(e) => setReturnReason(e.target.value)} rows={3} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleReturn}>
              Xác nhận trả lại
            </Button>
          </div>
        </div>
      </div>)}
    </DialogContent>
  </Dialog>);
}

