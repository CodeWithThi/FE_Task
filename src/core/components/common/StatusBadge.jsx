import { statusLabels, projectStatusLabels, projectStatusStyles } from '@/models';
import { cn } from '@core/lib/utils';
const statusStyles = {
  'not-assigned': 'badge-pending',
  'in-progress': 'badge-in-progress',
  'waiting-approval': 'badge-waiting',
  'returned': 'badge-returned',
  'completed': 'badge-completed',
  'overdue': 'badge-overdue',
};
export function StatusBadge({ status, className }) {
  return (<span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200', statusStyles[status], className)}>
    {statusLabels[status]}
  </span>);
}

