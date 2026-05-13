import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh, CACHE_KEYS } from '@/lib/cache';

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  main_image: string;  // alias for coverImage - used in Index.tsx
  images: { id?: string; url: string; image_url?: string; caption?: string; photographer?: string }[];
  image_count: number;
  category: string;
  date: string;
  hebrewDate: string;
  hebrew_date?: string;
  chassidut: string;
  eventType: string;
  createdAt: string;
  photographer?: string;
}

interface UseGalleriesOptions {
  limit?: number;
  includeImages?: boolean;
}

export function useGalleries(options: UseGalleriesOptions = {}) {
  const cacheKey = `${CACHE_KEYS.GALLERIES}_${options.limit}_${options.includeImages}`;
  const [galleries, setGalleries] = useState<GalleryAlbum[]>(() => getCache(cacheKey) || []);
  const [loading, setLoading] = useState(() => !getCache(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options.limit === 0) return;
    
    const cached = getCache<GalleryAlbum[]>(cacheKey);
    if (cached?.length) {
      setGalleries(cached);
      setLoading(false);
      if (isCacheFresh(cacheKey)) return;
    }

    let cancelled = false;

    async function fetchGalleries() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const selectQuery = options.includeImages 
          ? `*, gallery_images(id, image_url, caption, photographer, sort_order)`
          : `*`;

        let query = supabase
          .from('galleries')
          .select(selectQuery)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;
        
        if (cancelled) return;

        if (fetchError) throw fetchError;

        const mapped = (data || []).map(g => {
          const coverImg = g.cover_image || '';
          
          // Map gallery images from database (only if fetched)
          const galleryImages = options.includeImages && Array.isArray(g.gallery_images) 
            ? g.gallery_images
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((img: any) => ({
                  id: img.id,
                  url: img.image_url,
                  image_url: img.image_url,  // Keep both for compatibility
                  caption: img.caption || '',
                  photographer: img.photographer || ''
                }))
            : [];
          
          return {
            id: g.id,
            title: g.title,
            description: g.description || '',
            coverImage: coverImg,
            main_image: coverImg,  // alias for Index.tsx
            images: galleryImages,
            image_count: g.image_count || galleryImages.length || 0,
            category: 'גלריה',
            date: g.hebrew_date || '',
            hebrewDate: g.hebrew_date || '',
            chassidut: g.chassidut || '',
            eventType: g.event_type || 'אירוע',
            createdAt: g.created_at
          };
        });

        setGalleries(mapped);
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

    fetchGalleries();
    
    return () => {
      cancelled = true;
    };
  }, [options.limit, options.includeImages, cacheKey]);

  return { galleries, loading, error };
}
