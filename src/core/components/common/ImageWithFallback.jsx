import { useState } from 'react';
import { cn } from '@core/lib/utils';

/**
 * ImageWithFallback - Component hình ảnh với:
 * - Lazy loading (native browser)
 * - Placeholder fallback khi loading
 * - Fixed aspect ratio để tránh CLS
 * - Error fallback
 */
export function ImageWithFallback({
    src,
    alt,
    className,
    aspectRatio = '16/9',
    fallback,
    ...props
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    // Default fallback UI
    const FallbackContent = fallback || (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <svg
                className="w-12 h-12 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
        </div>
    );

    return (
        <div
            className={cn(
                'relative overflow-hidden bg-muted',
                className
            )}
            style={{ aspectRatio }}
        >
            {/* Loading skeleton */}
            {isLoading && !hasError && (
                <div
                    className="absolute inset-0 bg-muted animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* Error fallback */}
            {hasError && FallbackContent}

            {/* Actual image */}
            {!hasError && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        isLoading ? 'opacity-0' : 'opacity-100'
                    )}
                    {...props}
                />
            )}
        </div>
    );
}

/**
 * Avatar component với lazy loading
 */
export function LazyAvatar({
    src,
    alt,
    size = 40,
    className,
    fallbackInitial,
}) {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div
                className={cn(
                    'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold',
                    className
                )}
                style={{ width: size, height: size }}
            >
                {fallbackInitial || '?'}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            width={size}
            height={size}
            className={cn('rounded-full object-cover', className)}
            onError={() => setHasError(true)}
        />
    );
}
