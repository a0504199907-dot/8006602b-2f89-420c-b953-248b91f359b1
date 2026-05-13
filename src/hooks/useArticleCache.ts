import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh } from '@/lib/cache';

/**
 * Ultra-fast Article Cache
 * 
 * - Shows cached article INSTANTLY
 * - Prefetches articles when user hovers/sees them
 * - Background refresh for stale data
 */

type TableName = 'siah_hatzibur' | 'news_batzibur' | 'before_18_years' | 'bein_hatzibur' | 'historical_events' | 'galleries' | 'events' | 'videos' | 'articles';

const getCacheKey = (table: TableName, id: string) => `article_${table}_${id}`;

// Prefetch queue
const prefetchedIds = new Set<string>();
const prefetchQueue: Array<{ table: TableName; id: string }> = [];
let isPrefetching = false;

/**
 * Get cached article data
 */
export function getCachedArticle<T>(table: TableName, id: string): T | null {
  return getCache<T>(getCacheKey(table, id));
}

/**
 * Save article to cache
 */
export function cacheArticle<T>(table: TableName, id: string, data: T): void {
  setCache(getCacheKey(table, id), data);
}

/**
 * Check if article is cached and fresh
 */
export function isArticleCached(table: TableName, id: string): boolean {
  return !!getCache(getCacheKey(table, id));
}

/**
 * Prefetch an article (call on hover or when visible)
 */
export async function prefetchArticle(table: TableName, id: string): Promise<void> {
  const key = `${table}_${id}`;
  if (prefetchedIds.has(key) || !supabase) return;
  
  prefetchedIds.add(key);
  
  // Check if already cached
  if (isCacheFresh(getCacheKey(table, id))) return;
  
  // Add to queue
  prefetchQueue.push({ table, id });
  processPrefetchQueue();
}

/**
 * Process prefetch queue with controlled concurrency
 */
async function processPrefetchQueue(): Promise<void> {
  if (isPrefetching || prefetchQueue.length === 0) return;
  
  isPrefetching = true;
  
  while (prefetchQueue.length > 0) {
    const batch = prefetchQueue.splice(0, 3); // 3 concurrent
    
    await Promise.all(batch.map(async ({ table, id }) => {
      try {
        if (!supabase) return;
        const { data } = await supabase.from(table).select('*').eq('id', id).single();
        if (data) {
          cacheArticle(table, id, data);
        }
      } catch (e) {
        // Silent fail
      }
    }));
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 50));
  }
  
  isPrefetching = false;
}

/**
 * Hook for fetching article with cache
 */
export function useArticleWithCache<T>(
  table: TableName,
  id: string | undefined,
  options: {
    incrementViews?: boolean;
    transform?: (data: any) => T;
  } = {}
) {
  const cacheKey = id ? getCacheKey(table, id) : '';
  
  const [article, setArticle] = useState<T | null>(() => {
    if (!id) return null;
    return getCache<T>(cacheKey) || null;
  });
  const [loading, setLoading] = useState(() => {
    if (!id) return false;
    return !getCache(cacheKey);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Show cached data immediately
    const cached = getCache<T>(cacheKey);
    if (cached) {
      setArticle(cached);
      setLoading(false);
      
      // If fresh, don't refetch
      if (isCacheFresh(cacheKey)) {
        return;
      }
    }

    let cancelled = false;

    async function fetch() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single();

        if (cancelled) return;
        if (fetchError) throw fetchError;

        const transformed = options.transform ? options.transform(data) : data as T;
        setArticle(transformed);
        setCache(cacheKey, transformed);
        setError(null);

        // Increment views in background (don't wait)
        if (options.incrementViews && data) {
          supabase
            .from(table)
            .update({ views: ((data as any).views || 0) + 1 })
            .eq('id', id)
            .then(() => {});
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          // Keep showing cached data on error
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [id, table, cacheKey, options.incrementViews]);

  const refetch = useCallback(() => {
    if (!id || !supabase) return;
    
    setLoading(true);
    supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else if (data) {
          const transformed = options.transform ? options.transform(data) : data as T;
          setArticle(transformed);
          setCache(cacheKey, transformed);
        }
        setLoading(false);
      });
  }, [id, table, cacheKey, options.transform]);

  return { article, loading, error, refetch };
}

/**
 * Prefetch multiple articles at once (for list pages)
 */
export function prefetchArticles(table: TableName, ids: string[]): void {
  ids.forEach(id => prefetchArticle(table, id));
}
