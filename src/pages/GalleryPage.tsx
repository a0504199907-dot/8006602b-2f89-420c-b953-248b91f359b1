import { useState, useEffect } from 'react';
import { Camera, Images } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface Gallery {
  id: string;
  title: string;
  description: string | null;
  main_image: string | null;
  photographer: string | null;
  hebrew_date: string | null;
  image_count?: number;
  chassidut: string | null;
}

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    if (!supabase) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('galleries')
        .select('*, gallery_images(id)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const galleriesWithCount = (data || []).map((g: any) => ({
        ...g,
        image_count: g.gallery_images?.length || 0,
      }));
      setGalleries(galleriesWithCount);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionItems: SectionItem[] = galleries.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    description: gallery.description,
    main_image: gallery.main_image,
    photographer: gallery.photographer,
    hebrew_date: gallery.hebrew_date,
    badge: gallery.image_count ? `${gallery.image_count} תמונות` : null,
  }));

  return (
    <SectionPageLayout
      title="גלריות"
      subtitle="אלבומי תמונות מהשטח"
      icon={<Images className="w-6 h-6" />}
      items={sectionItems}
      loading={loading}
      basePath="/gallery"
      getImage={(item) => item.main_image || ''}
      getBadge={(item) => item.badge || null}
      emptyIcon={<Camera className="w-16 h-16" />}
      emptyText="אין גלריות להצגה"
    />
  );
}
