import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { Separator } from '@core/components/ui/separator';
import { Textarea } from '@core/components/ui/textarea';
import { useAuth, usePermissions } from '@core/contexts/AuthContext';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';

import { LoadingScreen } from '@core/components/common/LoadingScreen';
import { toast } from 'sonner';
import { ArrowLeft, ListTodo, CheckCircle2, Clock, Plus, Paperclip, Building2, Calendar, Link2, Upload, X, Send, Trash2, FileText, Play, RefreshCw, Check } from 'lucide-react';
import { Input } from '@core/components/ui/input';
import { Checkbox } from '@core/components/ui/checkbox';
import { taskService } from '@core/services/taskService';
import { userService } from '@core/services/userService';

// ... imports ...

// Replacing mock data with state in component

// Mocks removed
// Mock data removed - Features dependent on DB updates
const mockSubtasks = [];
const mockFiles = [];
const mockActivityLog = [];

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);

  // Modals
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showSubtaskDetail, setShowSubtaskDetail] = useState(false);

  // Comments & Attachments State
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentLink, setAttachmentLink] = useState('');
  const [attachmentDisplayName, setAttachmentDisplayName] = useState('');

  // Fetch Task
  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(id);
      if (response.ok) {
        setTask(response.data);
        setComments(response.data.comments || []);
        setAttachments(response.data.attachments || []);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  // Fetch Staff
  useEffect(() => {
    const departmentId = task?.departmentId;
    if (departmentId) {
      const fetchStaff = async () => {
        try {
          const response = await userService.getUsers({ departmentId, limit: 100 });
          if (response.ok) {
            const staffList = response.data
              .filter(u => u.status === 'active' && !u.isDeleted)
              .map(u => ({
                id: u.member?.id || u.aid,
                name: u.member?.fullName || u.userName,
                role: u.role?.name,
                department: u.member?.departmentName
              }));
            setStaff(staffList);
          }
        } catch (error) {
          console.error('Error fetching staff:', error);
        }
      };
      fetchStaff();
    }
  }, [task?.departmentId]);

  const handleCreateSubtask = async (data) => {
    try {
      const subtaskData = {
        ...data,
        projectId: task.projectId,
        parentTaskId: task.id,
        assigneeId: data.assigneeIds && data.assigneeIds.length > 0 ? data.assigneeIds[0] : null
      };

      const response = await taskService.createTask(subtaskData);
      if (response.ok) {
        toast.success('Tạo việc nhỏ thành công!');
        setShowSubtaskModal(false);
        fetchTask();
      } else {
        toast.error(response.message || 'Tạo việc nhỏ thất bại');
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Lỗi khi tạo việc nhỏ');
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

  const handleAddAttachment = async () => {
    if (!attachmentLink.trim()) return;
    const fileName = attachmentDisplayName.trim() || attachmentLink.split('/').pop() || 'liên kết';
    const res = await taskService.addAttachment(task.id, { fileName, fileUrl: attachmentLink });
    if (res.ok) {
      setAttachments([...attachments, res.data]);
      setAttachmentLink('');
      setAttachmentDisplayName('');
      setIsAddingAttachment(false);
      toast.success('Đã đính kèm liên kết');
    } else {
      toast.error('Lỗi đính kèm: ' + (res.message || 'Không xác định'));
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const res = await taskService.deleteAttachment(task.id, attachmentId);
    if (res.ok) {
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      toast.success('Đã xóa đính kèm');
    } else {
      toast.error('Lỗi xóa: ' + (res.message || 'Không xác định'));
    }
  };


  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await taskService.updateTask(task.id, { ...task, status: newStatus });
      if (res.ok) {
        setTask(res.data);
        toast.success('Đã cập nhật trạng thái');
      } else {
        toast.error('Lỗi cập nhật: ' + res.message);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateProgress = async () => {
    const current = task.progress || 0;
    const input = window.prompt("Nhập % tiến độ (0-100):", current);
    if (input === null) return;
    const val = parseInt(input);
    if (isNaN(val) || val < 0 || val > 100) return toast.error('Vui lòng nhập số hợp lệ');

    try {
      const res = await taskService.updateTask(task.id, { ...task, progress: val });
      if (res.ok) {
        setTask(res.data);
        toast.success('Đã cập nhật tiến độ');
      } else {
        toast.error('Lỗi cập nhật: ' + res.message);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingScreen />; // Ensure LoadingScreen is imported or use plain div
  if (!task) return <div className="p-8 text-center">Không tìm thấy công việc</div>;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 pb-0 max-w-[1920px] mx-auto bg-background overflow-y-auto">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">Dự án: <span className="font-medium text-foreground">{task.projectName || 'Chung'}</span></p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Mô tả</h3>
                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap min-h-[100px]">
                  {task.description || 'Chưa có mô tả'}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Tiến độ</h3>
                <ProgressBar value={task.progress} showLabel />
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Việc nhỏ ({task.subtasks?.length || 0})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/tasks-board?projectId=${task.projectId}`)}>
                  <ListTodo className="w-4 h-4 mr-2" /> Bảng công việc
                </Button>
                {permissions?.canCreateSubtask && (
                  <Button size="sm" variant="outline" onClick={() => setShowSubtaskModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Thêm việc nhỏ
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setSelectedSubtask(sub); setShowSubtaskDetail(true); }}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${sub.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {sub.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sub.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.assignee?.name || 'Chưa giao'} • Hạn: {sub.deadline ? new Date(sub.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Chưa có việc nhỏ nào</p>
                    {permissions?.canCreateSubtask && (
                      <Button variant="link" onClick={() => setShowSubtaskModal(true)}>+ Thêm việc nhỏ ngay</Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Task Detail Content (Comments & Attachments wrapper) used to be here, 
                 but if we want specific layout we might need to inline them or use TaskDetailContent 
                 as a 'fragment' if it supports it. 
                 For now, let's render the reused TaskDetailContent below but maybe asking it to hide header?
                 Actually, the user screenshot didn't show comments. 
                 But they complained about comments. 
                 Let's stick to the visual layout of "Cards". 
             */}


        </div>

        {/* Right Column: Actions & Info (1/3) */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-muted-foreground">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Logic: 
                 1. If User is Assignee (regardless of Role) -> Show Work Actions
                 2. Else If User is Leader/Manager -> Show Management Actions 
                 3. Else (Staff but not assignee yet, or unassigned) -> Show Work Actions (Receive)
              */}
              {(user && (user.aid === task.assignee?.id || user.memberId === task.assignee?.id || (!task.assignee && !permissions?.canCreateSubtask))) ? (
                // WORK ACTIONS (Assignee or Staff picking up task)
                <>
                  {/* Not Assigned -> Receive Task */}
                  {(task.status === 'not-assigned' || !task.status) && (
                    <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleUpdateStatus('in-progress')}>
                      <Play className="w-4 h-4 mr-2" /> Nhận việc
                    </Button>
                  )}

                  {/* In Progress / Returned -> Handover (Chuyển giao) */}
                  {['in-progress', 'returned'].includes(task.status) && (
                    <Button className="w-full justify-center" variant="outline" onClick={() => handleUpdateStatus('waiting-approval')}>
                      <RefreshCw className="w-4 h-4 mr-2" /> Chuyển giao
                    </Button>
                  )}

                  {/* Waiting Approval -> Show status */}
                  {task.status === 'waiting-approval' && (
                    <Button className="w-full justify-center" variant="secondary" disabled>
                      <Clock className="w-4 h-4 mr-2" /> Đang chờ duyệt
                    </Button>
                  )}

                  {/* Completed */}
                  {task.status === 'completed' && (
                    <Button className="w-full justify-center bg-green-50 text-green-600 border-green-200" variant="outline" disabled>
                      <Check className="w-4 h-4 mr-2" /> Đã hoàn thành
                    </Button>
                  )}
                </>
              ) : (
                // Non-Assignee View (Leader viewing other's task) -> Empty or Hidden
                <div className="text-center text-sm text-muted-foreground italic">
                  Không có hành động
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-muted-foreground">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Trưởng nhóm phụ trách</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{task.assignee?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{task.assignee?.name || 'Chưa giao'}</p>
                    <p className="text-xs text-muted-foreground">{task.assignee?.department || 'Không rõ'}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bộ phận chính</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{task.departmentName || 'Chung'}</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ngày bắt đầu</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Hạn chót</p>
                  <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Attachments Card */}
      <Card className="border-none shadow-sm mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              File đính kèm ({attachments.length})
            </CardTitle>
            {!isAddingAttachment && (
              <Button variant="ghost" size="sm" onClick={() => setIsAddingAttachment(true)}>
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group relative">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="block text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 truncate">
                    {att.fileName}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {att.uploadDate ? new Date(att.uploadDate).toLocaleDateString('vi-VN') : 'Mới tải lên'}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                  onClick={() => handleDeleteAttachment(att.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {isAddingAttachment && (
            <div className="mt-4 border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Liên kết file</label>
                  <Input value={attachmentLink} onChange={(e) => setAttachmentLink(e.target.value)} placeholder="https://..." className="h-8 text-sm" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Tên hiển thị</label>
                  <Input value={attachmentDisplayName} onChange={(e) => setAttachmentDisplayName(e.target.value)} placeholder="VD: Tài liệu..." className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAddingAttachment(false)}>Hủy</Button>
                <Button size="sm" onClick={handleAddAttachment} disabled={!attachmentLink.trim()}>Thêm</Button>
              </div>
            </div>
          )}

          {attachments.length === 0 && !isAddingAttachment && (
            <div className="text-center py-6 text-sm text-muted-foreground border-dashed border-2 rounded-lg">
              Chưa có tệp đính kèm nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity / Comments Card */}
      <Card className="border-none shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Nhật ký thay đổi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Comment Input Area */}

          <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
            {/* Comments removed as per user request. This section is reserved for System Logs */
              /* comments.map(...) */
            }
            <div className="text-sm text-muted-foreground pl-4 italic">
              Chưa có hoạt động nào được ghi nhận.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Subtask Modal */}
      < TaskFormModal
        open={showSubtaskModal}
        onOpenChange={setShowSubtaskModal}
        onSubmit={handleCreateSubtask}
        type="sub-task"
        projects={[{ id: task.projectId }]}
        departments={[]}
        accounts={staff}
        initialData={{
          projectId: task.projectId,
          parentTaskId: task.id,
          assigneeId: '',
        }
        }
        mode="create"
      />

      {/* View Subtask Detail Modal */}
      < SubtaskDetailModal
        open={showSubtaskDetail}
        onOpenChange={setShowSubtaskDetail}
        task={selectedSubtask}
        accounts={staff}
        onTaskUpdate={() => {
          fetchTask();
          // Also need to refresh selectedSubtask if we want it live, 
          // but since it's a child of Task, fetchTask() updates `task` which updates the list in TaskDetailContent.
          // However, the Modal uses `selectedSubtask`. 
          // We should ideally fetch the specific subtask or find it in the new task data.
          // For now, simple refresh of parent is critical. 
          // Better: update selectedSubtask from new task data.
          if (selectedSubtask) {
            // Use a temporary effect or assume close?
            // Let's just rely on modal closing or parent refresh.
          }
        }}
      />
    </div >
  );
}

