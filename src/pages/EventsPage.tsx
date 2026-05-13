import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeader from '@/components/ui/SectionHeader';
import EventCard from '@/components/ui/EventCard';
import PageAds from '@/components/ui/PageAds';
import StaggerGrid, { StaggerItem } from '@/components/ui/StaggerGrid';
import { Calendar, Loader2, Filter } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';

const eventTypeLabels: Record<string, string> = {
  all: 'הכל',
  wedding: 'חתונות',
  bar_mitzvah: 'בר מצווה',
  tish: 'טישים',
  yahrtzeit: 'יארצייט',
  celebration: 'שמחות'
};

export default function EventsPage() {
  const [filter, setFilter] = useState('all');
  const { events, loading } = useEvents({ limit: 30 });

  const displayEvents = filter === 'all' ? events : events.filter((e) => e.eventType === filter);

  return (
    <Layout>
      <div data-ev-id="ev_cf1d24f4e4" className="py-8 bg-background">
        <div data-ev-id="ev_f237e06ad8" className="container mx-auto px-4">
          {/* Header */}
          <div data-ev-id="ev_4f83348f2c" className="mb-8">
            <SectionHeader
              title="לוח אירועים"
              icon={<Calendar className="w-6 h-6" />}
              variant="gold" />

            <p data-ev-id="ev_2f1e952d34" className="text-muted-foreground mt-2">כל האירועים הקרובים בעולם החסידי</p>
          </div>

          {/* Filters */}
          <div data-ev-id="ev_40614770a3" className="flex items-center gap-2 mb-8 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            {Object.entries(eventTypeLabels).map(([key, label]) =>
            <button data-ev-id="ev_2d9fd8c8c3"
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 font-medium transition-colors ${
            filter === key ?
            'bg-secondary text-primary' :
            'bg-muted text-muted-foreground hover:bg-muted/80'}`
            }>

                {label}
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading &&
          <div data-ev-id="ev_8ab9768b0f" className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
          }

          {/* Events Grid */}
          {!loading && displayEvents.length > 0 &&
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayEvents.map((event) =>
            <StaggerItem key={event.id}>
                  <EventCard event={event} variant="default" />
                </StaggerItem>
            )}
            </StaggerGrid>
          }

          {/* No Events */}
          {!loading && displayEvents.length === 0 &&
          <div data-ev-id="ev_07414d1940" className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_0d069ac243" className="text-muted-foreground">אין אירועים להצגה</p>
            </div>
          }
        </div>
      </div>

      {/* Bottom Banner - Full Width */}
      <PageAds page="events-list" position="bottom" />
    </Layout>);

}