import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh, CACHE_KEYS } from '@/lib/cache';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  chassidut?: string;
}

interface UseEventsOptions {
  limit?: number;
  upcoming?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const cacheKey = `${CACHE_KEYS.EVENTS}_${options.limit}_${options.upcoming}`;
  const [events, setEvents] = useState<Event[]>(() => getCache(cacheKey) || []);
  const [loading, setLoading] = useState(() => !getCache(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options.limit === 0) return;
    
    const cached = getCache<Event[]>(cacheKey);
    if (cached?.length) {
      setEvents(cached);
      setLoading(false);
      if (isCacheFresh(cacheKey)) return;
    }

    let cancelled = false;

    async function fetchEvents() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('event_date', { ascending: true });

        if (options.upcoming) {
          query = query.gte('event_date', new Date().toISOString());
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;
        
        if (cancelled) return;

        if (fetchError) throw fetchError;

        const mapped = (data || []).map(e => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          date: e.event_date,
          time: e.event_time || '',
          location: e.location || '',
          image: e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          category: 'אירועים',
          chassidut: e.chassidut
        }));

        setEvents(mapped);
        setCache(cacheKey, mapped);
        setError(null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEvents();
    
    return () => {
      cancelled = true;
    };
  }, [options.limit, options.upcoming, cacheKey]);

  return { events, loading, error };
}
