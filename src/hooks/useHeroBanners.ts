import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh, CACHE_KEYS } from '@/lib/cache';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  show_button: boolean;
  bg_overlay: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroSettings {
  id: string;
  autoplay_speed: number;
  show_arrows: boolean;
  show_dots: boolean;
  pause_on_hover: boolean;
  updated_at: string;
}

interface CachedHeroData {
  banners: HeroBanner[];
  settings: HeroSettings | null;
}

export function useHeroBanners() {
  const cached = getCache<CachedHeroData>(CACHE_KEYS.HERO_BANNERS);
  const [banners, setBanners] = useState<HeroBanner[]>(cached?.banners || []);
  const [settings, setSettings] = useState<HeroSettings | null>(cached?.settings || null);
  const [isLoading, setIsLoading] = useState(() => !cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) {
      setBanners(cached.banners);
      setSettings(cached.settings);
      setIsLoading(false);
      // Skip fetch if cache is fresh
      if (isCacheFresh(CACHE_KEYS.HERO_BANNERS)) return;
    }

    let cancelled = false;

    const loadData = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const [bannersResult, settingsResult] = await Promise.all([
          supabase
            .from('hero_banners')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('hero_settings')
            .select('*')
            .limit(1)
            .single()
        ]);

        if (cancelled) return;

        if (bannersResult.error) throw bannersResult.error;
        
        const newBanners = bannersResult.data ?? [];
        const newSettings = settingsResult.error?.code === 'PGRST116' ? null : settingsResult.data;

        setBanners(newBanners);
        setSettings(newSettings);
        setCache(CACHE_KEYS.HERO_BANNERS, { banners: newBanners, settings: newSettings });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'שגיאה בטעינת באנרים');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  return { banners, settings, isLoading, error };
}

export function useHeroBannersAdmin() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('hero_banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setBanners(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת באנרים');
    }
  };

  const fetchSettings = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('hero_settings')
        .select('*')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הגדרות');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBanners(), fetchSettings()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const saveBanner = async (banner: Partial<HeroBanner>) => {
    if (!supabase) return null;
    
    try {
      if (banner.id) {
        const { data, error } = await supabase
          .from('hero_banners')
          .update(banner)
          .eq('id', banner.id)
          .select()
          .single();
        if (error) throw error;
        await fetchBanners();
        return data;
      } else {
        const { data, error } = await supabase
          .from('hero_banners')
          .insert(banner)
          .select()
          .single();
        if (error) throw error;
        await fetchBanners();
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת באנר');
      return null;
    }
  };

  const deleteBanner = async (id: string) => {
    if (!supabase) return false;
    
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchBanners();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקת באנר');
      return false;
    }
  };

  const saveSettings = async (newSettings: Partial<HeroSettings>) => {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .upsert({ ...newSettings, id: settings?.id || undefined })
        .select()
        .single();
      if (error) throw error;
      setSettings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת הגדרות');
      return null;
    }
  };

  const reorderBanners = async (orderedIds: string[]) => {
    if (!supabase) return false;
    
    try {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('hero_banners')
          .update({ sort_order: index })
          .eq('id', id)
      );
      await Promise.all(updates);
      await fetchBanners();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בסידור באנרים');
      return false;
    }
  };

  return { 
    banners, 
    settings, 
    isLoading, 
    error, 
    saveBanner, 
    deleteBanner, 
    saveSettings,
    reorderBanners,
    refetch: () => Promise.all([fetchBanners(), fetchSettings()]) 
  };
}
