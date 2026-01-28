import { Loader2 } from "lucide-react";

/**
 * LoadingScreen - Screen loading với skeleton UI
 * 
 * Giảm CLS (Cumulative Layout Shift) bằng cách hiển thị
 * skeleton placeholders thay vì spinner đơn giản.
 */
export function LoadingScreen({ variant = 'full' }) {
    if (variant === 'skeleton') {
        // Skeleton variant cho page content
        return (
            <div className="animate-pulse space-y-6 p-4 md:p-6">
                {/* Header skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-muted rounded" />
                        <div className="h-4 w-48 bg-muted rounded" />
                    </div>
                    <div className="h-10 w-32 bg-muted rounded" />
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-muted rounded-lg" />
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 h-80 bg-muted rounded-lg" />
                    <div className="h-80 bg-muted rounded-lg" />
                </div>
            </div>
        );
    }

    // Default: Fullscreen loader
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-background"
            role="status"
            aria-label="Đang tải"
        >
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        </div>
    );
}

/**
 * ContentSkeleton - Skeleton inline cho content areas
 */
export function ContentSkeleton({ className }) {
    return (
        <div className={`animate-pulse space-y-4 ${className || ''}`}>
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-5/6" />
        </div>
    );
}

/**
 * CardSkeleton - Skeleton cho card components
 */
export function CardSkeleton({ count = 1 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-28 bg-muted rounded-lg animate-pulse"
                    aria-hidden="true"
                />
            ))}
        </div>
    );
}
