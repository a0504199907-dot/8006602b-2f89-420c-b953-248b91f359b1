import { useState, useRef, useEffect, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Load immediately without lazy loading
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image Component
 * - Lazy loading with IntersectionObserver
 * - Blur placeholder while loading
 * - Error fallback
 * - Native loading="lazy" as fallback
 */
function OptimizedImageComponent({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback image for errors
  const fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eתמונה לא זמינה%3C/text%3E%3C/svg%3E';

  // Placeholder styles
  const placeholderClass = placeholder === 'blur' && !isLoaded ?
  'bg-muted animate-pulse' :
  '';

  return (
    <div data-ev-id="ev_798c90954e"
    ref={imgRef}
    className={`relative overflow-hidden ${placeholderClass} ${className}`}
    style={{ width, height }}>

      {isInView &&
      <img data-ev-id="ev_7f263cbe32"
      src={hasError ? fallbackSrc : src}
      alt={alt}
      className={`w-full h-full object-cover transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'}`
      }
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      width={width}
      height={height} />

      }
    </div>);

}

export const OptimizedImage = memo(OptimizedImageComponent);
export default OptimizedImage;