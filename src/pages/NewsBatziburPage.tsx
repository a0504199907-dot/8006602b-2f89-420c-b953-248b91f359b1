import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  author: string | null;
  hebrew_date: string | null;
  chassidut: string | null;
}

export default function NewsBatziburPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('news_batzibur').
      select('*').
      eq('is_published', true).
      order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const chassiduyot = [...new Set(items.map((a) => a.chassidut).filter(Boolean))];

  const filteredItems = filter === 'all' ?
  items :
  items.filter((a) => a.chassidut === filter);

  const sectionItems: SectionItem[] = filteredItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image_url: item.image_url,
    author: item.author,
    hebrew_date: item.hebrew_date,
    badge: item.chassidut
  }));

  const filters = chassiduyot.length > 0 ?
  <div data-ev-id="ev_a552d693de" className="flex flex-wrap gap-2">
      <button data-ev-id="ev_819422c3ac"
    onClick={() => setFilter('all')}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === 'all' ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

        הכל
      </button>
      {chassiduyot.map((c) =>
    <button data-ev-id="ev_5eb7281943"
    key={c}
    onClick={() => setFilter(c!)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === c ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

          {c}
        </button>
    )}
    </div> :
  undefined;

  return (
    <SectionPageLayout
      title="נייעס בציבור"
      subtitle="חדשות ועדכונים מהשטח"
      items={sectionItems}
      loading={loading}
      basePath="/news-batzibur"
      getImage={(item) => item.image_url || ''}
      getBadge={(item) => item.badge || null}
      emptyIcon={<Newspaper className="w-16 h-16" />}
      emptyText="אין חדשות להצגה"
      filters={filters}
      section="news-batzibur"
    />
  );


}