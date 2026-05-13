import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface BeinItem {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  short_text: string | null;
  description: string | null;
  hebrew_date: string | null;
  photographer: string | null;
  location: string | null;
  chassidut: string | null;
}

export default function BeinHatziburPage() {
  const [items, setItems] = useState<BeinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!supabase) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('bein_hatzibur')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionItems: SectionItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || item.short_text,
    image_url: item.image_url,
    photographer: item.photographer,
    hebrew_date: item.hebrew_date,
    badge: item.chassidut,
  }));

  return (
    <SectionPageLayout
      title="בעין הציבור"
      subtitle="תמונות מיוחדות מהשבוע"
      icon={<Eye className="w-6 h-6" />}
      items={sectionItems}
      loading={loading}
      basePath="/bein-hatzibur"
      getImage={(item) => item.image_url || ''}
      getBadge={(item) => item.badge || null}
      emptyIcon={<Eye className="w-16 h-16" />}
      emptyText="אין תמונות להצגה"
      section="bein-hatzibur"
    />
  );
}
