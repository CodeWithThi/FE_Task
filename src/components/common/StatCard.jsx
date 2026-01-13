import { cn } from '@/lib/utils';
const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary/5 border-primary/20',
  success: 'bg-status-completed-bg border-status-completed/20',
  warning: 'bg-status-pending-bg border-status-pending/20',
  danger: 'bg-status-overdue-bg border-status-overdue/20',
};
const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-status-completed/10 text-status-completed',
  warning: 'bg-status-pending/10 text-status-pending',
  danger: 'bg-status-overdue/10 text-status-overdue',
};
export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className, onClick, }) {
  return (<div
    onClick={onClick}
    className={cn(
      'rounded-xl border p-5 card-hover transition-all',
      variantStyles[variant],
      onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
      className
    )}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (<p className={cn('text-xs mt-1', trend.isPositive ? 'text-status-completed' : 'text-status-overdue')}>
          {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% so với tuần trước
        </p>)}
      </div>
      <div className={cn('p-3 rounded-lg', iconVariantStyles[variant])}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>);
}
