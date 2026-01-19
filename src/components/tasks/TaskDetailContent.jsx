import { useState, useEffect } from 'react';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Checkbox } from '@core/components/ui/checkbox';
import { useAuth } from '@core/contexts/AuthContext';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@core/components/ui/popover';
import { Calendar } from '@core/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, Paperclip, Link2, Upload, Send, CheckCircle2, XCircle, FileText, Trash2, Plus, X, ListTodo, LayoutGrid, User } from 'lucide-react';

import { taskService } from '@core/services/taskService';
import { SubtaskCard } from './SubtaskCard';
import { useNavigate } from 'react-router-dom';

export function TaskDetailContent({ task, accounts = [], onTaskUpdate, onClose, onOpenSubtask, onAddSubtask }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State - ALL hooks must be called before any conditional returns
    const [progress, setProgress] = useState(0);
    const [checklist, setChecklist] = useState([]);
    const [labels, setLabels] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [comments, setComments] = useState([]);
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
            setComments(task.comments || []);

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


    // Derived Access Control
    const isCreator = task?.Created_By_A_ID === user?.aid;
    const isAssigned = task?.Task_Member?.some(tm => tm.Member?.M_ID === user?.memberId);
    const isManager = ['admin', 'director', 'pmo', 'leader'].includes(user?.role?.name?.toLowerCase());
    const canEdit = isCreator || isManager || (isAssigned && task?.status === 'in-progress');
    const canAssign = isCreator || isManager;
    const canApprove = (isManager || isCreator) && task?.status === 'waiting-approval';
    const isStaff = user?.role?.name?.toLowerCase() === 'staff';

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
        if (labels.some(l => l.color === colorInfo.color)) {
            toast.info('Nhãn này đã tồn tại');
            return;
        }
        try {
            const res = await taskService.addLabel(task.id, { name: colorInfo.name, color: colorInfo.color });
            if (res.ok) {
                setLabels([...labels, res.data]);
                setIsAddingLabel(false);
                onTaskUpdate && onTaskUpdate();
                toast.success('Đã gắn nhãn');
            } else {
                toast.error('Lỗi gắn nhãn: ' + (res.message || 'Không xác định'));
            }
        } catch (err) {
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
        toast.success('Đã phê duyệt công việc!');
        onClose && onClose();
    };

    const handleReturn = () => {
        if (!returnReason.trim()) { toast.error('Vui lòng nhập lý do trả lại!'); return; }
        toast.info('Đã trả lại công việc');
        setShowReturnDialog(false);
        setReturnReason('');
        onClose && onClose();
    };

    const handleArchive = () => {
        setShowArchiveConfirm(true);
    };

    const confirmArchive = async () => {
        const res = await taskService.deleteTask(task.id);
        if (res.ok) {
            toast.success('Đã lưu trữ thẻ');
            setShowArchiveConfirm(false);
            onClose && onClose();
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

    const handleMoveStatus = async (newStatus) => {
        setStatus(newStatus); // Optimistic update
        const res = await taskService.updateTask(task.id, { status: newStatus });
        if (res.ok) {
            onTaskUpdate && onTaskUpdate();
        } else {
            setStatus(task.status); // Revert on failure
            toast.error('Lỗi di chuyển: ' + res.message);
        }
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
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-[#F4F5F7] dark:bg-gray-900 rounded-lg">

            {/* === LEFT COLUMN: MAIN CONTENT === */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">

                {/* Header: Title */}
                <div className="flex gap-4">
                    <div className="mt-1"><FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
                    <div className="flex-1 space-y-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                            {task.title}
                        </h2>
                        <div className="text-sm text-muted-foreground flex gap-2">
                            <span>trong danh sách <span className="underline decoration-dotted">{task.departmentName || task.department || 'Chung'}</span></span>
                        </div>
                    </div>
                    {onClose && (
                        <div className="flex gap-1 md:hidden">
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Meta Data Row: Members, Labels, Status, Date */}
                <div className="pl-10 flex flex-wrap gap-6">

                    {/* Members Section */}
                    <div className="space-y-1.5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thành viên</h3>
                        <div className="flex flex-wrap gap-1">
                            {selectedMembers.length > 0 && selectedMembers.map((member) => (
                                <Avatar key={member.id} className="w-8 h-8 hover:opacity-80 cursor-pointer transition-opacity" title={member.name}>
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                                        {member.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            <Popover open={showAssigneeDropdown} onOpenChange={setShowAssigneeDropdown}>
                                <PopoverTrigger asChild>
                                    <button onClick={() => canAssign && setShowAssigneeDropdown(true)} disabled={!canAssign} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center text-gray-600">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-64" align="start">
                                    <div className="p-3 border-b font-medium">Thành viên</div>
                                    <div className="p-2 max-h-60 overflow-y-auto">
                                        {accounts.length === 0 ? <p className="text-sm text-center p-2 text-muted-foreground">Không có thành viên nào</p> :
                                            accounts.map(acc => {
                                                const personId = acc.id || acc.M_ID;
                                                const personName = acc.name || acc.UserName || acc.FullName;
                                                const isSelected = selectedMembers.some(m => m.id === personId);
                                                return (
                                                    <div
                                                        key={personId}
                                                        className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                                                        onClick={() => toggleMemberSelection(acc)}
                                                    >
                                                        <Checkbox checked={isSelected} />
                                                        <span className="text-sm">{personName}</span>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className="p-2 border-t">
                                        <Button size="sm" className="w-full" onClick={handleSaveAssignees}>Lưu</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-1.5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nhãn</h3>
                        <div className="flex flex-wrap gap-2">
                            {labels.map(l => (
                                <div key={l.id} className="h-8 px-3 rounded text-sm font-medium text-white flex items-center gap-1 hover:opacity-80 cursor-pointer" style={{ backgroundColor: l.color }} onClick={() => canEdit && handleRemoveLabel(l.id)}>
                                    {l.name}
                                    {canEdit && <X className="w-3 h-3 ml-1" />}
                                </div>
                            ))}
                            <Popover open={isAddingLabel} onOpenChange={setIsAddingLabel}>
                                <PopoverTrigger asChild>
                                    <button className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center text-gray-600">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" align="start">
                                    <div className="text-sm font-medium mb-2 px-1">Chọn nhãn</div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {LABEL_COLORS.map(c => (
                                            <button
                                                key={c.color}
                                                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded text-left transition-colors"
                                                onClick={() => handleAddLabel(c)}
                                            >
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: c.color }}></div>
                                                <span className="text-sm">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

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

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày hết hạn</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="h-8 px-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-800 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                    <span>{deadline ? new Date(deadline).toLocaleDateString('vi-VN') : 'Chọn ngày'}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                {datePickerContent}
                            </PopoverContent>
                        </Popover>
                    </div >

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
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground w-8">{progress}%</span>
                            <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 group hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                    <Checkbox checked={item.completed} onCheckedChange={() => handleToggleChecklist(item)} />
                                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.content}</span>
                                    <button onClick={() => handleDeleteChecklist(item.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                </div>
                            ))}
                        </div>
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

                {/* Subtasks Section */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="flex gap-4">
                        <div className="mt-1"><ListTodo className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Việc nhỏ</h3>
                                {onAddSubtask && (
                                    <Button variant="ghost" size="sm" className="h-8" onClick={onAddSubtask}>
                                        <Plus className="w-4 h-4 mr-1" /> Thêm
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {task.subtasks.map(sub => (
                                    <SubtaskCard key={sub.id} task={sub} onClick={() => onOpenSubtask && onOpenSubtask(sub)} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Attachments Section */}
                < div className="flex gap-4" >
                    <div className="mt-1"><Paperclip className="w-6 h-6 text-gray-600 dark:text-gray-400 transform -rotate-45" /></div>
                    <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Đính kèm</h3>
                        {attachments.length === 0 && !isAddingAttachment && <p className="text-sm text-muted-foreground">Chưa có tệp đính kèm.</p>}
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
                        {isAddingAttachment ? (
                            <div className="border rounded-lg bg-white dark:bg-gray-800 p-4 space-y-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Đính kèm</h4>
                                    <button onClick={() => { setIsAddingAttachment(false); setAttachmentLink(''); setAttachmentDisplayName(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Đính kèm tệp từ máy tính của bạn</p>
                                    <input
                                        type="file"
                                        id="attachment-file-input"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            toast.info('Đang tải lên...');
                                            const uploadRes = await taskService.uploadFile(file);
                                            if (!uploadRes.ok) {
                                                toast.error('Lỗi tải file: ' + uploadRes.message);
                                                return;
                                            }
                                            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3069';
                                            const fullUrl = baseUrl + uploadRes.data.fileUrl;
                                            const res = await taskService.addAttachment(task.id, {
                                                fileName: uploadRes.data.fileName,
                                                fileUrl: fullUrl
                                            });
                                            if (res.ok) {
                                                setAttachments([...attachments, res.data]);
                                                setIsAddingAttachment(false);
                                                onTaskUpdate && onTaskUpdate();
                                                toast.success('Đã đính kèm tệp: ' + uploadRes.data.fileName);
                                            } else {
                                                toast.error('Lỗi lưu đính kèm: ' + res.message);
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

                {/* Activity Section */}
                <div className="flex gap-4">
                    <div className="mt-1">
                        <Clock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hoạt động</h3>
                            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                                Hiện chi tiết
                            </Button>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Avatar className="w-8 h-8 mt-1">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 relative">
                                <div className="relative shadow-sm rounded-md transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
                                    <Input
                                        placeholder="Viết bình luận..."
                                        className="pr-12 text-sm border-gray-300 dark:border-gray-700 focus-visible:ring-0 bg-white dark:bg-gray-800"
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <button
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${commentInput.trim()
                                            ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer'
                                            : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                        onClick={handleAddComment}
                                        disabled={!commentInput.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <Avatar className="w-8 h-8 mt-1 border border-gray-200 dark:border-gray-700" title={comment.user?.name}>
                                        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 text-xs font-semibold">
                                            {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {comment.user?.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        {editingCommentId === comment.id ? (
                                            <div className="space-y-2">
                                                <Input
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="bg-white dark:bg-gray-800"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="xs" onClick={() => handleSaveEdit(comment.id)}>Lưu</Button>
                                                    <Button size="xs" variant="ghost" onClick={handleCancelEdit}>Hủy</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                {comment.content}
                                            </div>
                                        )}
                                        {(comment.user?.id === user?.id || comment.user?.id === user?.memberId) && (
                                            <div className="flex gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-muted-foreground hover:text-primary underline" onClick={() => handleEditComment(comment)}>Chỉnh sửa</button>
                                                <button className="text-muted-foreground hover:text-red-500 underline" onClick={() => handleDeleteComment(comment.id)}>Xóa</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* === RIGHT COLUMN: SIDEBAR ACTIONS === */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-850 p-4 border-l dark:border-gray-700 space-y-6 overflow-y-auto">

                {/* Action Buttons */}
                <div className="space-y-2">
                    {/* Join/Reject */}
                    {isStaff && status === 'not-assigned' && (
                        <>
                            <Button className="w-full justify-start" onClick={() => handleMoveStatus('in-progress')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Nhận việc
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => handleMoveStatus('returned')}>
                                <XCircle className="w-4 h-4 mr-2 text-red-500" /> Từ chối
                            </Button>
                        </>
                    )}

                    {/* Submit/Update */}
                    {isStaff && status === 'in-progress' && (
                        <Button className="w-full justify-start" onClick={() => handleMoveStatus('waiting-approval')}>
                            <Send className="w-4 h-4 mr-2" /> Gửi duyệt
                        </Button>
                    )}

                    {/* Approve/Return */}
                    {canApprove && (
                        <>
                            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" onClick={() => handleMoveStatus('completed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Phê duyệt
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => setShowReturnDialog(true)}>
                                <XCircle className="w-4 h-4 mr-2 text-red-500" /> Trả lại
                            </Button>
                        </>
                    )}

                    {/* Archive */}
                    {canEdit && <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleArchive}>
                        <Trash2 className="w-4 h-4 mr-2" /> Lưu trữ
                    </Button>}
                </div>

                {/* Add to card section */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thêm vào thẻ</h4>
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setShowAssigneeDropdown(true)} disabled={!canAssign}>
                        <User className="w-4 h-4 mr-2" /> Thành viên
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setIsAddingLabel(true)} disabled={!canEdit}>
                        <LayoutGrid className="w-4 h-4 mr-2" /> Nhãn
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setChecklist([...checklist, { id: 'temp', content: 'Mục mới', completed: false }])} disabled={!canEdit}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Việc cần làm
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" disabled={!canEdit}>
                        <Clock className="w-4 h-4 mr-2" /> Ngày
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setIsAddingAttachment(true)} disabled={!canEdit}>
                        <Paperclip className="w-4 h-4 mr-2" /> Đính kèm
                    </Button>
                </div>

            </div>

        </div>
    );
}
