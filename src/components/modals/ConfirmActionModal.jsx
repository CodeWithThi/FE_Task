import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@core/components/ui/alert-dialog';
import { Textarea } from '@core/components/ui/textarea';
import { Label } from '@core/components/ui/label';
import { CheckCircle, XCircle, Send, RotateCcw, UserPlus, AlertTriangle, Trash2 } from 'lucide-react';
const actionConfig = {
  delete: {
    title: 'Xóa Công việc',
    description: 'Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.',
    icon: Trash2,
    iconColor: 'text-red-500',
    buttonText: 'Xóa',
    buttonVariant: 'destructive',
    requireReason: false,
  },
  accept: {
    title: 'Xác nhận Nhận việc',
    description: 'Bạn có chắc chắn muốn nhận công việc này? Sau khi nhận, bạn sẽ chịu trách nhiệm hoàn thành đúng hạn.',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    buttonText: 'Nhận việc',
    buttonVariant: 'default',
    requireReason: false,
  },
  reject: {
    title: 'Từ chối Công việc',
    description: 'Vui lòng cung cấp lý do từ chối công việc này.',
    icon: XCircle,
    iconColor: 'text-red-500',
    buttonText: 'Từ chối',
    buttonVariant: 'destructive',
    requireReason: true,
    reasonLabel: 'Lý do từ chối *',
    reasonPlaceholder: 'Nhập lý do từ chối công việc...',
  },
  submit: {
    title: 'Gửi Trình duyệt',
    description: 'Bạn có chắc chắn muốn gửi công việc này để duyệt? Hãy đảm bảo đã hoàn thành đầy đủ.',
    icon: Send,
    iconColor: 'text-blue-500',
    buttonText: 'Gửi duyệt',
    buttonVariant: 'default',
    requireReason: false,
  },
  approve: {
    title: 'Phê duyệt Công việc',
    description: 'Xác nhận phê duyệt công việc này đã hoàn thành đạt yêu cầu.',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    buttonText: 'Phê duyệt',
    buttonVariant: 'default',
    requireReason: false,
  },
  return: {
    title: 'Trả lại Công việc',
    description: 'Vui lòng cung cấp lý do trả lại để nhân viên biết cần sửa chữa gì.',
    icon: RotateCcw,
    iconColor: 'text-orange-500',
    buttonText: 'Trả lại',
    buttonVariant: 'destructive',
    requireReason: true,
    reasonLabel: 'Lý do trả lại *',
    reasonPlaceholder: 'Nhập lý do trả lại và yêu cầu chỉnh sửa...',
  },
  transfer: {
    title: 'Chuyển giao Công việc',
    description: 'Chuyển giao công việc này cho người khác thực hiện.',
    icon: UserPlus,
    iconColor: 'text-purple-500',
    buttonText: 'Chuyển giao',
    buttonVariant: 'default',
    requireReason: true,
    reasonLabel: 'Lý do chuyển giao',
    reasonPlaceholder: 'Nhập lý do chuyển giao (không bắt buộc)...',
  },
};
export function ConfirmActionModal({ open, onOpenChange, actionType, taskTitle, onConfirm, }) {
  const [reason, setReason] = useState('');
  const config = actionConfig[actionType];
  const Icon = config.icon;
  const handleConfirm = () => {
    if (config.requireReason && actionType !== 'transfer' && !reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason('');
    onOpenChange(false);
  };
  const handleCancel = () => {
    setReason('');
    onOpenChange(false);
  };
  return (<AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
        </div>
        <AlertDialogDescription className="text-left">
          {taskTitle && (<p className="font-medium text-foreground mb-2">
            Công việc: "{taskTitle}"
          </p>)}
          {config.description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {config.requireReason && (<div className="space-y-2 py-2">
        <Label htmlFor="reason">{config.reasonLabel}</Label>
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={config.reasonPlaceholder} rows={3} className="resize-none" />
        {config.requireReason && actionType !== 'transfer' && !reason.trim() && (<p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Vui lòng nhập lý do
        </p>)}
      </div>)}

      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleCancel}>Hủy</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirm} className={config.buttonVariant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''} disabled={config.requireReason && actionType !== 'transfer' && !reason.trim()}>
          {config.buttonText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>);
}

