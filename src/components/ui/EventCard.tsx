import { Link } from 'react-router';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Event } from '@/data/sampleData';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const eventTypeLabels = {
    wedding: 'חתונה',
    bar_mitzvah: 'בר מצווה',
    tish: 'טיש',
    yahrtzeit: 'יארצייט',
    celebration: 'שמחה'
  };

  const eventTypeColors = {
    wedding: 'bg-pink-600',
    bar_mitzvah: 'bg-blue-600',
    tish: 'bg-purple-600',
    yahrtzeit: 'bg-gray-600',
    celebration: 'bg-amber-600'
  };

  if (variant === 'compact') {
    return (
      <Link to={`/events/${event.id}`} className="group block">
        <div data-ev-id="ev_010771280b" className="flex items-center gap-3 p-3 rounded-[10px] hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
          <div data-ev-id="ev_c7afce2ff4" className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-[10px] flex flex-col items-center justify-center shrink-0 border border-secondary/20">
            <span data-ev-id="ev_c6e6214c8d" className="text-lg font-bold text-primary">
              {new Date(event.date).getDate()}
            </span>
            <span data-ev-id="ev_52053c3ecb" className="text-[10px] text-secondary-dark font-medium">
              {new Date(event.date).toLocaleDateString('he-IL', { month: 'short' })}
            </span>
          </div>
          <div data-ev-id="ev_389aa504c4" className="flex-1 min-w-0">
            <div data-ev-id="ev_e8342eba8b" className="flex items-center gap-2 mb-1">
              <span data-ev-id="ev_1069dc7292" className={`${eventTypeColors[event.eventType]} text-white px-2 py-0.5 rounded-[6px] text-[10px] font-medium`}>
                {eventTypeLabels[event.eventType]}
              </span>
              <span data-ev-id="ev_95432711e0" className="text-xs text-secondary-dark font-medium">{event.chassidut}</span>
            </div>
            <h4 data-ev-id="ev_487fcd7551" className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
              {event.title}
            </h4>
          </div>
        </div>
      </Link>);

  }

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <article data-ev-id="ev_c1c59a574d" className="bg-surface rounded-[12px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 card-premium border border-border/50">
        {event.image &&
        <div data-ev-id="ev_6c5137909a" className="relative aspect-[16/9] overflow-hidden">
            <img data-ev-id="ev_7e90c9b882"
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

            <div data-ev-id="ev_dcaa6254fd" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span data-ev-id="ev_b4c631ec43" className={`absolute top-3 right-3 ${eventTypeColors[event.eventType]} text-white px-3 py-1.5 rounded-[8px] text-sm font-medium shadow-sm`}>
              {eventTypeLabels[event.eventType]}
            </span>
            <div data-ev-id="ev_58979ebc9f" className="absolute bottom-3 left-3">
              <span data-ev-id="ev_fec388252e" className="bg-secondary text-primary px-3 py-1 rounded-[6px] text-sm font-semibold">
                {event.chassidut}
              </span>
            </div>
          </div>
        }
        <div data-ev-id="ev_7ab5b218d7" className="p-5">
          {!event.image &&
          <div data-ev-id="ev_8e98a53f6e" className="flex items-center gap-2 mb-3">
              <span data-ev-id="ev_008c0ae06e" className={`${eventTypeColors[event.eventType]} text-white px-2.5 py-1 rounded-[6px] text-xs font-medium`}>
                {eventTypeLabels[event.eventType]}
              </span>
              <span data-ev-id="ev_4202dbcb72" className="bg-secondary/15 text-secondary-dark px-2.5 py-1 rounded-[6px] text-xs font-semibold">
                {event.chassidut}
              </span>
            </div>
          }
          <h3 data-ev-id="ev_38f4539854" className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors font-serif">
            {event.title}
          </h3>
          <p data-ev-id="ev_570ccffdd0" className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
          
          <div data-ev-id="ev_c44d6b9c99" className="flex flex-col gap-2.5 text-sm text-foreground-secondary">
            <div data-ev-id="ev_85dbaafd83" className="flex items-center gap-2.5">
              <div data-ev-id="ev_91a8b370ca" className="w-8 h-8 bg-secondary/10 rounded-[6px] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <span data-ev-id="ev_594428ed49">{event.hebrewDate}</span>
            </div>
            <div data-ev-id="ev_b15ff42ab9" className="flex items-center gap-2.5">
              <div data-ev-id="ev_9ab6172f4d" className="w-8 h-8 bg-secondary/10 rounded-[6px] flex items-center justify-center">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              <span data-ev-id="ev_9df72f122a">{event.time}</span>
            </div>
            <div data-ev-id="ev_de627d8e3d" className="flex items-center gap-2.5">
              <div data-ev-id="ev_51e8b1c495" className="w-8 h-8 bg-secondary/10 rounded-[6px] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-secondary" />
              </div>
              <span data-ev-id="ev_88da1b131a" className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>);

}