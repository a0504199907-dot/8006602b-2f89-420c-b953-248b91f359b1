import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, isCacheFresh } from '@/lib/cache';

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  contentBlocks: ContentBlock[];
  image: string;
  coverImage: string;
  author: string;
  photographer: string;
  hebrewDate: string;
  category: string;
  categoryId: string;
  chassidut: string;
  isFeatured: boolean;
  isBreaking: boolean;
  readTime: number;
  views: number;
  publishedAt: string;
  createdAt: string;
}

// Content block types for direct rendering
export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'subtitle' | 'quote';
  content?: string;
  imageUrl?: string;
  caption?: string;
  photographer?: string;
  quoteSource?: string;
}

interface UseArticlesOptions {
  limit?: number;
  categoryId?: string;
  featured?: boolean;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const cacheKey = `articles_${options.limit}_${options.categoryId}_${options.featured}`;
  const [articles, setArticles] = useState<Article[]>(() => getCache(cacheKey) || []);
  const [loading, setLoading] = useState(!getCache(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCache<Article[]>(cacheKey);
    if (cached && cached.length > 0) {
      setArticles(cached);
      setLoading(false);
      if (isCacheFresh(cacheKey)) return;
    }

    let cancelled = false;

    async function fetchArticles() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('articles')
          .select(`
            *,
            categories:category_id(name)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (options.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        if (options.featured) {
          query = query.eq('is_featured', true);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (cancelled) return;

        if (fetchError) throw fetchError;

        const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
        const mapped = (data || []).map(a => ({
          id: a.id,
          title: a.title || '',
          subtitle: a.subtitle || '',
          excerpt: a.excerpt || '',
          content: a.content || '',
          contentBlocks: (a.content_blocks as ContentBlock[]) || [],
          image: a.image_url || a.cover_image || defaultImage,
          coverImage: a.image_url || a.cover_image || defaultImage,
          author: a.author || 'מערכת',
          photographer: a.photographer || '',
          hebrewDate: a.hebrew_date || '',
          category: (a.categories as any)?.name || 'כללי',
          categoryId: a.category_id || '',
          chassidut: a.chassidut || '',
          isFeatured: a.is_featured || false,
          isBreaking: a.is_breaking || false,
          readTime: a.read_time || 3,
          views: a.views || 0,
          publishedAt: a.published_at || a.created_at,
          createdAt: a.created_at
        }));

        setArticles(mapped);
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

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [options.limit, options.categoryId, options.featured, cacheKey]);

  return { articles, loading, error };
}

export function useArticle(id: string) {
  const cacheKey = `article_${id}`;
  const [article, setArticle] = useState<Article | null>(() => getCache(cacheKey));
  const [loading, setLoading] = useState(!getCache(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCache<Article>(cacheKey);
    if (cached) {
      setArticle(cached);
      setLoading(false);
      if (isCacheFresh(cacheKey)) return;
    }

    let cancelled = false;

    async function fetchArticle() {
      if (!supabase || !id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select(`
            *,
            categories:category_id(name)
          `)
          .eq('id', id)
          .single();

        if (cancelled) return;

        if (fetchError) throw fetchError;

        const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
        const mapped = {
          id: data.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          contentBlocks: (data.content_blocks as ContentBlock[]) || [],
          image: data.image_url || data.cover_image || defaultImage,
          coverImage: data.image_url || data.cover_image || defaultImage,
          author: data.author || 'מערכת',
          photographer: data.photographer || '',
          hebrewDate: data.hebrew_date || '',
          category: (data.categories as any)?.name || 'כללי',
          categoryId: data.category_id || '',
          chassidut: data.chassidut || '',
          isFeatured: data.is_featured || false,
          isBreaking: data.is_breaking || false,
          readTime: data.read_time || 3,
          views: data.views || 0,
          publishedAt: data.published_at || data.created_at,
          createdAt: data.created_at
        };

        setArticle(mapped);
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

    fetchArticle();

    return () => {
      cancelled = true;
    };
  }, [id, cacheKey]);

  return { article, loading, error };
}
