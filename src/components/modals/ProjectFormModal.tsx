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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => void;
  initialData?: ProjectFormData;
  mode?: 'create' | 'edit';
}

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  departments: string[];
}

const mockDepartments = [
  { id: '1', name: 'Phòng Đào tạo' },
  { id: '2', name: 'Phòng Marketing' },
  { id: '3', name: 'Phòng IT' },
  { id: '4', name: 'Phòng Hành chính' },
  { id: '5', name: 'Phòng Kế toán' },
];

export function ProjectFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create',
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      name: '',
      description: '',
      startDate: undefined,
      endDate: undefined,
      departments: [],
    }
  );

  const handleDepartmentToggle = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.includes(deptId)
        ? prev.departments.filter((id) => id !== deptId)
        : [...prev.departments, deptId],
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        startDate: undefined,
        endDate: undefined,
        departments: [],
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {mode === 'create' ? 'Tạo Dự án mới' : 'Chỉnh sửa Dự án'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Nhập thông tin để tạo dự án mới'
                  : 'Cập nhật thông tin dự án'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên dự án *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên dự án..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả dự án</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về dự án..."
              rows={3}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-3">
            <Label>Phòng ban tham gia</Label>
            <div className="grid grid-cols-2 gap-2">
              {mockDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleDepartmentToggle(dept.id)}
                >
                  <Checkbox
                    id={dept.id}
                    checked={formData.departments.includes(dept.id)}
                    onCheckedChange={() => handleDepartmentToggle(dept.id)}
                  />
                  <label
                    htmlFor={dept.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {dept.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {mode === 'create' ? 'Tạo Dự án' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
