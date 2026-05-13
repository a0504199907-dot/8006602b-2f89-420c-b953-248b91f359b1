import { useParams, Link } from 'react-router';
import Layout from '@/components/layout/Layout';
import { useEvents } from '@/hooks/useEvents';
import PageAds from '@/components/ui/PageAds';
import ActionBar from '@/components/ui/ActionBar';
import { ChevronLeft, Calendar, Clock, MapPin, Users, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventDetail() {
  const { id } = useParams<{id: string;}>();
  const { events, loading } = useEvents({});

  const event = events.find((e) => e.id === id);

  const eventTypeLabels: Record<string, string> = {
    wedding: 'חתונה',
    bar_mitzvah: 'בר מצווה',
    tish: 'טיש',
    yahrtzeit: 'יארצייט',
    celebration: 'שמחה'
  };

  const eventTypeColors: Record<string, string> = {
    wedding: 'bg-pink-600',
    bar_mitzvah: 'bg-blue-600',
    tish: 'bg-purple-600',
    yahrtzeit: 'bg-gray-600',
    celebration: 'bg-amber-600'
  };

  if (loading) {
    return (
      <Layout>
        <div data-ev-id="ev_427e559033" className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
          <p data-ev-id="ev_9880814af9" className="text-muted-foreground mt-4">טוען אירוע...</p>
        </div>
      </Layout>);

  }

  if (!event) {
    return (
      <Layout>
        <div data-ev-id="ev_9aa42482ec" className="container mx-auto px-4 py-20 text-center">
          <div data-ev-id="ev_c816932273" className="bg-surface rounded-[12px] p-10 shadow-card border border-border max-w-md mx-auto">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 data-ev-id="ev_4304fc680c" className="text-2xl font-bold mb-4 font-serif">האירוע לא נמצא</h1>
            <p data-ev-id="ev_c43292113f" className="text-muted-foreground mb-6">האירוע שחיפשת לא קיים או הוסר</p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-[10px] font-bold hover:bg-secondary-light transition-all shadow-gold">

              <ChevronLeft className="w-5 h-5" />
              חזרה לאירועים
            </Link>
          </div>
        </div>
      </Layout>);

  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout showTicker={false}>
      {/* Breadcrumb */}
      <div data-ev-id="ev_35558c8417" className="bg-muted/50 border-b border-border">
        <div data-ev-id="ev_f0cee48422" className="container mx-auto px-4 py-4">
          <div data-ev-id="ev_9c25f4b18f" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-secondary transition-colors">ראשי</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link to="/events" className="hover:text-secondary transition-colors">אירועים</Link>
            <ChevronLeft className="w-4 h-4" />
            <span data-ev-id="ev_a769eda87a" className="text-foreground truncate max-w-[250px]">{event.title}</span>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <section data-ev-id="ev_26bdbb3986" className="py-10 bg-background">
        <div data-ev-id="ev_8ff9517087" className="container mx-auto px-4">
          <div data-ev-id="ev_5c372e1743" className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div data-ev-id="ev_25c3f1f8ba" className="lg:col-span-2">
              {/* Event Image */}
              {event.image &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-video rounded-2xl overflow-hidden mb-8">

                  <img data-ev-id="ev_62c13301ae"
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover" />

                </motion.div>
              }

              {/* Event Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>

                <div data-ev-id="ev_cb41891906" className="flex items-center gap-3 mb-4">
                  <span data-ev-id="ev_d66f4cc104" className={`${eventTypeColors[event.eventType] || 'bg-gray-600'} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {eventTypeLabels[event.eventType] || event.eventType}
                  </span>
                  {event.chassidut &&
                  <span data-ev-id="ev_d72a78f907" className="bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium">
                      {event.chassidut}
                    </span>
                  }
                </div>

                <h1 data-ev-id="ev_fb1b7551e3" className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6">
                  {event.title}
                </h1>

                {event.description &&
                <div data-ev-id="ev_1da9e84611" className="prose prose-lg max-w-none text-foreground/80 mb-6">
                    <p data-ev-id="ev_57d07a00a1">{event.description}</p>
                  </div>
                }

                {/* Action Bar */}
                <ActionBar 
                  title={event.title} 
                  content={event.description || ''}
                  className="pt-4 border-t border-border"
                />
              </motion.div>
            </div>

            {/* Sidebar - Event Details */}
            <div data-ev-id="ev_2562dbf96c" className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface rounded-2xl p-6 shadow-card border border-border sticky top-24">

                <h3 data-ev-id="ev_fe7a90391a" className="text-lg font-bold mb-6 pb-4 border-b border-border">פרטי האירוע</h3>
                
                <div data-ev-id="ev_8f38dfde2c" className="flex flex-col gap-5">
                  <div data-ev-id="ev_e66fa720f6" className="flex items-start gap-4">
                    <div data-ev-id="ev_9d81b93ef6" className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-secondary" />
                    </div>
                    <div data-ev-id="ev_0a0ef057f9">
                      <p data-ev-id="ev_4767242d20" className="text-sm text-muted-foreground">תאריך</p>
                      <p data-ev-id="ev_3e87b516ab" className="font-medium text-foreground">{formattedDate}</p>
                      {event.hebrewDate &&
                      <p data-ev-id="ev_d016862960" className="text-sm text-secondary-dark">{event.hebrewDate}</p>
                      }
                    </div>
                  </div>

                  {event.time &&
                  <div data-ev-id="ev_ddaf3ff243" className="flex items-start gap-4">
                      <div data-ev-id="ev_6e22ea977e" className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-blue-500" />
                      </div>
                      <div data-ev-id="ev_2622a48091">
                        <p data-ev-id="ev_9dae16bbd0" className="text-sm text-muted-foreground">שעה</p>
                        <p data-ev-id="ev_54fd00e5ac" className="font-medium text-foreground">{event.time}</p>
                      </div>
                    </div>
                  }

                  {event.location &&
                  <div data-ev-id="ev_b7eaeb47bf" className="flex items-start gap-4">
                      <div data-ev-id="ev_616f20945c" className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-green-500" />
                      </div>
                      <div data-ev-id="ev_cfdfd468f6">
                        <p data-ev-id="ev_d77f1fa503" className="text-sm text-muted-foreground">מיקום</p>
                        <p data-ev-id="ev_b6199a2097" className="font-medium text-foreground">{event.location}</p>
                      </div>
                    </div>
                  }
                </div>

                {/* Actions */}
                <div data-ev-id="ev_74e5e48ef9" className="flex flex-col gap-3 mt-8 pt-6 border-t border-border">
                  <button data-ev-id="ev_cdc25b5798" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-primary rounded-xl font-bold hover:bg-secondary-light transition-colors shadow-gold">
                    <Calendar className="w-5 h-5" />
                    הוסף ליומן
                  </button>
                  <button data-ev-id="ev_b6988f74c0" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">
                    <Share2 className="w-5 h-5" />
                    שתף אירוע
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Banner Ad */}
      <div data-ev-id="ev_c61f0ad5ce" className="bg-muted/30 py-8">
        <div data-ev-id="ev_0867670252" className="container mx-auto px-4">
          <PageAds page="event-detail" position="bottom" />
        </div>
      </div>
    </Layout>);

}