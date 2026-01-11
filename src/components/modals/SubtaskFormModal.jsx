import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { priorityLabels } from '@/types';
import { memberService } from '@/services/memberService';

export function SubtaskFormModal({ open, onOpenChange, onSubmit, mainTaskTitle }) {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    deadline: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchStaff();
    }
  }, [open]);

  const fetchStaff = async () => {
    try {
      const res = await memberService.getAllMembers();
      if (res.ok) {
        setStaff(res.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên subtask';
    }
    if (!formData.assigneeId) {
      newErrors.assigneeId = 'Vui lòng chọn nhân viên thực hiện';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn deadline';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      assigneeId: '',
      deadline: '',
      priority: 'medium',
    });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Thêm Subtask mới</DialogTitle>
          {mainTaskTitle && (
            <DialogDescription>
              Main Task: {mainTaskTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tên Subtask <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Nhập tên subtask"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả ngắn</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết công việc..."
              rows={3}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>
              Giao cho nhân viên <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => {
                setFormData({ ...formData, assigneeId: value });
                if (errors.assigneeId) setErrors({ ...errors, assigneeId: '' });
              }}
            >
              <SelectTrigger className={errors.assigneeId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeId && (
              <p className="text-sm text-destructive">{errors.assigneeId}</p>
            )}
          </div>

          {/* Deadline & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => {
                  setFormData({ ...formData, deadline: e.target.value });
                  if (errors.deadline) setErrors({ ...errors, deadline: '' });
                }}
                className={errors.deadline ? 'border-destructive' : ''}
              />
              {errors.deadline && (
                <p className="text-sm text-destructive">{errors.deadline}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Mức độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit">Tạo Subtask</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
