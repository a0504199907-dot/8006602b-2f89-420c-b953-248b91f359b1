import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh } from '@/lib/cache';
import { preloadHeroImages, preloadImages } from '@/lib/imagePreloader';

/**
 * ULTRA-FAST Homepage Data Hook
 * 
 * Instead of 7+ separate API calls, this fetches ALL homepage data in ONE batched request.
 * Uses aggressive caching - shows cached data INSTANTLY, refreshes in background.
 * Also preloads images for instant display.
 */

const HOMEPAGE_CACHE_KEY = 'homepage_all_data_v2';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes fresh

export interface HomepageData {
  galleries: any[];
  siahArticles: any[];
  newsItems: any[];
  before18Items: any[];
  beinItems: any[];
  historicalEvents: any[];
  events: any[];
  heroBanners: any[];
  showHeroBanner: boolean;
}

const emptyData: HomepageData = {
  galleries: [],
  siahArticles: [],
  newsItems: [],
  before18Items: [],
  beinItems: [],
  historicalEvents: [],
  events: [],
  heroBanners: [],
  showHeroBanner: true
};

// Global state to prevent duplicate fetches
let fetchPromise: Promise<HomepageData> | null = null;
let lastFetchTime = 0;

// Preload images from data for instant display
function preloadDataImages(data: HomepageData) {
  const heroImages: string[] = [];
  const otherImages: string[] = [];

  // Hero banners - highest priority
  data.heroBanners.forEach(b => b.image_url && heroImages.push(b.image_url));

  // First item of each section - high priority (above fold)
  if (data.galleries[0]?.main_image) heroImages.push(data.galleries[0].main_image);
  if (data.siahArticles[0]?.cover_image_url) heroImages.push(data.siahArticles[0].cover_image_url);
  if (data.newsItems[0]?.image_url) heroImages.push(data.newsItems[0].image_url);

  // Remaining images - lower priority
  data.galleries.slice(1).forEach(g => g.main_image && otherImages.push(g.main_image));
  data.siahArticles.slice(1).forEach(a => a.cover_image_url && otherImages.push(a.cover_image_url));
  data.newsItems.slice(1).forEach(n => n.image_url && otherImages.push(n.image_url));
  data.before18Items.forEach(b => {
    if (b.images?.[0]?.url) otherImages.push(b.images[0].url);
  });
  data.beinItems.forEach(b => b.image_url && otherImages.push(b.image_url));
  data.historicalEvents.forEach(h => h.cover_image_url && otherImages.push(h.cover_image_url));
  data.events.forEach(e => e.image && otherImages.push(e.image));

  // Preload hero images immediately
  preloadHeroImages(heroImages);
  // Preload other images in background
  preloadImages(otherImages, 'low');
}

