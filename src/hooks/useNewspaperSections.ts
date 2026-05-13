import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh, CACHE_KEYS } from '@/lib/cache';

// Ultra-fast hooks with SWR pattern
// Shows cached data IMMEDIATELY, refreshes silently in background
// NO timeout - let requests complete naturally

export function useNewspaperIssues(limit = 10) {
  const [issues, setIssues] = useState<any[]>(() => getCache(CACHE_KEYS.NEWSPAPER_ISSUES) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.NEWSPAPER_ISSUES));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.NEWSPAPER_ISSUES);
    if (cached?.length) {
      setIssues(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.NEWSPAPER_ISSUES)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('newspaper_issues')
          .select('*')
          .eq('is_published', true)
          .order('gregorian_date', { ascending: false })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setIssues(data);
          setCache(CACHE_KEYS.NEWSPAPER_ISSUES, data);
        }
      } catch (e) {
        // Silent fail - we have cached data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { issues, loading, latestIssue: issues[0] || null };
}

export function useSiahHatzibur(limit = 6) {
  const [articles, setArticles] = useState<any[]>(() => getCache(CACHE_KEYS.SIAH_ARTICLES) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.SIAH_ARTICLES));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.SIAH_ARTICLES);
    if (cached?.length) {
      setArticles(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.SIAH_ARTICLES)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('siah_hatzibur')
          .select('id, title, subtitle, cover_image_url, author, hebrew_date, chassidut, is_featured')
          .eq('is_published', true)
          .order('is_featured', { ascending: false })
          .order('gregorian_date', { ascending: false })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setArticles(data);
          setCache(CACHE_KEYS.SIAH_ARTICLES, data);
        }
      } catch (e) {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { articles, loading };
}

export function useBefore18Years(limit = 4) {
  const [items, setItems] = useState<any[]>(() => getCache(CACHE_KEYS.BEFORE_18) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.BEFORE_18));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.BEFORE_18);
    if (cached?.length) {
      setItems(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.BEFORE_18)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('before_18_years')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setItems(data);
          setCache(CACHE_KEYS.BEFORE_18, data);
        }
      } catch (e) {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, currentWeek: items[0] || null };
}

export function useBeinHatzibur(limit = 8) {
  const [items, setItems] = useState<any[]>(() => getCache(CACHE_KEYS.BEIN_HATZIBUR) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.BEIN_HATZIBUR));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.BEIN_HATZIBUR);
    if (cached?.length) {
      setItems(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.BEIN_HATZIBUR)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('bein_hatzibur')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setItems(data);
          setCache(CACHE_KEYS.BEIN_HATZIBUR, data);
        }
      } catch (e) {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading };
}

export function useNewsBatzibur(limit = 6) {
  const [items, setItems] = useState<any[]>(() => getCache(CACHE_KEYS.NEWS_BATZIBUR) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.NEWS_BATZIBUR));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.NEWS_BATZIBUR);
    if (cached?.length) {
      setItems(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.NEWS_BATZIBUR)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('news_batzibur')
          .select('*')
          .eq('is_published', true)
          .order('gregorian_date', { ascending: false })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setItems(data);
          setCache(CACHE_KEYS.NEWS_BATZIBUR, data);
        }
      } catch (e) {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading };
}

export function useHistoricalEvents(limit = 6) {
  const [events, setEvents] = useState<any[]>(() => getCache(CACHE_KEYS.HISTORICAL_EVENTS) || []);
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEYS.HISTORICAL_EVENTS));

  useEffect(() => {
    if (limit === 0) return;
    
    const cached = getCache<any[]>(CACHE_KEYS.HISTORICAL_EVENTS);
    if (cached?.length) {
      setEvents(cached);
      setLoading(false);
      if (isCacheFresh(CACHE_KEYS.HISTORICAL_EVENTS)) return;
    }

    let cancelled = false;
    
    async function fetch() {
      if (!supabase) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
          .from('historical_events')
          .select('*')
          .eq('is_published', true)
          .order('event_year_gregorian', { ascending: false })
          .limit(limit);
        
        if (!cancelled && !error && data) {
          setEvents(data);
          setCache(CACHE_KEYS.HISTORICAL_EVENTS, data);
        }
      } catch (e) {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    
    return () => { cancelled = true; };
  }, [limit]);

  return { events, loading };
}
