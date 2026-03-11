import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@core/components/ui/dialog';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@core/components/ui/avatar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Checkbox } from '@core/components/ui/checkbox';
import { useAuth } from '@core/contexts/AuthContext';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@core/components/ui/popover';
import { Calendar } from '@core/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, Paperclip, Link2, Upload, Send, CheckCircle2, XCircle, FileText, Trash2, Plus, ArrowRight, User, X } from 'lucide-react';
import { taskService } from '@core/services/taskService';
import { logService } from '@core/services/logService';

export function SubtaskDetailModal({ open, onOpenChange, task, accounts = [], onTaskUpdate }) {
  const { user } = useAuth();

  // State - ALL hooks must be called before any conditional returns
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState([]);
  const [labels, setLabels] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]); // State for System Logs
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not-assigned');
  const [deadline, setDeadline] = useState(null);

  // Inputs & Visibilities
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentLink, setAttachmentLink] = useState('');
  const [attachmentDisplayName, setAttachmentDisplayName] = useState('');

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);


  // Description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');

  const [commentInput, setCommentInput] = useState('');

  // Comment Editing State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Dialog confirmation for comment delete
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Activity Stream Visibility
  const [showAllActivities, setShowAllActivities] = useState(false);

  const LABEL_COLORS = [
    { name: 'Xanh lá', color: '#4ade80' },
    { name: 'Vàng', color: '#facc15' },
    { name: 'Cam', color: '#fb923c' },
    { name: 'Đỏ', color: '#f87171' },
    { name: 'Tím', color: '#c084fc' },
    { name: 'Lam', color: '#60a5fa' },
  ];

  // Sync with Task Prop
  useEffect(() => {
    if (task) {
      setProgress(task.progress || 0);
      setChecklist(task.checklist || []);
      setLabels(task.labels || []);
      setAttachments(task.attachments || []);

      // Only overwrite comments if the prop has them (e.g. from getTaskById)
      // If prop comes from list API (no comments), keep existing state or fetch via separate effect
      if (task.comments && task.comments.length > 0) {
        setComments(task.comments);
      }

      const members = task.Task_Member?.map(tm => ({
        id: tm.Member?.M_ID,
        name: tm.Member?.FullName,
        role: tm.Role,
        department: tm.Member?.Department?.D_Name
      })) || [];
      setSelectedMembers(members);
      setDescriptionInput(task.description || '');
      setDescription(task.description || '');
      setDeadline(task.deadline ? new Date(task.deadline) : null);
      setStatus(task.status || 'not-assigned');
    }
  }, [task]);

  // Fetch full task details (including comments) from API when modal opens
  // This is required because the list API usually doesn't return TaskComments
  useEffect(() => {
    if (task?.id && open) {
      const fetchFullTask = async () => {
        try {
          // Parallel fetch: Task Details + System Logs
          const [resTask, resLogs] = await Promise.all([
            taskService.getTaskById(task.id),
            logService.getLogs(1, 50, { targetId: task.id })
          ]);

          if (resTask.ok && resTask.data) {
            setComments(resTask.data.comments || []);
            // Also sync other detailed fields if needed
            if (resTask.data.checklist) setChecklist(resTask.data.checklist);
            if (resTask.data.labels) setLabels(resTask.data.labels);
            if (resTask.data.attachments) setAttachments(resTask.data.attachments);
          }

          if (resLogs.ok) {
            setLogs(resLogs.data || []);
          }
        } catch (err) {
          console.error('Error fetching full task details/logs:', err);
        }
      };
      fetchFullTask();
    }
  }, [task?.id, open]);

  // Combine Comments and Logs for Activity Stream
  const combinedActivities = [
    ...comments.map(c => ({ type: 'comment', data: c, date: new Date(c.createdAt) })),
    ...logs.map(l => ({ type: 'log', data: l, date: new Date(l.CreatedAt) }))
  ].sort((a, b) => b.date - a.date);

  // Early return AFTER all hooks
  if (!task) return null;

  // Derived Access Control (must be after hooks, can be before/after early return as long as hooks are first)
  const userRole = (user?.role || '').toLowerCase();
  const isCreator = task?.Created_By_A_ID === user?.id; // user.id is A_ID
  const isAssigned = task?.Task_Member?.some(tm => tm.Member?.M_ID === user?.m_id); // user.m_id is M_ID

  const isAdmin = ['admin', 'system admin', 'admin hệ thống'].includes(userRole);
  const isManager = ['admin', 'director', 'pmo', 'leader'].includes(userRole);
  const canEdit = isCreator || isManager || (isAssigned && task?.status === 'in-progress');
  const canAssign = isCreator || isManager;
  const canApprove = (isManager || isCreator) && task?.status === 'waiting-approval';
  const isStaff = userRole === 'staff';

  // Handlers - Checklist
  const handleAddChecklist = async () => {
    if (!checklistItemInput.trim()) return;
    const res = await taskService.addChecklistItem(task.id, checklistItemInput);
    if (res.ok) {
      setChecklist([...checklist, res.data]);
      setChecklistItemInput('');
      onTaskUpdate && onTaskUpdate();
      toast.success('Đã thêm việc cần làm');
    } else toast.error('Lỗi thêm việc: ' + res.message);
  };

  const handleToggleChecklist = async (item) => {
    const newStatus = !item.completed;
    const newItems = checklist.map(i => i.id === item.id ? { ...i, completed: newStatus } : i);
    setChecklist(newItems);

    const completedCount = newItems.filter(i => i.completed).length;
    const newProgress = Math.round((completedCount / newItems.length) * 100);
    if (newItems.length > 0) setProgress(newProgress);

    const res = await taskService.updateChecklistItem(item.id, { isCompleted: newStatus });
    if (!res.ok) toast.error('Lỗi cập nhật');
    else onTaskUpdate && onTaskUpdate();
  };

  const handleDeleteChecklist = async (itemId) => {
    const res = await taskService.deleteChecklistItem(itemId);
    if (res.ok) {
      setChecklist(checklist.filter(i => i.id !== itemId));
      onTaskUpdate && onTaskUpdate();
    } else toast.error('Lỗi xóa mục');
  };

  // Handlers - Labels
  const handleAddLabel = async (colorInfo) => {
    console.log('handleAddLabel called with:', colorInfo);
    if (labels.some(l => l.color === colorInfo.color)) {
      toast.info('Nhãn này đã tồn tại');
      return;
    }
    try {
      const res = await taskService.addLabel(task.id, { name: colorInfo.name, color: colorInfo.color });
      console.log('addLabel response:', res);
      if (res.ok) {
        setLabels([...labels, res.data]);
        setIsAddingLabel(false);
        onTaskUpdate && onTaskUpdate();
        toast.success('Đã gắn nhãn');
      } else {
        toast.error('Lỗi gắn nhãn: ' + (res.message || 'Không xác định'));
      }
    } catch (err) {
      console.error('handleAddLabel error:', err);
      toast.error('Lỗi: ' + err.message);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    const res = await taskService.removeLabel(task.id, labelId);
    if (res.ok) {
      setLabels(labels.filter(l => l.id !== labelId));
      onTaskUpdate && onTaskUpdate();
    }
  };

  // Handlers - Due Date
  const handleUpdateDate = async (date) => {
    setDeadline(date); // Update UI immediately
    const res = await taskService.updateTask(task.id, { deadline: date });
    if (res.ok) {
      onTaskUpdate && onTaskUpdate();
      toast.success('Đã cập nhật ngày hết hạn');
    } else {
      toast.error('Lỗi cập nhật ngày');
      setDeadline(task.deadline); // Revert on error
    }
  };

  // Handlers - Attachments
  const handleAddAttachment = async () => {
    if (!attachmentLink.trim()) return;
    // Use custom display name if provided, otherwise extract from URL
    const fileName = attachmentDisplayName.trim() || attachmentLink.split('/').pop() || 'liên kết';
    const res = await taskService.addAttachment(task.id, { fileName, fileUrl: attachmentLink });
    if (res.ok) {
      setAttachments([...attachments, res.data]);
      setAttachmentLink('');
      setAttachmentDisplayName('');
      setIsAddingAttachment(false);
      onTaskUpdate && onTaskUpdate();
      toast.success('Đã đính kèm liên kết');
    } else {
      toast.error('Lỗi đính kèm: ' + (res.message || 'Không xác định'));
    }
  };

  // Handler - Delete Attachment
  const handleDeleteAttachment = async (attachmentId) => {
    const res = await taskService.deleteAttachment(task.id, attachmentId);
    if (res.ok) {
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      onTaskUpdate && onTaskUpdate();
      toast.success('Đã xóa đính kèm');
    } else {
      toast.error('Lỗi xóa: ' + (res.message || 'Không xác định'));
    }
  };

  // Handlers - Members & Actions
  const toggleMemberSelection = (staff) => {
    const staffId = staff.id || staff.M_ID;
    const staffName = staff.name || staff.UserName || staff.FullName;
    const exists = selectedMembers.some(m => m.id === staffId);

    if (exists) setSelectedMembers(selectedMembers.filter(m => m.id !== staffId));
    else setSelectedMembers([...selectedMembers, { id: staffId, name: staffName }]);
  };

  const handleSaveAssignees = async () => {
    const memberIds = selectedMembers.map(m => m.id);
    const res = await taskService.updateTask(task.id, { memberIds });
    if (res.ok) {
      toast.success(`Đã gán ${selectedMembers.length} người thực hiện`);
      setShowAssigneeDropdown(false);
      onTaskUpdate && onTaskUpdate();
    } else toast.error(res.message || 'Lỗi gán việc');
  };

  const handleApprove = () => {
    toast.success('Đã phê duyệt công việc!'); // Logic placeholder matches previous
    onOpenChange(false);
  };

  const handleReturn = () => {
    if (!returnReason.trim()) { toast.error('Vui lòng nhập lý do trả lại!'); return; }
    toast.info('Đã trả lại công việc');  // Logic placeholder
    setShowReturnDialog(false);
    setReturnReason('');
    onOpenChange(false);
  };

  // Handlers - Archive (Delete)
  const handleArchive = () => {
    setShowArchiveConfirm(true);
  };

  const confirmArchive = async () => {
    const res = await taskService.deleteTask(task.id);
    if (res.ok) {
      toast.success('Đã lưu trữ thẻ');
      setShowArchiveConfirm(false);
      onOpenChange(false);
      onTaskUpdate && onTaskUpdate();
    } else {
      toast.error('Lỗi lưu trữ: ' + res.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    const res = await taskService.addComment(task.id, commentInput);
    if (res.ok) {
      setComments([res.data, ...comments]);
      setCommentInput('');
      toast.success("Đã thêm bình luận");
    } else {
      toast.error("Lỗi thêm bình luận: " + res.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      const res = await taskService.deleteComment(task.id, commentId);
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Đã xóa bình luận');
      } else {
        toast.error('Lỗi xóa bình luận: ' + res.message);
      }
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    const res = await taskService.editComment(task.id, commentId, editContent);
    if (res.ok) {
      setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent } : c));
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Đã cập nhật bình luận');
    } else {
      toast.error('Lỗi cập nhật bình luận: ' + res.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const STATUS_OPTIONS = [
    { value: 'not-assigned', label: 'Chưa giao' },
    { value: 'in-progress', label: 'Đang thực hiện' },
    { value: 'waiting-approval', label: 'Đang duyệt' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'returned', label: 'Bị trả lại' },
    { value: 'overdue', label: 'Quá hạn' }
  ];

  const handleMoveStatus = async (newStatus) => {
    setStatus(newStatus); // Optimistic update
    const res = await taskService.updateTask(task.id, { status: newStatus });
    if (res.ok) {
      toast.success(`Đã di chuyển sang: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
      onTaskUpdate && onTaskUpdate();
    } else {
      setStatus(task.status); // Revert on failure
      toast.error('Lỗi di chuyển: ' + res.message);
    }
  };

  const handleSubmitForApproval = () => {
    toast.success('Đã gửi duyệt!'); // Logic placeholder
  };


  // Date Picker Content Reusable
  const datePickerContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
        <span className="font-semibold text-gray-900 dark:text-gray-100">Ngày</span>
      </div>

      <Calendar
        mode="single"
        selected={deadline}
        onSelect={setDeadline}
        disabled={!canEdit}
        className="p-3"
        initialFocus
      />

      <div className="px-4 pb-4 space-y-3 border-t dark:border-gray-700 pt-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Checkbox
              checked={!!deadline}
              onCheckedChange={(checked) => {
                if (!checked) setDeadline(null);
              }}
            />
            Ngày hết hạn
          </label>
          {deadline && (
            <div className="flex gap-2 mt-2">
              <Input
                type="date"
                value={deadline ? `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}` : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const newDate = new Date(year, month - 1, day);
                    if (deadline) {
                      newDate.setHours(deadline.getHours(), deadline.getMinutes());
                    }
                    setDeadline(newDate);
                  }
                }}
                className="h-9 text-sm flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-2"
              />
              <Input
                type="time"
                value={deadline ? `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}` : '09:00'}
                onChange={(e) => {
                  if (e.target.value && deadline) {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const newDate = new Date(deadline);
                    newDate.setHours(h, m);
                    setDeadline(newDate);
                  }
                }}
                className="h-9 text-sm flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-2"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={async () => {
              if (!canEdit) return;
              const res = await taskService.updateTask(task.id, { deadline: deadline });
              if (res.ok) {
                onTaskUpdate && onTaskUpdate();
                toast.success('Đã lưu ngày hết hạn');
              } else {
                toast.error('Lỗi lưu ngày');
              }
            }}
          >
            Lưu
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={async () => {
              if (!canEdit) return;
              setDeadline(null);
              const res = await taskService.updateTask(task.id, { deadline: null });
              if (res.ok) {
                onTaskUpdate && onTaskUpdate();
                toast.success('Đã gỡ ngày hết hạn');
              } else {
                toast.error('Lỗi gỡ ngày');
              }
            }}
          >
            Gỡ bỏ
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden bg-[#F4F5F7] dark:bg-gray-900 text-gray-700 dark:text-gray-300 flex flex-col focus:outline-none">

        <div className="flex flex-col md:flex-row h-full overflow-hidden">

          {/* === LEFT COLUMN: MAIN CONTENT === */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">

            {/* Header: Title */}
            <div className="flex gap-4">
              <div className="mt-1"><FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {task.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Chi tiết công việc: {task.title}
                </DialogDescription>
                <div className="text-sm text-muted-foreground flex gap-2">
                  <span>trong danh sách <span className="underline decoration-dotted">{task.departmentName || task.department || 'Chung'}</span></span>
                </div>
              </div>
            </div>

            {/* Meta Data Row: Members, Labels, Status, Date */}
            <div className="pl-10 flex flex-wrap gap-6">

              {/* Members Section */}
              {selectedMembers.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thành viên</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedMembers.map((member) => (
                      <Avatar key={member.id} className="w-8 h-8 hover:opacity-80 cursor-pointer transition-opacity" title={member.name}>
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                          {member.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <button onClick={() => canAssign && setShowAssigneeDropdown(true)} disabled={!canAssign} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center text-gray-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Labels */}
              {labels.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nhãn</h3>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(l => (
                      <div key={l.id} className="h-8 px-3 rounded text-sm font-medium text-white flex items-center gap-1 hover:opacity-80 cursor-pointer" style={{ backgroundColor: l.color }} onClick={() => canEdit && handleRemoveLabel(l.id)}>
                        {l.name}
                        {canEdit && <X className="w-3 h-3 ml-1" />}
                      </div>
                    ))}
                    <button onClick={() => canEdit && setIsAddingLabel(!isAddingLabel)} className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center text-gray-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="space-y-1.5 min-w-[100px]">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</h3>
                <StatusBadge status={status} className="h-8 px-3 text-sm cursor-pointer" />
              </div>

              {/* Priority Section */}
              <div className="space-y-1.5 min-w-[100px]">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Độ ưu tiên</h3>
                <PriorityBadge priority={task.priority} className="h-8 px-3 text-sm cursor-pointer" />
              </div>

              {/* Due Date - Trello Style */}
              {deadline && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày hết hạn</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-8 px-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-800 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span>{new Date(deadline).toLocaleDateString('vi-VN')}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom">
                      {datePickerContent}


                    </PopoverContent>
                  </Popover>
                </div >
              )
              }
            </div >

            {/* Description Section */}
            < div className="flex gap-4" >
              <div className="mt-1"><FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mô tả</h3>
                  {canEdit && !isEditingDescription && <Button variant="ghost" size="sm" className="h-8" onClick={() => setIsEditingDescription(true)}>Chỉnh sửa</Button>}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      placeholder="Nhập mô tả chi tiết..."
                      rows={4}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={async () => {
                        const res = await taskService.updateTask(task.id, { description: descriptionInput });
                        if (res.ok) {
                          setDescription(descriptionInput);
                          setIsEditingDescription(false);
                          onTaskUpdate && onTaskUpdate();
                          toast.success('Đã lưu mô tả');
                        } else toast.error('Lỗi lưu mô tả');
                      }}>Lưu</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setDescriptionInput(description); setIsEditingDescription(false); }}>Hủy</Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded -m-2" onClick={() => canEdit && setIsEditingDescription(true)}>
                    {description || <span className="text-muted-foreground italic">Chưa có mô tả chi tiết. Nhấn để thêm...</span>}
                  </div>
                )}
              </div>
            </div >

            {/* Checklist Section */}
            < div className="flex gap-4" >
              <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Việc cần làm</h3>
                </div>


                {/* Items */}
                <div className="space-y-2">
                  {checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                      <Checkbox checked={item.completed} onCheckedChange={() => handleToggleChecklist(item)} />
                      <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.content}</span>
                      <button onClick={() => handleDeleteChecklist(item.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                    </div>
                  ))}
                </div>
                {/* Add Item Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm một mục..."
                    value={checklistItemInput}
                    onChange={(e) => setChecklistItemInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={handleAddChecklist} disabled={!checklistItemInput.trim()}>Thêm</Button>
                </div>
              </div>
            </div >

            {/* Attachments Section */}
            < div className="flex gap-4" >
              <div className="mt-1"><Paperclip className="w-6 h-6 text-gray-600 dark:text-gray-400 transform -rotate-45" /></div>
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Đính kèm</h3>
                {attachments.length === 0 && !isAddingAttachment && <p className="text-sm text-muted-foreground">Chưa có tệp đính kèm.</p>}

                {/* Attachment List */}
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-3 p-2 border rounded bg-white dark:bg-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                        <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                          {att.fileName}
                        </a>
                        <span className="text-xs text-muted-foreground">Đã thêm {att.uploadDate ? new Date(att.uploadDate).toLocaleDateString('vi-VN') : 'gần đây'}</span>
                      </div>
                      {canEdit && (
                        <button
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa"
                          onClick={() => handleDeleteAttachment(att.id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Attachment Dialog */}
                {isAddingAttachment ? (
                  <div className="border rounded-lg bg-white dark:bg-gray-800 p-4 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Đính kèm</h4>
                      <button onClick={() => { setIsAddingAttachment(false); setAttachmentLink(''); setAttachmentDisplayName(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Option 1: File Upload */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Đính kèm tệp từ máy tính của bạn</p>
                      <p className="text-xs text-muted-foreground">Hỗ trợ: ảnh, PDF, Word, Excel (tối đa 10MB)</p>
                      <input
                        type="file"
                        id="attachment-file-input"
                        className="hidden"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;

                          toast.info(`Đang tải lên ${files.length} tệp...`);
                          let successCount = 0;
                          const newAttachments = [];

                          for (const file of files) {
                            const uploadRes = await taskService.uploadFile(file);
                            if (!uploadRes.ok) {
                              toast.error(`Lỗi tải file "${file.name}": ${uploadRes.message}`);
                              continue;
                            }

                            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                            const fullUrl = baseUrl + uploadRes.data.fileUrl;
                            const res = await taskService.addAttachment(task.id, {
                              fileName: uploadRes.data.fileName,
                              fileUrl: fullUrl
                            });

                            if (res.ok) {
                              newAttachments.push(res.data);
                              successCount++;
                            } else {
                              toast.error(`Lỗi lưu đính kèm "${file.name}": ${res.message}`);
                            }
                          }

                          if (newAttachments.length > 0) {
                            setAttachments([...attachments, ...newAttachments]);
                            setIsAddingAttachment(false);
                            onTaskUpdate && onTaskUpdate();
                            toast.success(`Đã đính kèm ${successCount} tệp thành công!`);
                          }
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => document.getElementById('attachment-file-input')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn tệp
                      </Button>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      {/* Option 2: Link */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm hoặc dán liên kết <span className="text-red-500">*</span></label>
                        <Input
                          placeholder="Tìm các liên kết gần đây hoặc dán một liên kết..."
                          value={attachmentLink}
                          onChange={e => setAttachmentLink(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Văn bản hiển thị <span className="text-muted-foreground">(không bắt buộc)</span></label>
                        <Input
                          placeholder="Văn bản cần hiển thị"
                          value={attachmentDisplayName}
                          onChange={e => setAttachmentDisplayName(e.target.value)}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Cung cấp tiêu đề hoặc mô tả cho liên kết này</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleAddAttachment} disabled={!attachmentLink.trim()}>Thêm</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setIsAddingAttachment(false); setAttachmentLink(''); setAttachmentDisplayName(''); }}>Hủy</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" className="text-gray-600 dark:text-gray-300" onClick={() => setIsAddingAttachment(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Thêm tệp đính kèm
                  </Button>
                )}
              </div>
            </div >

            {/* Activity Section — Trello-style */}
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 space-y-3">

                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nhận xét và hoạt động</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? 'Ẩn chi tiết' : 'Hiện chi tiết'}
                  </Button>
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 items-center">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Viết bình luận..."
                      className="text-sm h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 pr-10"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${commentInput.trim()
                        ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={handleAddComment}
                      disabled={!commentInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Activity Stream — Trello style: interleaved comments + logs */}
                <div className="space-y-1">
                  {(() => {
                    // Group duplicate logs
                    const logsOnly = combinedActivities.filter(a => a.type === 'log');
                    const groupedLogs = [];
                    logsOnly.forEach(logActivity => {
                      const prev = groupedLogs[groupedLogs.length - 1];
                      if (prev && prev.data.Message === logActivity.data.Message
                        && (prev.data.Actor?.UserName || '') === (logActivity.data.Actor?.UserName || '')) {
                        prev.count = (prev.count || 1) + 1;
                      } else {
                        groupedLogs.push({ ...logActivity, count: 1 });
                      }
                    });

                    // Build unified timeline
                    const commentsOnly = combinedActivities.filter(a => a.type === 'comment');
                    const allItems = [
                      ...commentsOnly.map(c => ({ kind: 'comment', data: c.data, date: c.date })),
                      ...groupedLogs.map(g => ({ kind: 'log', data: g.data, date: g.date, count: g.count }))
                    ].sort((a, b) => b.date - a.date);

                    // When collapsed: show only the latest item
                    const visibleItems = showAllActivities ? allItems : allItems.slice(0, 1);
                    const hiddenCount = allItems.length - 1;

                    return (
                      <>
                        {visibleItems.map((item, idx) => {
                          if (item.kind === 'comment') {
                            const c = item.data;
                            return (
                              <div key={`comment-${c.id}`} className="flex gap-3 group py-2">
                                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                                  {c.user?.avatar && <AvatarImage src={c.user.avatar} alt={c.user.name} />}
                                  <AvatarFallback className="bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs font-bold">
                                    {c.user?.name?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                      {c.user?.name}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
                                    {editingCommentId === c.id ? (
                                      <div className="flex flex-col gap-2">
                                        <Input
                                          value={editContent}
                                          onChange={(e) => setEditContent(e.target.value)}
                                          className="text-sm"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(c.id); }
                                            if (e.key === 'Escape') handleCancelEdit();
                                          }}
                                        />
                                        <div className="flex gap-2 justify-end text-xs">
                                          <span className="text-muted-foreground mr-auto self-center">Esc để hủy · Enter để lưu</span>
                                          <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 font-medium">Hủy</button>
                                          <button onClick={() => handleSaveEdit(c.id)} className="text-blue-600 hover:text-blue-700 font-medium">Lưu</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        {c.content}
                                        {canEdit && (user?.id === c.user?.id || isAdmin) && (
                                          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-0.5 transition-opacity">
                                            <button onClick={() => handleEditComment(c)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-blue-600" title="Sửa"><FileText className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteComment(c.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-red-500" title="Xóa"><X className="w-3.5 h-3.5" /></button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 hover:underline cursor-default">
                                    {new Date(c.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            );
                          } else {
                            // System log — Trello style: avatar + inline text + timestamp below
                            const l = item.data;
                            const actorName = l.Actor?.Member?.FullName || l.Actor?.UserName || 'Hệ thống';
                            const actorAvatar = l.Actor?.Avatar ? `${import.meta.env.VITE_API_BASE_URL || ''}${l.Actor.Avatar}` : null;
                            return (
                              <div key={`log-${l.LogID}-${idx}`} className="flex gap-3 py-1.5">
                                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                                  {actorAvatar && <AvatarImage src={actorAvatar} alt={actorName} />}
                                  <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs font-bold">
                                    {actorName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 pt-1">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{actorName}</span>
                                    {' '}
                                    <span>{l.Message}</span>
                                    {item.count > 1 && (
                                      <span className="ml-1 text-[10px] text-white bg-gray-400 dark:bg-gray-600 px-1.5 py-0.5 rounded-full font-semibold align-middle">×{item.count}</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hover:underline cursor-default">
                                    {new Date(l.CreatedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        })}

                        {/* Show more toggle */}
                        {!showAllActivities && hiddenCount > 0 && (
                          <button
                            onClick={() => setShowAllActivities(true)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-11 py-1"
                          >
                            Xem thêm {hiddenCount} hoạt động...
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

              </div>
            </div>
          </div>


          {/* === RIGHT COLUMN: SIDEBAR ACTIONS === */}
          <div className="w-full md:w-[240px] bg-gray-50 dark:bg-gray-900/50 p-4 pt-12 space-y-6 border-l overflow-y-auto">

            {/* Action Group: Add to card */}
            < div className="space-y-2" >
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Thêm vào thẻ</h4>

              {/* Members Popover */}
              <Popover open={showAssigneeDropdown} onOpenChange={setShowAssigneeDropdown}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" disabled={!canAssign}>
                    <User className="w-4 h-4 mr-2" /> Thành viên
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0" align="start">
                  <div className="p-3 border-b flex justify-between items-center bg-muted/30">
                    <span className="font-medium text-sm">Thành viên</span>
                    <X className="w-4 h-4 cursor-pointer hover:text-red-500" onClick={() => setShowAssigneeDropdown(false)} />
                  </div>
                  <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                    {accounts
                      .filter(acc => (acc.status === 'active' || acc.Status === 'active'))
                      .filter(acc => !task.departmentId || acc.departmentId === task.departmentId)
                      .map((staff) => {
                        const staffId = staff.id || staff.M_ID;
                        const staffName = staff.name || staff.UserName || staff.FullName;
                        const isSelected = selectedMembers.some(m => m.id === staffId);
                        return (
                          <div key={staffId} onClick={() => toggleMemberSelection(staff)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-muted ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <Checkbox checked={isSelected} />
                            <Avatar className="w-7 h-7"><AvatarFallback className="text-xs">{staffName?.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1 overflow-hidden"><div className="text-sm font-medium truncate">{staffName}</div></div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="p-2 border-t bg-muted/30">
                    <Button size="sm" className="w-full" onClick={handleSaveAssignees}>Lưu lại ({selectedMembers.length})</Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Labels Popover */}
              <Popover open={isAddingLabel} onOpenChange={setIsAddingLabel}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"><Upload className="w-4 h-4 mr-2" /> Nhãn</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2" align="start">
                  <h4 className="text-xs font-semibold mb-2">Chọn màu nhãn</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {LABEL_COLORS.map(c => (
                      <div key={c.color} className="w-8 h-8 rounded cursor-pointer hover:opacity-80" style={{ backgroundColor: c.color }} onClick={() => handleAddLabel(c)} title={c.name}></div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Checklist */}
              <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" onClick={() => { document.querySelector('input[placeholder="Thêm một mục..."]')?.focus(); }}><CheckCircle2 className="w-4 h-4 mr-2" /> Việc cần làm</Button>

              {/* Date Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"><CalendarIcon className="w-4 h-4 mr-2" /> Ngày</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {datePickerContent}
                </PopoverContent>
              </Popover>

              <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" onClick={() => setIsAddingAttachment(true)}><Paperclip className="w-4 h-4 mr-2" /> Đính kèm</Button>
            </div >

            {/* Action Group: Actions */}
            < div className="space-y-2" >
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Thao tác</h4>

              {
                canApprove && (
                  <>
                    <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}><CheckCircle2 className="w-4 h-4 mr-2" /> Phê duyệt</Button>
                    <Button variant="outline" className="w-full justify-start border-red-200 hover:bg-red-50 text-red-600" onClick={() => setShowReturnDialog(true)}><XCircle className="w-4 h-4 mr-2" /> Trả lại</Button>
                  </>
                )
              }

              {
                isStaff && (task.status === 'in-progress' || task.status === 'returned') && (
                  <Button className="w-full justify-start" onClick={handleSubmitForApproval}><Send className="w-4 h-4 mr-2" /> Gửi duyệt</Button>
                )
              }

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={!canEdit}><ArrowRight className="w-4 h-4 mr-2" /> Di chuyển</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2" align="start">
                  <h4 className="text-xs font-semibold mb-2 px-1">Di chuyển sang cột...</h4>
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map(s => (
                      <div
                        key={s.value}
                        className={`text-sm px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${status === s.value ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : ''}`}
                        onClick={() => handleMoveStatus(s.value)}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="secondary" className="w-full justify-start text-gray-700 dark:text-gray-300 font-normal bg-gray-200/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleArchive} disabled={!canEdit}><Trash2 className="w-4 h-4 mr-2" /> Lưu trữ</Button>
            </div>
          </div>
        </div>


        {/* Dialog trả lại (Overlay) */}
        {
          showReturnDialog && (<div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
            <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="text-lg font-semibold">Trả lại công việc</h3>
              <p className="text-sm text-muted-foreground">Vui lòng nhập lý do trả lại công việc này.</p>
              <Textarea placeholder="Nhập lý do..." value={returnReason} onChange={(e) => setReturnReason(e.target.value)} rows={3} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Hủy</Button>
                <Button onClick={handleReturn} variant="destructive">Xác nhận trả lại</Button>
              </div>
            </div>
          </div>)
        }

        {/* Dialog xác nhận lưu trữ (Overlay) */}
        {
          showArchiveConfirm && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-2xl">
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Xác nhận lưu trữ</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bạn có chắc chắn muốn lưu trữ thẻ <span className="font-medium text-gray-900 dark:text-gray-200">"{task.title}"</span>?
                    <br />Hành động này có thể được coi là xóa thẻ.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowArchiveConfirm(false)}>Hủy bỏ</Button>
                  <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700" onClick={confirmArchive}>Lưu trữ</Button>
                </div>
              </div>
            </div>
          )
        }

      </DialogContent >
    </Dialog >);
}
