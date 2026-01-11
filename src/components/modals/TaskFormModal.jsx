import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ListTodo, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
export function TaskFormModal({ open, onOpenChange, type, onSubmit, accounts = [], departments = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: undefined,
    assigneeId: '',
    departmentId: '',
  });

  const isMainTask = type === 'main-task';

  // Filter accounts based on role
  // Assuming leaders are any non-user role or specifically manager/admin/pmo/sep
  // Adjust logic as needed. For now: Leaders != 'user'
  const leaders = accounts.filter(a => a.role !== 'user' && a.status === 'active');
  const staff = accounts.filter(a => a.role === 'user' && a.status === 'active');

  const assignees = isMainTask ? leaders : staff;
  const handleSubmit = () => {
    if (!formData.title.trim())
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
              {isMainTask ? 'Tạo Main Task' : 'Tạo Subtask'}
            </DialogTitle>
            <DialogDescription>
              {isMainTask
                ? 'Tạo công việc chính và gán cho Leader phụ trách'
                : 'Tạo công việc con và phân công cho nhân viên'}
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
            <Label>Deadline</Label>
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

        {/* Department (for Main Task) */}
        {isMainTask && (<div className="space-y-2">
          <Label>Phòng ban phụ trách</Label>
          <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>))}
            </SelectContent>
          </Select>
        </div>)}

        {/* Assignee */}
        <div className="space-y-2">
          <Label>{isMainTask ? 'Gán cho Leader' : 'Phân công Nhân viên'}</Label>
          <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}>
            <SelectTrigger>
              <SelectValue placeholder={isMainTask ? 'Chọn Leader' : 'Chọn Nhân viên'} />
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
          {isMainTask ? 'Tạo Main Task' : 'Tạo Subtask'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
}
