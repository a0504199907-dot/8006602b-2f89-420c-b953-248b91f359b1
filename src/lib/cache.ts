/**
 * Persistent Stale-While-Revalidate Cache
 * - Shows cached data IMMEDIATELY from localStorage
 * - Refreshes in background when stale
 * - Survives browser close/refresh
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// In-memory cache for instant access (faster than localStorage)
const memoryCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

// Cache timing - AGGRESSIVE for instant loading
const CACHE_FRESH = 24 * 60 * 60 * 1000;  // 24 hours - fresh
const CACHE_STALE = 48 * 60 * 60 * 1000;  // 48 hours - stale but usable
// After 48 hours - expired, must refetch

const STORAGE_PREFIX = 'swr_cache_';

/**
 * Get entry from localStorage
 */
function getFromStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) return null;
    return JSON.parse(stored) as CacheEntry<T>;
  } catch {
    return null;
  }
}

/**
 * Save entry to localStorage
 */
function saveToStorage<T>(key: string, entry: CacheEntry<T>): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    // Storage full - clear old entries and retry
    cleanupOldEntries();
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Still failed - continue with memory-only cache
      console.warn('localStorage full, using memory cache only');
    }
  }
}

/**
 * Remove entry from localStorage
 */
function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore errors
  }
}

/**
 * Clean up expired entries from localStorage
 */
function cleanupOldEntries(): void {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          if (now - entry.timestamp > CACHE_STALE) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key!);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignore cleanup errors
  }
}

// Run cleanup on load
if (typeof window !== 'undefined') {
  setTimeout(cleanupOldEntries, 5000);
}

/**
 * Get cached data - checks memory first, then localStorage
 * @returns { data, isStale } or null if no cache
 */
export function getCacheWithStatus<T>(key: string): { data: T; isStale: boolean } | null {
  // Check memory cache first (fastest)
  let entry = memoryCache.get(key);
  
  // If not in memory, try localStorage
  if (!entry) {
    entry = getFromStorage<T>(key);
    if (entry) {
      // Restore to memory for faster subsequent access
      memoryCache.set(key, entry);
    }
  }
  
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  
  // Completely expired - don't use
  if (age > CACHE_STALE) {
    memoryCache.delete(key);
    removeFromStorage(key);
    return null;
  }
  
  return {
    data: entry.data as T,
    isStale: age > CACHE_FRESH
  };
}

/**
 * Get cached data (simple version for backward compatibility)
 * Returns data even if stale - for instant display
 */
export function getCache<T>(key: string): T | null {
  const result = getCacheWithStatus<T>(key);
  return result?.data ?? null;
}

/**
 * Check if cache is fresh (no need to refetch)
 */
export function isCacheFresh(key: string): boolean {
  const result = getCacheWithStatus(key);
  return result !== null && !result.isStale;
}

/**
 * Store data in both memory and localStorage
 */
export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now()
  };
  
  // Save to memory (instant access)
  memoryCache.set(key, entry);
  
  // Save to localStorage (persistence)
  saveToStorage(key, entry);
}

/**
 * Clear specific cache entry from both memory and localStorage
 */
export function clearCache(key: string): void {
  memoryCache.delete(key);
  removeFromStorage(key);
}

/**
 * Clear all cache (memory and localStorage)
 */
export function clearAllCache(): void {
  memoryCache.clear();
  
  // Clear all our cache entries from localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignore errors
  }
}

/**
 * Stale-While-Revalidate fetch pattern
 * 1. If fresh cache exists - return it, skip fetch
 * 2. If stale cache exists - return it immediately, fetch in background
 * 3. If no cache - fetch and return
 */
export async function swr<T>(
  key: string,
  fetcher: () => Promise<T>,
  onUpdate?: (data: T) => void
): Promise<T> {
  const cached = getCacheWithStatus<T>(key);
  
  // Fresh cache - return immediately, no fetch needed
  if (cached && !cached.isStale) {
    return cached.data;
  }
  
  // Stale cache - return immediately, but refresh in background
  if (cached && cached.isStale) {
    // Background refresh (fire and forget)
    fetchAndCache(key, fetcher).then(onUpdate).catch(() => {});
    return cached.data;
  }
  
  // No cache - must fetch
  return fetchAndCache(key, fetcher);
}

/**
 * Fetch with deduplication and caching
 */
async function fetchAndCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request already in flight
  const pending = pendingRequests.get(key);
  if (pending) return pending;
  
  const request = fetcher()
    .then((data) => {
      setCache(key, data);
      pendingRequests.delete(key);
      return data;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });
  
  pendingRequests.set(key, request);
  return request;
}

/**
 * Deduplicate concurrent requests (backward compatible)
 */
export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  return swr(key, fetcher);
}

/**
 * Preload data in background
 */
export function preloadCache<T>(key: string, fetcher: () => Promise<T>): void {
  if (isCacheFresh(key)) return;
  fetchAndCache(key, fetcher).catch(() => {});
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { memoryEntries: number; localStorageEntries: number; localStorageSize: string } {
  let localStorageEntries = 0;
  let totalSize = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        localStorageEntries++;
        totalSize += (localStorage.getItem(key) || '').length * 2; // UTF-16
      }
    }
  } catch {
    // Ignore
  }
  
  return {
    memoryEntries: memoryCache.size,
    localStorageEntries,
    localStorageSize: `${(totalSize / 1024).toFixed(1)} KB`
  };
}

// Cache keys constants
export const CACHE_KEYS = {
  SIAH_ARTICLES: 'siah_articles',
  NEWS_BATZIBUR: 'news_batzibur',
  BEIN_HATZIBUR: 'bein_hatzibur',
  BEFORE_18: 'before_18',
  NEWSPAPER_ISSUES: 'newspaper_issues',
  GALLERIES: 'galleries',
  EVENTS: 'events',
  HERO_BANNERS: 'hero_banners',
  CATEGORIES: 'categories',
  VIDEOS: 'videos',
  HISTORICAL_EVENTS: 'historical_events',
  ARTICLES: 'articles',
} as const;
