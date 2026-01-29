import { cn } from '@core/lib/utils';

/**
 * PageHeader - Component tiêu đề trang với Visual Hierarchy
 * 
 * Quy tắc SEO: Mỗi trang chỉ có 1 H1 duy nhất chứa từ khóa chính.
 * Component này render H1 mặc định, có thể override với headingLevel prop.
 */
export function PageHeader({
  title,
  description,
  actions,
  headingLevel = 'h1',
  className
}) {
  // Dynamic heading element
  const HeadingTag = headingLevel;

  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8',
        className
      )}
      aria-label="Page header"
    >
      <div className="min-w-0 space-y-1">
        <HeadingTag className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          {title}
        </HeadingTag>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap"
          role="toolbar"
          aria-label="Page actions"
        >
          {actions}
        </div>
      )}
    </header>
  );
}
