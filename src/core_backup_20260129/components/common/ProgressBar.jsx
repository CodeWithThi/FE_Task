import { cn } from '@core/lib/utils';
export function ProgressBar({ value, showLabel = true, size = 'md', className, }) {
    const clampedValue = Math.min(100, Math.max(0, value));
    const sizeStyles = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };
    // Màu xanh lá làm màu chính
    // Dưới 30%: Vàng/Cam - Trên 70%: Xanh lá đậm
    const getColorClass = () => {
        if (clampedValue < 30)
            return 'bg-progress-low'; // Vàng/Cam
        if (clampedValue < 70)
            return 'bg-progress-medium'; // Xanh lá nhạt
        return 'bg-progress-high'; // Xanh lá đậm
    };
    return (<div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', sizeStyles[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500', getColorClass())} style={{ width: `${clampedValue}%` }}/>
      </div>
      {showLabel && (<span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
          {clampedValue}%
        </span>)}
    </div>);
}
// Chú thích màu độ tiến độ
export function ProgressLegend() {
    return (<div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-progress-low"/>
        <span>Dưới 30%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-progress-medium"/>
        <span>30% - 70%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-progress-high"/>
        <span>Trên 70%</span>
      </div>
    </div>);
}
// Chú thích màu độ ưu tiên
export function PriorityLegend() {
    return (<div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-priority-high"/>
        <span>Cao</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-priority-medium"/>
        <span>Trung bình</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-priority-low"/>
        <span>Thấp</span>
      </div>
    </div>);
}

