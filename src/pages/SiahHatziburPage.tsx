import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache } from '@/lib/cache';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  cover_image_url: string | null;
  author: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  chassidut: string | null;
  views: number;
  is_featured: boolean;
}

const CACHE_KEY = 'siah_page_articles';

export default function SiahHatziburPage() {
  const [articles, setArticles] = useState<Article[]>(() => getCache(CACHE_KEY) || []);
  const [loading, setLoading] = useState(!getCache(CACHE_KEY));
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const cached = getCache<Article[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      setArticles(cached);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('siah_hatzibur').
      select('id, title, subtitle, cover_image_url, author, hebrew_date, gregorian_date, chassidut, views, is_featured').
      eq('is_published', true).
      order('gregorian_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
      setCache(CACHE_KEY, data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const chassiduyot = [...new Set(articles.map((a) => a.chassidut).filter(Boolean))];

  const filteredArticles = filter === 'all' ?
  articles :
  filter === 'featured' ?
  articles.filter((a) => a.is_featured) :
  articles.filter((a) => a.chassidut === filter);

  const items: SectionItem[] = filteredArticles.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    cover_image_url: a.cover_image_url,
    author: a.author,
    hebrew_date: a.hebrew_date,
    badge: a.chassidut
  }));

  const filters =
  <div data-ev-id="ev_6bb236f62e" className="flex flex-wrap gap-2">
      <button data-ev-id="ev_82a2d1ce15"
    onClick={() => setFilter('all')}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === 'all' ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

        הכל
      </button>
      <button data-ev-id="ev_e5d7f9ce6a"
    onClick={() => setFilter('featured')}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === 'featured' ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

        מובלטות
      </button>
      {chassiduyot.map((c) =>
    <button data-ev-id="ev_6d1f59fae3"
    key={c}
    onClick={() => setFilter(c!)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === c ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

          {c}
        </button>
    )}
    </div>;


  return (
    <SectionPageLayout
      title="שיח הציבור"
      subtitle="כתבות מעמיקות מעולם החסידות"
      items={items}
      loading={loading}
      basePath="/siah"
      getImage={(item) => item.cover_image_url || ''}
      getBadge={(item) => item.badge || null}
      emptyIcon={<FileText className="w-16 h-16" />}
      emptyText="אין כתבות להצגה"
      filters={filters}
      section="siah-hatzibur"
    />
  );
}