import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ListTodo, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'main-task' | 'subtask';
  projectId?: string;
  mainTaskId?: string;
  onSubmit: (data: TaskFormData) => void;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline: Date | undefined;
  assigneeId?: string;
  departmentId?: string;
}

const mockLeaders = [
  { id: '1', name: 'Nguyễn Văn A', department: 'Phòng Đào tạo' },
  { id: '2', name: 'Trần Thị B', department: 'Phòng Marketing' },
  { id: '3', name: 'Lê Văn C', department: 'Phòng IT' },
];

const mockStaff = [
  { id: '4', name: 'Phạm Văn D', department: 'Phòng Đào tạo' },
  { id: '5', name: 'Hoàng Thị E', department: 'Phòng Marketing' },
  { id: '6', name: 'Vũ Văn F', department: 'Phòng IT' },
];

const mockDepartments = [
  { id: '1', name: 'Phòng Đào tạo' },
  { id: '2', name: 'Phòng Marketing' },
  { id: '3', name: 'Phòng IT' },
  { id: '4', name: 'Phòng Hành chính' },
];

export function TaskFormModal({
  open,
  onOpenChange,
  type,
  onSubmit,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    deadline: undefined,
    assigneeId: '',
    departmentId: '',
  });

  const isMainTask = type === 'main-task';
  const assignees = isMainTask ? mockLeaders : mockStaff;

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {isMainTask ? (
                <ListTodo className="w-5 h-5 text-primary" />
              ) : (
                <Plus className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isMainTask ? 'Tạo Main Task' : 'Tạo Subtask'}
              </DialogTitle>
              <DialogDescription>
                {isMainTask 
                  ? 'Tạo công việc chính và gán cho Leader phụ trách'
                  : 'Tạo công việc con và phân công cho nhân viên'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề công việc *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề công việc..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả nội dung công việc..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setFormData({ ...formData, priority: value })
                }
              >
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
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.deadline && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline
                      ? format(formData.deadline, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData({ ...formData, deadline: date })}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Department (for Main Task) */}
          {isMainTask && (
            <div className="space-y-2">
              <Label>Phòng ban phụ trách</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignee */}
          <div className="space-y-2">
            <Label>{isMainTask ? 'Gán cho Leader' : 'Phân công Nhân viên'}</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={isMainTask ? 'Chọn Leader' : 'Chọn Nhân viên'} />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <span className="flex flex-col">
                      <span>{person.name}</span>
                      <span className="text-xs text-muted-foreground">{person.department}</span>
                    </span>
                  </SelectItem>
                ))}
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
    </Dialog>
  );
}
