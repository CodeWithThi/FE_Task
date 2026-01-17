import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@core/components/ui/dialog';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Label } from '@core/components/ui/label';
import { Calendar } from '@core/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@core/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select';
import { CalendarIcon, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@core/lib/utils';
import { departmentService } from '@core/services/departmentService';
import { userService } from '@core/services/userService';

export function ProjectFormModal({ open, onOpenChange, onSubmit, initialData, mode = 'edit' }) {
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    startDate: undefined,
    endDate: undefined,
    departmentId: '',
    managerId: '',
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
      // Sync formData with initialData when modal opens
      if (initialData) {
        setFormData(initialData);
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          description: '',
          startDate: undefined,
          endDate: undefined,
          departmentId: '',
        });
      }
    }
  }, [open, initialData]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res.ok) {
        setDepartments(res.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchMembers = async (departmentId) => {
    if (!departmentId) {
      setMembers([]);
      return;
    }
    try {
      const res = await userService.getUsers({ departmentId });
      if (res.ok) {
        setMembers(res.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Fetch members when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchMembers(formData.departmentId);
    } else {
      setMembers([]);
      setFormData(prev => ({ ...prev, managerId: '' }));
    }
  }, [formData.departmentId]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.departmentId || !formData.managerId)
      return;
    onSubmit(formData);
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        startDate: undefined,
        endDate: undefined,
        departmentId: '',
        managerId: '',
      });
    }
    onOpenChange(false);
  };

  return (<Dialog open={open} onOpenChange={onOpenChange}>
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
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nhập tên dự án..." />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả dự án</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả chi tiết về dự án..." rows={3} />
        </div>

        {/* Departments */}
        <div className="space-y-2">
          <Label>Phòng ban phụ trách *</Label>
          <Select
            value={formData.departmentId}
            onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.D_ID || dept.id} value={dept.D_ID || dept.id}>
                  {dept.D_Name || dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Member Assignment */}
        <div className="space-y-2">
          <Label>Giao cho *</Label>
          <Select
            value={formData.managerId}
            onValueChange={(value) => setFormData({ ...formData, managerId: value })}
            disabled={!formData.departmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.departmentId ? "Chọn người phụ trách" : "Chọn phòng ban trước"} />
            </SelectTrigger>
            <SelectContent>
              {members.length === 0 && formData.departmentId ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không có thành viên trong phòng ban này
                </div>
              ) : (
                members.map((member) => (
                  <SelectItem key={member.aid} value={member.aid}>
                    {member.member?.fullName || member.userName}
                    {member.member?.departmentName && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({member.member.departmentName})
                      </span>
                    )}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
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
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => {
                    if (date) date.setHours(12, 0, 0, 0);
                    setFormData({ ...formData, startDate: date });
                  }}
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
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.endDate && 'text-muted-foreground')}>
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
                  onSelect={(date) => {
                    if (date) date.setHours(12, 0, 0, 0);
                    setFormData({ ...formData, endDate: date });
                  }}
                  initialFocus
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.name.trim() || !formData.departmentId || !formData.managerId}>
          {mode === 'create' ? 'Tạo Dự án' : 'Lưu thay đổi'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
}

