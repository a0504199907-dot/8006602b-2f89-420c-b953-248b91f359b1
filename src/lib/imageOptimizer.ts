/**
 * Image Optimizer & CDN Utility
 * אופטימיזציה אוטומטית של תמונות
 */

// Image CDN providers configuration
const CDN_PROVIDERS = {
  // Cloudflare Images
  cloudflare: {
    baseUrl: 'https://imagedelivery.net',
    transform: (src: string, options: ImageOptions) => {
      const params = [];
      if (options.width) params.push(`w=${options.width}`);
      if (options.height) params.push(`h=${options.height}`);
      if (options.quality) params.push(`q=${options.quality}`);
      if (options.format) params.push(`f=${options.format}`);
      return `${src}?${params.join(',')}`;
    }
  },
  // imgproxy (self-hosted)
  imgproxy: {
    baseUrl: '/imgproxy',
    transform: (src: string, options: ImageOptions) => {
      const params = [];
      if (options.width) params.push(`w:${options.width}`);
      if (options.height) params.push(`h:${options.height}`);
      if (options.quality) params.push(`q:${options.quality}`);
      return `/imgproxy/${params.join('/')}/${btoa(src)}`;
    }
  },
  // wsrv.nl (free CDN)
  wsrv: {
    baseUrl: 'https://wsrv.nl',
    transform: (src: string, options: ImageOptions) => {
      const params = new URLSearchParams();
      params.set('url', src);
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format === 'webp') params.set('output', 'webp');
      params.set('fit', options.fit || 'cover');
      return `https://wsrv.nl/?${params.toString()}`;
    }
  }
};

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
  grayscale?: boolean;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  sizes: string;
  placeholder?: string;
}

// Default quality settings by image type
const DEFAULT_QUALITY = {
  thumbnail: 60,
  preview: 70,
  full: 85,
  hero: 90,
};

// Responsive breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Get optimized image URL using wsrv.nl CDN
 */
export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
  if (!src) return '';
  
  // Skip optimization for SVGs and data URLs
  if (src.startsWith('data:') || src.endsWith('.svg')) {
    return src;
  }
  
  // Skip if already optimized
  if (src.includes('wsrv.nl')) {
    return src;
  }
  
  // Use wsrv.nl as default CDN (free and reliable)
  return CDN_PROVIDERS.wsrv.transform(src, {
    quality: options.quality || DEFAULT_QUALITY.preview,
    format: options.format || 'webp',
    ...options,
  });
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  options: Omit<ImageOptions, 'width'> = {}
): string {
  if (!src) return '';
  
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(src, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(config: { default: string; breakpoints?: Record<string, string> }): string {
  const { breakpoints = {}, default: defaultSize } = config;
  
  const sizes = Object.entries(breakpoints)
    .map(([breakpoint, size]) => {
      const width = BREAKPOINTS[breakpoint as keyof typeof BREAKPOINTS];
      return width ? `(min-width: ${width}px) ${size}` : '';
    })
    .filter(Boolean)
    .join(', ');
  
  return sizes ? `${sizes}, ${defaultSize}` : defaultSize;
}

/**
 * Get full responsive image configuration
 */
export function getResponsiveImage(
  src: string,
  options: {
    widths?: number[];
    sizes?: { default: string; breakpoints?: Record<string, string> };
    quality?: number;
    format?: ImageOptions['format'];
  } = {}
): ResponsiveImage {
  const {
    widths = [320, 640, 768, 1024, 1280],
    sizes = { default: '100vw' },
    quality = DEFAULT_QUALITY.preview,
    format = 'webp',
  } = options;
  
  return {
    src: getOptimizedImageUrl(src, { width: widths[widths.length - 1], quality, format }),
    srcSet: generateSrcSet(src, widths, { quality, format }),
    sizes: generateSizes(sizes),
    placeholder: getOptimizedImageUrl(src, { width: 20, quality: 30, blur: 10 }),
  };
}

/**
 * Get thumbnail URL
 */
export function getThumbnail(src: string, size: number = 150): string {
  return getOptimizedImageUrl(src, {
    width: size,
    height: size,
    quality: DEFAULT_QUALITY.thumbnail,
    fit: 'cover',
  });
}

/**
 * Get hero image URL (high quality)
 */
export function getHeroImage(src: string, width: number = 1920): string {
  return getOptimizedImageUrl(src, {
    width,
    quality: DEFAULT_QUALITY.hero,
    format: 'webp',
  });
}

/**
 * Generate blur placeholder (tiny base64 image)
 */
export function getBlurPlaceholder(src: string): string {
  return getOptimizedImageUrl(src, {
    width: 10,
    quality: 20,
    blur: 5,
  });
}

/**
 * Check if WebP is supported
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return true;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if AVIF is supported
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgADlAgIDUAAAAAACgAAAAAAAQAAABsYXZjMC4xLjAA';
  });
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  urls.forEach((url) => {
    const optimizedUrl = getOptimizedImageUrl(url, { width: 1280, quality: 85 });
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
}

/**
 * Lazy load image with IntersectionObserver
 */
export function createLazyLoader(options: IntersectionObserverInit = {}): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        const srcset = img.dataset.srcset;
        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options,
  });
}

export default {
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  getResponsiveImage,
  getThumbnail,
  getHeroImage,
  getBlurPlaceholder,
  preloadCriticalImages,
};
