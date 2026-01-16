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
import { SubtaskFormModal } from '@/components/modals/SubtaskFormModal';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@core/components/ui/dialog';
import { ArrowLeft, Calendar, FileText, Upload, Send, CheckCircle2, XCircle, RefreshCw, Clock, Building2, Paperclip, Plus, LayoutGrid, ListTodo, } from 'lucide-react';
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

  // Dialog states
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTaskById(id);
        if (response.ok) {
          setTask(response.data);
        }
      } catch (error) {
        toast.error('Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  // Fetch staff when task department is available
  useEffect(() => {
    if (task?.departmentId) {
      const fetchStaff = async () => {
        try {
          const response = await userService.getUsers({ departmentId: task.departmentId, limit: 100 });
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

  const isStaff = user?.role === 'staff';
  const isLeader = user?.role === 'leader';

  const handleCreateSubtask = async (data) => {
    try {
      // Prepare subtask data with parent task ID
      const subtaskData = {
        ...data,
        projectId: task.projectId,
        parentTaskId: task.id,
        // Map assigneeIds to single assigneeId for now (backend limitation)
        assigneeId: data.assigneeIds && data.assigneeIds.length > 0 ? data.assigneeIds[0] : null
      };

      const response = await taskService.createTask(subtaskData);
      if (response.ok) {
        toast.success('Tạo việc nhỏ thành công!');
        setShowSubtaskModal(false);
        // Refresh task to show new subtask
        const updatedTask = await taskService.getTaskById(id);
        if (updatedTask.ok) {
          setTask(updatedTask.data);
        }
      } else {
        toast.error(response.message || 'Tạo việc nhỏ thất bại');
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Lỗi khi tạo việc nhỏ');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!task) return <div>Không tìm thấy công việc</div>;

  const mockTask = task; // Alias to minimize refactor of render code


  return (<div>
    <Button variant="ghost" className="mb-4" onClick={() => navigate('/tasks')}>
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

        {/* Subtasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Việc nhỏ ({task.subtasks?.length || 0})
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/tasks-board')}>
                <LayoutGrid className="w-4 h-4 mr-1" />
                Bảng
              </Button>
              {permissions?.canCreateSubtask && (<Button size="sm" variant="outline" onClick={() => setShowSubtaskModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm việc nhỏ
              </Button>)}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {(!task.subtasks || task.subtasks.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground">
                  Chưa có việc nhỏ nào
                </div>
              ) : (
                task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const newStatus = subtask.status === 'completed' ? 'in-progress' : 'completed';
                            const response = await taskService.updateTask(subtask.id, { status: newStatus });
                            if (response.ok) {
                              toast.success(newStatus === 'completed' ? 'Đã hoàn thành việc nhỏ!' : 'Đã đánh dấu chưa hoàn thành');
                              // Refresh task data
                              const updatedTask = await taskService.getTaskById(id);
                              if (updatedTask.ok) {
                                setTask(updatedTask.data);
                              }
                            }
                          } catch (error) {
                            toast.error('Lỗi khi cập nhật trạng thái');
                          }
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${subtask.status === 'completed'
                          ? 'bg-status-completed border-status-completed'
                          : 'border-muted-foreground hover:border-primary'}`}
                      >
                        {subtask.status === 'completed' && (<CheckCircle2 className="w-3 h-3 text-white" />)}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {subtask.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subtask.assignee?.name || 'Chưa gán'} • Hạn: {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={subtask.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Tài liệu đính kèm ({mockFiles.length})
            </CardTitle>
            {isStaff && (<Button size="sm" variant="outline">
              <Upload className="w-4 h-4 mr-1" />
              Tải lên
            </Button>)}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockFiles.map((file) => (<div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.size} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Nhật ký hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockActivityLog.map((log) => (<div key={log.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-sm">{log.user}</span>
                    <span className="text-sm text-muted-foreground"> {log.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              </div>))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - 30% */}
      <div className="space-y-6">
        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thao tác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Staff actions */}
            {isStaff && mockTask.status === 'not-assigned' && (<>
              <Button className="w-full" onClick={() => setShowAcceptDialog(true)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Nhận việc
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowRejectDialog(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </>)}

            {isStaff && mockTask.status === 'in-progress' && (<>
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Cập nhật tiến độ
              </Button>
              <Button className="w-full" onClick={() => setShowSubmitDialog(true)}>
                <Send className="w-4 h-4 mr-2" />
                Gửi duyệt
              </Button>
            </>)}

            {/* Leader actions */}
            {isLeader && mockTask.status === 'waiting-approval' && (<>
              <Button className="w-full" onClick={() => setShowApproveDialog(true)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Phê duyệt
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowReturnDialog(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Trả lại
              </Button>
            </>)}

            {isLeader && (<Button variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Chuyển giao
            </Button>)}

            {/* No actions available message */}
            {!isStaff && !isLeader && (<p className="text-sm text-muted-foreground text-center py-4">
              Bạn chỉ có quyền xem công việc này
            </p>)}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Người thực hiện</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {mockTask.assignee?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{mockTask.assignee?.name || 'Chưa phân công'}</p>
                  <p className="text-xs text-muted-foreground">{mockTask.assignee?.department || 'Chưa gán phòng ban'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Phòng ban chủ trì</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{mockTask.departmentName || mockTask.departmentId || 'Chưa gán'}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Phòng ban phối hợp</p>
              <div className="flex flex-wrap gap-2">
                {(mockTask.cooperatingDepts || []).map((dept) => (<span key={dept} className="text-xs bg-muted px-2 py-1 rounded">
                  {dept}
                </span>))}
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
                <p className="text-sm text-muted-foreground mb-1">Hạn chót</p>
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
        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Lý do từ chối..." rows={4} />
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
            Xác nhận gửi công việc để Trưởng nhóm phê duyệt?
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
            Xác nhận phê duyệt công việc này?
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
            Vui lòng nhập lý do trả lại công việc này.
          </DialogDescription>
        </DialogHeader>
        <Textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Lý do trả lại..." rows={4} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Hủy</Button>
          <Button variant="destructive" onClick={() => setShowReturnDialog(false)}>Trả lại</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <SubtaskFormModal
      open={showSubtaskModal}
      onOpenChange={setShowSubtaskModal}
      onSubmit={handleCreateSubtask}
      mainTaskTitle={mockTask.title}
      staff={staff}
    />
  </div>);
}

