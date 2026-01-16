import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@core/components/ui/dialog';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Label } from '@core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@core/components/ui/select';
import { Calendar } from '@core/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@core/components/ui/popover';
import { CalendarIcon, ListTodo, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@core/lib/utils';
export function TaskFormModal({ open, onOpenChange, type, onSubmit, accounts = [], departments = [], projects = [], initialData, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    deadline: initialData?.deadline,
    assigneeId: initialData?.assigneeId || '',
    departmentId: initialData?.departmentId || '',
    projectId: initialData?.projectId || '',
  });

  // Sync state with props
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        title: initialData?.title || '',
        description: initialData?.description || '',
        priority: initialData?.priority || 'medium',
        deadline: initialData?.deadline,
        assigneeId: initialData?.assigneeId || '',
        departmentId: initialData?.departmentId || '',
        projectId: initialData?.projectId || '',
      }));
    }
  }, [open, initialData]);

  const isMainTask = type === 'main-task';

  // Filter accounts based on role
  // Assuming leaders are any non-user role or specifically manager/admin/pmo/sep
  // Adjust logic as needed. For now: Leaders != 'user'
  // Helper to identify standard user/staff roles
  // Helper to identify standard user/staff roles
  const isStaffRole = (r, name = '') => {
    const role = (r || '').toLowerCase();
    const cleanName = (name || '').toLowerCase();

    const staffKeywords = ['user', 'staff', 'member', 'nhân viên', 'thành viên', 'giảng viên', 'gv', 'teacher', 'giáo viên'];
    // Check if role contains any keyword
    if (staffKeywords.some(k => role.includes(k))) return true;

    // Also check name convention (e.g., starts with "GV")
    if (cleanName.startsWith('gv') || cleanName.startsWith('giảng viên')) return true;

    return false;
  };

  const leaders = accounts.filter(a => !isStaffRole(a.role, a.name) && a.status === 'active');
  const staff = accounts.filter(a => isStaffRole(a.role, a.name) && a.status === 'active');

  // Main Task -> Assign to Leader
  // Subtask -> Assign to Staff (or anyone really, but logically Staff)
  // If no leaders found, fallback to all accounts to prevent blocking
  const assignees = isMainTask
    ? (leaders.length > 0 ? leaders : accounts.filter(a => a.status === 'active'))
    : staff;
  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.projectId)
      return;
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      deadline: undefined,
      assigneeId: '',
      departmentId: '',
    });
    onOpenChange(false);
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {isMainTask ? (<ListTodo className="w-5 h-5 text-primary" />) : (<Plus className="w-5 h-5 text-primary" />)}
          </div>
          <div>
            <DialogTitle>
              {mode === 'edit'
                ? 'Cập nhật Công việc'
                : (isMainTask ? 'Tạo Công việc chính' : 'Tạo Việc nhỏ')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'edit'
                ? 'Thay đổi thông tin công việc'
                : (isMainTask
                  ? 'Tạo công việc chính và gán cho Trưởng nhóm phụ trách'
                  : 'Tạo công việc con và phân công cho nhân viên')}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề công việc *</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nhập tiêu đề công việc..." />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả chi tiết</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả nội dung công việc..." rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label>Độ ưu tiên</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Cao
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Trung bình
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Thấp
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Hạn chót</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.deadline && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline
                    ? format(formData.deadline, 'dd/MM/yyyy', { locale: vi })
                    : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.deadline} onSelect={(date) => setFormData({ ...formData, deadline: date })} initialFocus locale={vi} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Project Selection (Required) */}
        <div className="space-y-2">
          <Label>Dự án *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            disabled={!!initialData?.projectId || mode === 'edit'} // Lock if passed initially or editing
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn dự án" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((proj) => (
                <SelectItem key={proj.id} value={proj.id}>
                  {proj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Selection Removed per user request (Auto-inherited from Project) */}

        {/* Assignee */}
        <div className="space-y-2">
          <Label>{isMainTask ? 'Gán cho Trưởng nhóm' : 'Phân công Nhân viên'}</Label>
          <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}>
            <SelectTrigger>
              <SelectValue placeholder={isMainTask ? 'Chọn Trưởng nhóm' : 'Chọn Nhân viên'} />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((person) => (<SelectItem key={person.id} value={person.id}>
                <span className="flex flex-col">
                  <span>{person.name}</span>
                  <span className="text-xs text-muted-foreground">{person.department}</span>
                </span>
              </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
          {mode === 'edit' ? 'Lưu thay đổi' : (isMainTask ? 'Tạo việc chính' : 'Tạo việc nhỏ')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
}