export function useHomepageData() {
  const [data, setData] = useState<HomepageData>(() => {
    // INSTANT: Return cached data immediately
    return getCache<HomepageData>(HOMEPAGE_CACHE_KEY) || emptyData;
  });
  const [loading, setLoading] = useState(() => !getCache(HOMEPAGE_CACHE_KEY));
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async (): Promise<HomepageData> => {
    if (!supabase) return emptyData;

    // Run ALL queries in parallel - single round-trip to DB
    const [galleriesRes, siahRes, newsRes, before18Res, beinRes, historicalRes, eventsRes, heroRes, settingsRes] = await Promise.all([
      // Galleries - select only needed fields
      supabase
        .from('galleries')
        .select('id, title, cover_image, hebrew_date, chassidut, event_type, image_count, created_at')
        .eq('status', 'published')
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),

      // Siah Hatzibur - select only needed fields
      supabase
        .from('siah_hatzibur')
        .select('id, title, subtitle, cover_image_url, author, hebrew_date, chassidut, is_featured')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('gregorian_date', { ascending: false })
        .limit(5),

      // News Batzibur - select only needed fields
      supabase
        .from('news_batzibur')
        .select('id, title, subtitle, image_url, author, hebrew_date, chassidut, location')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('gregorian_date', { ascending: false })
        .limit(5),

      // Before 18 Years - select only needed fields
      supabase
        .from('before_18_years')
        .select('id, title, week_parasha, year_hebrew, year_gregorian, images, photographer')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),

      // Bein Hatzibur - select only needed fields
      supabase
        .from('bein_hatzibur')
        .select('id, title, image_url, short_text, hebrew_date, photographer, chassidut')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(5),

      // Historical Events - select only needed fields
      supabase
        .from('historical_events')
        .select('id, title, description, cover_image_url, event_year_hebrew, event_year_gregorian, chassidut, author')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('event_year_gregorian', { ascending: false })
        .limit(5),

      // Events - select only needed fields
      supabase
        .from('events')
        .select('id, title, description, event_date, event_time, location, image_url, chassidut, event_type')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5),

      // Hero Banners
      supabase
        .from('hero_banners')
        .select('id, title, subtitle, image_url, link_url, link_text, priority')
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(10),

      // Settings
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'show_hero_banner')
        .single()
    ]);

    // Map galleries
    const galleries = (galleriesRes.data || []).map(g => ({
      id: g.id,
      title: g.title,
      coverImage: g.cover_image || '',
      main_image: g.cover_image || '',
      image_count: g.image_count || 0,
      hebrewDate: g.hebrew_date || '',
      chassidut: g.chassidut || '',
      eventType: g.event_type || '',
      createdAt: g.created_at
    }));

    // Map events
    const events = (eventsRes.data || []).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      date: e.event_date,
      time: e.event_time || '',
      location: e.location || '',
      image: e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      chassidut: e.chassidut,
      event_type: e.event_type
    }));

    return {
      galleries,
      siahArticles: siahRes.data || [],
      newsItems: newsRes.data || [],
      before18Items: before18Res.data || [],
      beinItems: beinRes.data || [],
      historicalEvents: historicalRes.data || [],
      events,
      heroBanners: heroRes.data || [],
      showHeroBanner: settingsRes.data?.value !== 'false'
    };
  }, []);

  useEffect(() => {
    // Check if we have fresh cached data
    const cached = getCache<HomepageData>(HOMEPAGE_CACHE_KEY);
    if (cached) {
      setData(cached);
      setLoading(false);
      
      // Preload images from cached data
      preloadDataImages(cached);
      
      // If cache is fresh, don't refetch
      if (isCacheFresh(HOMEPAGE_CACHE_KEY)) {
        return;
      }
    }

    // Dedupe concurrent fetches
    const now = Date.now();
    if (fetchPromise && now - lastFetchTime < 1000) {
      fetchPromise.then(newData => {
        setData(newData);
        setLoading(false);
        preloadDataImages(newData);
      });
      return;
    }

    lastFetchTime = now;
    setLoading(!cached);

    fetchPromise = fetchAllData();
    
    fetchPromise
      .then(newData => {
        setData(newData);
        setCache(HOMEPAGE_CACHE_KEY, newData);
        setError(null);
        preloadDataImages(newData);
      })
      .catch(err => {
        console.error('Homepage data fetch error:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, [fetchAllData]);

  const refetch = useCallback(() => {
    fetchPromise = null;
    lastFetchTime = 0;
    setLoading(true);
    
    fetchAllData()
      .then(newData => {
        setData(newData);
        setCache(HOMEPAGE_CACHE_KEY, newData);
      })
      .finally(() => setLoading(false));
  }, [fetchAllData]);

  return { 
    ...data, 
    loading, 
    error,
    refetch,
    hasData: data.siahArticles.length > 0 || data.galleries.length > 0
  };
}

// Prefetch homepage data - call this on app init
export function prefetchHomepageData() {
  if (!supabase) return;
  
  const cached = getCache<HomepageData>(HOMEPAGE_CACHE_KEY);
  if (cached && isCacheFresh(HOMEPAGE_CACHE_KEY)) return;

  // Start fetching in background
  setTimeout(() => {
    if (!fetchPromise) {
      fetchPromise = useHomepageDataFetch();
      fetchPromise.then(data => {
        setCache(HOMEPAGE_CACHE_KEY, data);
        fetchPromise = null;
      });
    }
  }, 100);
}

// Standalone fetch function for prefetching
async function useHomepageDataFetch(): Promise<HomepageData> {
  if (!supabase) return emptyData;

  const [galleriesRes, siahRes, newsRes, before18Res, beinRes, historicalRes, eventsRes, heroRes, settingsRes] = await Promise.all([
    supabase.from('galleries').select('id, title, cover_image, hebrew_date, chassidut, event_type, image_count, created_at').eq('status', 'published').order('display_order', { ascending: false }).limit(5),
    supabase.from('siah_hatzibur').select('id, title, subtitle, cover_image_url, author, hebrew_date, chassidut, is_featured').eq('is_published', true).order('display_order', { ascending: false }).limit(5),
    supabase.from('news_batzibur').select('id, title, subtitle, image_url, author, hebrew_date, chassidut, location').eq('is_published', true).order('display_order', { ascending: false }).limit(5),
    supabase.from('before_18_years').select('id, title, week_parasha, year_hebrew, year_gregorian, images, photographer').eq('is_published', true).order('display_order', { ascending: false }).limit(5),
    supabase.from('bein_hatzibur').select('id, title, image_url, short_text, hebrew_date, photographer, chassidut').eq('is_published', true).order('display_order', { ascending: false }).limit(5),
    supabase.from('historical_events').select('id, title, description, cover_image_url, event_year_hebrew, event_year_gregorian, chassidut, author').eq('is_published', true).order('display_order', { ascending: false }).limit(5),
    supabase.from('events').select('id, title, description, event_date, event_time, location, image_url, chassidut, event_type').eq('status', 'published').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(5),
    supabase.from('hero_banners').select('id, title, subtitle, image_url, link_url, link_text, priority').eq('is_active', true).order('priority', { ascending: true }).limit(10),
    supabase.from('site_settings').select('value').eq('key', 'show_hero_banner').single()
  ]);

  const galleries = (galleriesRes.data || []).map(g => ({
    id: g.id, title: g.title, coverImage: g.cover_image || '', main_image: g.cover_image || '',
    image_count: g.image_count || 0, hebrewDate: g.hebrew_date || '', chassidut: g.chassidut || '',
    eventType: g.event_type || '', createdAt: g.created_at
  }));

  const events = (eventsRes.data || []).map(e => ({
    id: e.id, title: e.title, description: e.description || '', date: e.event_date,
    time: e.event_time || '', location: e.location || '',
    image: e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    chassidut: e.chassidut, event_type: e.event_type
  }));

  return {
    galleries, siahArticles: siahRes.data || [], newsItems: newsRes.data || [],
    before18Items: before18Res.data || [], beinItems: beinRes.data || [],
    historicalEvents: historicalRes.data || [], events, heroBanners: heroRes.data || [],
    showHeroBanner: settingsRes.data?.value !== 'false'
  };
}
