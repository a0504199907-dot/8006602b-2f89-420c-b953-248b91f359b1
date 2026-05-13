import { useState, useRef, useEffect, memo } from 'react';
import { getOptimizedImageUrl, getBlurPlaceholder, type ImageOptions } from '@/lib/imageOptimizer';

interface CDNImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  fit?: ImageOptions['fit'];
}

/**
 * Optimized Image Component with CDN support
 * - Automatic WebP conversion
 * - Lazy loading with IntersectionObserver
 * - Blur placeholder
 * - Error handling with fallback
 */
function CDNImageComponent({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 80,
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError,
  sizes,
  fit = 'cover'
}: CDNImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality, fit });
  const blurSrc = placeholder === 'blur' ? getBlurPlaceholder(src) : '';

  // Generate srcset for responsive images
  const srcSet = width ?
  [
  `${getOptimizedImageUrl(src, { width: Math.round(width * 0.5), quality })} ${Math.round(width * 0.5)}w`,
  `${getOptimizedImageUrl(src, { width, quality })} ${width}w`,
  `${getOptimizedImageUrl(src, { width: Math.round(width * 1.5), quality })} ${Math.round(width * 1.5)}w`,
  `${getOptimizedImageUrl(src, { width: width * 2, quality })} ${width * 2}w`].
  join(', ') :
  undefined;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Error fallback
  if (isError) {
    return (
      <div data-ev-id="ev_10700eb0c1"
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      style={{ width, height }}>

        <div data-ev-id="ev_ea54c676da" className="text-center text-gray-400 p-4">
          <span data-ev-id="ev_2c49492755" className="text-3xl block mb-2">🖼️</span>
          <span data-ev-id="ev_eb7d8c8ad4" className="text-xs">תמונה לא נטענה</span>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_251576f2bb"
    ref={imgRef}
    className={`relative overflow-hidden ${className}`}
    style={{ width, height }}>

      {/* Placeholder */}
      {placeholder === 'skeleton' && !isLoaded &&
      <div data-ev-id="ev_dee17695d6" className="absolute inset-0 bg-gray-200 animate-pulse" />
      }
      
      {placeholder === 'blur' && blurSrc && !isLoaded &&
      <img data-ev-id="ev_f120ad7bf9"
      src={blurSrc}
      alt=""
      className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
      aria-hidden="true" />

      }

      {/* Main Image */}
      {isInView &&
      <img data-ev-id="ev_c944fe1b06"
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={handleLoad}
      onError={handleError}
      className={`w-full h-full object-${fit} transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'}`
      } />

      }
    </div>);

}

export const CDNImage = memo(CDNImageComponent);
export default CDNImage;