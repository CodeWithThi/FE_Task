import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@core/components/ui/dialog';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Label } from '@core/components/ui/label';
import { Badge } from '@core/components/ui/badge';
import { Checkbox } from '@core/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@core/components/ui/select';
import { Calendar } from '@core/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@core/components/ui/popover';
import { CalendarIcon, ListTodo, Plus, X, User } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@core/lib/utils';
export function TaskFormModal({ open, onOpenChange, type, onSubmit, accounts = [], departments = [], projects = [], initialData, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
    deadline: initialData?.deadline ? new Date(initialData.deadline) : undefined,
    assigneeId: initialData?.assigneeId || '',
    memberIds: initialData?.memberIds || (initialData?.assigneeId ? [initialData.assigneeId] : []),
    departmentId: initialData?.departmentId || '',
    projectId: initialData?.projectId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with props
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        title: initialData?.title || '',
        description: initialData?.description || '',
        priority: initialData?.priority || 'medium',
        startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
        deadline: initialData?.deadline ? new Date(initialData.deadline) : undefined,
        assigneeId: initialData?.assigneeId || '',
        memberIds: initialData?.memberIds || (initialData?.assigneeId ? [initialData.assigneeId] : []),
        departmentId: initialData?.departmentId || '',
        projectId: initialData?.projectId || '',
      }));
    }
  }, [open, initialData]);


  const isMainTask = type === 'main-task';

  // Get selected project's department
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const projectDepartmentId = selectedProject?.departmentId || selectedProject?.D_ID;

  // Helper to extract department ID from account (handles various backend structures)
  const getAccountDepartmentId = (account) => {
    return account.departmentId
      || account.D_ID
      || account.Department?.D_ID
      || account.Member?.D_ID
      || account.Member?.Department?.D_ID
      || null;
  };

  // Filter accounts by project's department (if project selected)
  // Strictly filter - only show employees from the project's department
  const assignees = (() => {
    const activeAccounts = accounts.filter(a =>
      (a.status === 'active' || a.Status === 'active' || a.Status === 'Active')
    );

    // DEBUG: Log data structure when project is selected
    if (formData.projectId && accounts.length > 0) {
      console.log('DEBUG TaskFormModal filter:', {
        projectId: formData.projectId,
        projectDepartmentId,
        selectedProject,
        totalAccounts: accounts.length,
        activeAccounts: activeAccounts.length,
        sampleAccountDeptIds: activeAccounts.slice(0, 5).map(a => ({
          name: a.name || a.UserName || a.FullName,
          deptId: getAccountDepartmentId(a),
          raw: { departmentId: a.departmentId, D_ID: a.D_ID, Department: a.Department, Member: a.Member }
        }))
      });
    }

    // If no project selected, show all active accounts
    if (!formData.projectId) {
      return activeAccounts;
    }

    // If project selected but no department ID (data issue), show all active accounts
    if (!projectDepartmentId) {
      console.warn('Project selected but no departmentId found:', selectedProject);
      return activeAccounts;
    }

    // Strictly filter by project's department
    const filtered = activeAccounts.filter(a => {
      const accDeptId = getAccountDepartmentId(a);
      return accDeptId === projectDepartmentId;
    });

    console.log('DEBUG: Filtered result:', filtered.length, 'accounts match department', projectDepartmentId);
    return filtered;
  })();

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.projectId)
      return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        // Ensure assigneeId is set to the first member (primary) or empty
        assigneeId: formData.memberIds && formData.memberIds.length > 0 ? formData.memberIds[0] : ''
      });
      // Do NOT close here. Let parent handle success/failure and close via prop.
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.startDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(formData.startDate, 'dd/MM/yyyy', { locale: vi })
                    : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.startDate} onSelect={(date) => setFormData({ ...formData, startDate: date })} initialFocus locale={vi} />
              </PopoverContent>
            </Popover>
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

        {/* Assignee - Multi Select */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>Người thực hiện</span>
            {formData.memberIds?.length > 0 && (
              <span className="text-xs text-muted-foreground">{formData.memberIds.length} người được chọn</span>
            )}
          </Label>

          <div className="border rounded-md p-3 space-y-3">
            {/* Selected Members Badges */}
            {formData.memberIds?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.memberIds.map(id => {
                  const member = assignees.find(a => (a.id || a.M_ID) === id) || accounts.find(a => (a.id || a.M_ID) === id);
                  const memberName = member ? (member.name || member.UserName || member.FullName) : 'Unknown';
                  return member ? (
                    <Badge key={id} variant="secondary" className="pl-2 pr-1 h-7 flex items-center gap-1">
                      <span>{memberName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => {
                          const newIds = formData.memberIds.filter(mId => mId !== id);
                          setFormData({ ...formData, memberIds: newIds, assigneeId: newIds[0] || '' });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* List Selection */}
            <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
              {assignees.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center bg-muted/30 rounded-md">
                  {formData.projectId
                    ? 'Không có nhân viên nào trong phòng ban này'
                    : 'Vui lòng chọn dự án để xem danh sách nhân viên'}
                </div>
              ) : (
                assignees.map((person) => {
                  const personId = person.id || person.M_ID;
                  const personName = person.name || person.UserName || person.FullName;
                  const personDept = person.department || person.Department?.D_Name || 'Chưa có phòng ban';
                  const isSelected = formData.memberIds?.includes(personId);
                  return (
                    <div
                      key={personId}
                      className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        const currentIds = formData.memberIds || [];
                        const newIds = isSelected
                          ? currentIds.filter(id => id !== personId)
                          : [...currentIds, personId];
                        setFormData({ ...formData, memberIds: newIds, assigneeId: newIds[0] || '' });
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => { }} // Handle click on div
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{personName}</span>
                        <span className="text-xs text-muted-foreground">{personDept}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.title.trim() || isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : (mode === 'edit' ? 'Lưu thay đổi' : (isMainTask ? 'Tạo việc chính' : 'Tạo việc nhỏ'))}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
}

