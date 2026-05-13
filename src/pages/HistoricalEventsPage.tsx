import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SectionPageLayout, { SectionItem } from '@/components/ui/SectionPageLayout';

interface ImageWithCaption {
  url: string;
  caption?: string;
}

interface HistoricalEvent {
  id: string;
  title: string;
  description: string | null;
  main_image: string | null;
  images: ImageWithCaption[] | null;
  hebrew_date: string | null;
  year: string | null;
  chassidut: string | null;
  event_type: string | null;
}

export default function HistoricalEventsPage() {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!supabase) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('historical_events')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map((item: any) => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
      }));
      setEvents(parsed);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [...new Set(events.map((e) => e.event_type).filter(Boolean))];

  const filteredEvents = filter === 'all' ?
  events :
  events.filter((e) => e.event_type === filter);

  const sectionItems: SectionItem[] = filteredEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    main_image: event.images?.[0]?.url || event.main_image,
    hebrew_date: event.hebrew_date,
    badge: event.year
  }));

  const filters = eventTypes.length > 0 ?
  <div data-ev-id="ev_138270692b" className="flex flex-wrap gap-2">
      <button data-ev-id="ev_a8884d6fc5"
    onClick={() => setFilter('all')}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === 'all' ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

        הכל
      </button>
      {eventTypes.map((type) =>
    <button data-ev-id="ev_ebc5fd393f"
    key={type}
    onClick={() => setFilter(type!)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    filter === type ? 'bg-secondary text-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`
    }>

          {type}
        </button>
    )}
    </div> :
  undefined;

  return (
    <SectionPageLayout
      title="אירועים היסטוריים"
      subtitle="רגעים חשובים מההיסטוריה"
      icon={<History className="w-6 h-6" />}
      items={sectionItems}
      loading={loading}
      basePath="/historical"
      getImage={(item) => item.main_image || item.image_url || ''}
      getBadge={(item) => item.badge || null}
      emptyIcon={<History className="w-16 h-16" />}
      emptyText="אין אירועים להצגה"
      filters={filters}
      section="historical"
    />
  );
}