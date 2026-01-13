import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { priorityLabels } from '@/models';

export function SubtaskFormModal({ open, onOpenChange, onSubmit, mainTaskTitle, staff = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeIds: [], // Changed to array for multiple assignees
    deadline: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});


  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên việc nhỏ';
    }
    if (!formData.assigneeIds || formData.assigneeIds.length === 0) {
      newErrors.assigneeIds = 'Vui lòng chọn ít nhất một nhân viên';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn hạn chót';
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
      assigneeIds: [],
      deadline: '',
      priority: 'medium',
    });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const toggleAssignee = (memberId) => {
    setFormData(prev => {
      const newAssigneeIds = prev.assigneeIds.includes(memberId)
        ? prev.assigneeIds.filter(id => id !== memberId)
        : [...prev.assigneeIds, memberId];
      return { ...prev, assigneeIds: newAssigneeIds };
    });
    if (errors.assigneeIds) setErrors({ ...errors, assigneeIds: '' });
  };

  const removeAssignee = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.filter(id => id !== memberId)
    }));
  };

  const getSelectedStaff = () => {
    return staff.filter(member => formData.assigneeIds.includes(member.id));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Thêm Việc nhỏ mới</DialogTitle>
          {mainTaskTitle && (
            <DialogDescription>
              Công việc chính: {mainTaskTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tên Việc nhỏ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Nhập tên việc nhỏ"
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

          {/* Assignee - Multi Select */}
          <div className="space-y-2">
            <Label>
              Giao cho nhân viên <span className="text-destructive">*</span>
            </Label>

            {/* Selected Staff Badges */}
            {getSelectedStaff().length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
                {getSelectedStaff().map((member) => (
                  <Badge key={member.id} variant="secondary" className="pr-1">
                    {member.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-destructive/10"
                      onClick={() => removeAssignee(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Staff Selection List */}
            <div className={`border rounded-md max-h-48 overflow-y-auto ${errors.assigneeIds ? 'border-destructive' : ''}`}>
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    id={`staff-${member.id}`}
                    checked={formData.assigneeIds.includes(member.id)}
                    onCheckedChange={() => toggleAssignee(member.id)}
                  />
                  <label
                    htmlFor={`staff-${member.id}`}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
              {staff.length === 0 && (
                <p className="text-sm text-muted-foreground p-3 text-center">
                  Không có nhân viên nào
                </p>
              )}
            </div>

            {errors.assigneeIds && (
              <p className="text-sm text-destructive">{errors.assigneeIds}</p>
            )}
          </div>

          {/* Deadline & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Hạn chót <span className="text-destructive">*</span>
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
            <Button type="submit">Tạo việc nhỏ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
