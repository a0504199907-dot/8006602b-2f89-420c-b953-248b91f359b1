/**
 * Image Preloader Utility
 * 
 * Preloads images in the background to ensure instant display when needed.
 * Uses both link preload and Image() for maximum browser compatibility.
 */

const preloadedUrls = new Set<string>();
const preloadQueue: string[] = [];
let isProcessingQueue = false;

/**
 * Preload a single image
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || preloadedUrls.has(src)) {
    return Promise.resolve();
  }

  preloadedUrls.add(src);

  return new Promise((resolve) => {
    // Method 1: Link preload (browser hint)
    if (typeof document !== 'undefined') {
      const existingLink = document.querySelector(`link[href="${src}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    }

    // Method 2: Image object (actual preload)
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't fail on error
    img.src = src;
  });
}

/**
 * Preload multiple images with priority queue
 */
export function preloadImages(sources: string[], priority: 'high' | 'low' = 'low'): void {
  const validSources = sources.filter(src => src && !preloadedUrls.has(src));
  
  if (priority === 'high') {
    // High priority: prepend to queue
    preloadQueue.unshift(...validSources);
  } else {
    // Low priority: append to queue
    preloadQueue.push(...validSources);
  }

  processQueue();
}

/**
 * Process the preload queue with controlled concurrency
 */
function processQueue(): void {
  if (isProcessingQueue || preloadQueue.length === 0) return;

  isProcessingQueue = true;
  const CONCURRENT_LOADS = 3;

  const loadNext = () => {
    const batch = preloadQueue.splice(0, CONCURRENT_LOADS);
    if (batch.length === 0) {
      isProcessingQueue = false;
      return;
    }

    Promise.all(batch.map(preloadImage)).then(() => {
      // Use requestIdleCallback for low-priority work
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadNext, { timeout: 2000 });
      } else {
        setTimeout(loadNext, 100);
      }
    });
  };

  loadNext();
}

/**
 * Preload hero/above-the-fold images immediately
 */
export function preloadHeroImages(sources: string[]): void {
  // These are critical - load immediately
  sources.forEach(src => {
    if (src && !preloadedUrls.has(src)) {
      preloadedUrls.add(src);
      const img = new Image();
      img.fetchPriority = 'high';
      img.src = src;
    }
  });
}

/**
 * Check if an image is already preloaded
 */
export function isPreloaded(src: string): boolean {
  return preloadedUrls.has(src);
}

/**
 * Clear preload cache (for memory management)
 */
export function clearPreloadCache(): void {
  preloadedUrls.clear();
}
