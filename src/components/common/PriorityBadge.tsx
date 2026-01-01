import { TaskPriority, priorityLabels } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200',
        priorityStyles[priority],
        className
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}
