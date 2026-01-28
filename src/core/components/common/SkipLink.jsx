import { cn } from '@core/lib/utils';

/**
 * SkipLink - Accessibility component cho phép người dùng screen reader
 * và keyboard navigation bỏ qua menu điều hướng để đến nội dung chính.
 * 
 * WCAG 2.1 Level A compliance
 */
export function SkipLink({ targetId = 'main-content', className }) {
    return (
        <a
            href={`#${targetId}`}
            className={cn(
                // Ẩn mặc định, chỉ hiện khi focus
                'sr-only focus:not-sr-only',
                // Styling khi visible
                'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
                'focus:px-4 focus:py-2 focus:rounded-lg',
                'focus:bg-primary focus:text-primary-foreground',
                'focus:font-medium focus:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-all duration-200',
                className
            )}
        >
            Bỏ qua đến nội dung chính
        </a>
    );
}
