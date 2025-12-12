import { TaskStatus, statusLabels } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusStyles: Record<TaskStatus, string> = {
  pending: 'badge-pending',
  'in-progress': 'badge-in-progress',
  'waiting-approval': 'badge-waiting',
  completed: 'badge-completed',
  overdue: 'badge-overdue',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
