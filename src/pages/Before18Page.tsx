import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface ImageWithCaption {
  url: string;
  caption?: string;
}

interface Before18Item {
  id: string;
  title: string;
  description: string | null;
  main_image: string | null;
  images: ImageWithCaption[] | null;
  year_hebrew: string | null;
  week_parasha: string | null;
  chassidut: string | null;
}

export default function Before18Page() {
  const [items, setItems] = useState<Before18Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!supabase) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('before_18_years')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map((item: any) => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
      }));
      setItems(parsed);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionItems: SectionItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    main_image: item.images?.[0]?.url || item.main_image,
    hebrew_date: item.week_parasha ? `פרשת ${item.week_parasha}` : null,
    badge: item.year_hebrew,
  }));

  return (
    <SectionPageLayout
      title="לפני 18 שנה"
      subtitle="זכרונות מהעבר"
      items={sectionItems}
      loading={loading}
      basePath="/before-18"
      getImage={(item) => item.main_image || item.image_url || ''}
      getBadge={(item) => item.badge || null}
      emptyText="אין פריטים להצגה"
      section="before-18"
    />
  );
}
