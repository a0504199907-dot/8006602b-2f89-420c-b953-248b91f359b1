import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  category: string;
  date: string;
}

interface UseVideosOptions {
  limit?: number;
}

const FETCH_TIMEOUT = 1500;

export function useVideos(options: UseVideosOptions = {}) {
  const cacheKey = `${CACHE_KEYS.VIDEOS}_${options.limit}`;
  const [videos, setVideos] = useState<Video[]>(() => getCache(cacheKey) || []);
  const [loading, setLoading] = useState(!getCache(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCache<Video[]>(cacheKey);
    if (cached && cached.length > 0) {
      setVideos(cached);
      setLoading(false);
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, FETCH_TIMEOUT);

    async function fetchVideos() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('videos')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (cancelled) return;
        clearTimeout(timeoutId);

        if (fetchError) throw fetchError;

        const mapped = (data || []).map(v => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          thumbnail: v.thumbnail_url || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800',
          videoUrl: v.video_url || '',
          duration: v.duration || '0:00',
          views: v.views || 0,
          category: v.category || 'כללי',
          date: v.created_at
        }));

        setVideos(mapped);
        setCache(cacheKey, mapped);
        setError(null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }

    fetchVideos();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [options.limit, cacheKey]);

  return { videos, loading, error };
}
