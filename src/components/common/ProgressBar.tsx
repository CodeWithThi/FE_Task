import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const getColorClass = () => {
    if (clampedValue >= 100) return 'bg-status-completed';
    if (clampedValue >= 70) return 'bg-primary';
    if (clampedValue >= 40) return 'bg-status-pending';
    return 'bg-status-overdue';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColorClass())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
