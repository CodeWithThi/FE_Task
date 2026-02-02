import { cn } from '@core/lib/utils';

/**
 * ProgressBar - Thanh tiến độ với màu sắc theo phần trăm
 * - < 25%: Đỏ (nguy hiểm/chậm)
 * - 25% - 50%: Vàng (cần chú ý)
 * - 50% - 75%: Cam (đang tiến triển)
 * - >= 75%: Xanh lục (tốt/gần hoàn thành)
 */
export function ProgressBar({ value, showLabel = true, size = 'md', className, labelInside = false }) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  // Size styles - tăng chiều cao
  const sizeStyles = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  // Màu sắc theo phần trăm mới
  const getColorClass = () => {
    if (clampedValue < 25) return 'bg-red-500';      // Đỏ - Nguy hiểm
    if (clampedValue < 50) return 'bg-yellow-500';   // Vàng - Cần chú ý
    if (clampedValue < 75) return 'bg-orange-500';   // Cam - Đang tiến triển
    return 'bg-green-500';                           // Xanh lục - Tốt
  };

  // Gradient version cho đẹp hơn
  const getGradientClass = () => {
    if (clampedValue < 25) return 'bg-gradient-to-r from-red-600 to-red-400';
    if (clampedValue < 50) return 'bg-gradient-to-r from-yellow-600 to-yellow-400';
    if (clampedValue < 75) return 'bg-gradient-to-r from-orange-600 to-orange-400';
    return 'bg-gradient-to-r from-green-600 to-green-400';
  };

  // Label inside mode - chữ % nằm giữa thanh
  if (labelInside || size === 'lg') {
    return (
      <div className={cn('relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizeStyles[size], className)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 flex items-center justify-center', getGradientClass())}
          style={{ width: `${Math.max(clampedValue, 15)}%` }}
        >
          {showLabel && clampedValue > 0 && (
            <span className="text-xs font-bold text-white drop-shadow-sm">
              {clampedValue}%
            </span>
          )}
        </div>
        {showLabel && clampedValue === 0 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-500">
            0%
          </span>
        )}
      </div>
    );
  }

  // Default mode - label bên ngoài
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getGradientClass())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
// Chú thích màu độ tiến độ - Updated to match new 4-tier system
export function ProgressLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span>Dưới 25%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <span>25% - 50%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span>50% - 75%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span>Trên 75%</span>
      </div>
    </div>
  );
}
// Chú thích màu độ ưu tiên
export function PriorityLegend() {
  return (<div className="flex items-center gap-4 text-xs text-muted-foreground">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-priority-high" />
      <span>Cao</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-priority-medium" />
      <span>Trung bình</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-priority-low" />
      <span>Thấp</span>
    </div>
  </div>);
}

