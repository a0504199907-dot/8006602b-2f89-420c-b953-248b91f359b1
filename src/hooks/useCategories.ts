import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order: number;
}

const FETCH_TIMEOUT = 1500;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => getCache(CACHE_KEYS.CATEGORIES) || []);
  const [loading, setLoading] = useState(!getCache(CACHE_KEYS.CATEGORIES));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCache<Category[]>(CACHE_KEYS.CATEGORIES);
    if (cached && cached.length > 0) {
      setCategories(cached);
      setLoading(false);
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, FETCH_TIMEOUT);

    async function fetchCategories() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (cancelled) return;
        clearTimeout(timeoutId);

        if (fetchError) throw fetchError;

        const mapped = (data || []).map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          color: c.color,
          icon: c.icon,
          sort_order: c.sort_order
        }));

        setCategories(mapped);
        setCache(CACHE_KEYS.CATEGORIES, mapped);
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

    fetchCategories();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { categories, loading, error };
}
