import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ChevronLeft, Clock, User, Camera } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  main_image?: string;
  cover_image_url?: string;
  author?: string;
  writer?: string;
  photographer?: string;
  hebrew_date?: string;
  created_at?: string;
  image_count?: number;
}

interface HomepageSectionProps {
  title: string;
  icon?: LucideIcon;
  moreLink: string;
  moreLinkText?: string;
  items: SectionItem[];
  basePath: string;
  loading?: boolean;
  accentColor?: string;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function getImage(item: SectionItem): string {
  return item.image || item.main_image || item.cover_image_url || '/placeholder.jpg';
}

function getAuthor(item: SectionItem): string {
  return item.author || item.writer || '';
}

export default function HomepageSection({
  title,
  icon: Icon,
  moreLink,
  moreLinkText,
  items,
  basePath,
  loading = false,
  accentColor = 'secondary'
}: HomepageSectionProps) {
  if (loading && items.length === 0) {
    return (
      <section data-ev-id="ev_7376c9f439" className="py-8">
        <div data-ev-id="ev_b8530f7c8d" className="container mx-auto px-4">
          <div data-ev-id="ev_46e5041472" className="h-8 w-48 bg-muted rounded animate-pulse mb-6 mr-auto" />
          <div data-ev-id="ev_a4706706e0" className="grid grid-cols-12 gap-4">
            <div data-ev-id="ev_f03684f78c" className="col-span-12 lg:col-span-6 h-[400px] bg-muted rounded-xl animate-pulse" />
            <div data-ev-id="ev_752175ac83" className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) =>
              <div data-ev-id="ev_6f4b8de635" key={i} className="h-[190px] bg-muted rounded-xl animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>);

  }

  if (items.length === 0) return null;

  const mainItem = items[0];
  const sideItems = items.slice(1, 5);

  return (
    <section data-ev-id="ev_f42c3c7663" className="py-8">
      <div data-ev-id="ev_9245c1c6d3" className="container mx-auto px-4">
        {/* Header */}
        <div data-ev-id="ev_3631433e61" className="flex items-center justify-between mb-6 gap-2">
          <Link
            to={moreLink}
            className="text-muted-foreground hover:text-secondary text-sm font-medium flex items-center gap-1 transition-colors shrink-0">

            <ChevronLeft className="w-4 h-4" />
            {moreLinkText || `עוד ב${title}`}
          </Link>
          
          <div data-ev-id="ev_e312a04584" className="flex items-center gap-2">
            <h2 data-ev-id="ev_3cc73b5822" className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-foreground break-words min-w-0">
              {title}
            </h2>
            <div data-ev-id="ev_45f2560200" className="flex flex-col gap-1">
              <div data-ev-id="ev_7d4118aff1" className="w-2 h-2 rounded-full bg-secondary" />
              <div data-ev-id="ev_0d29b4d1a1" className="w-2 h-2 rounded-full bg-secondary" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div data-ev-id="ev_238fe4966e" className="grid grid-cols-12 gap-4">
          {/* Main Article - Right Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-6 order-2 lg:order-1">

            <Link to={`${basePath}/${mainItem.id}`} className="group block">
              <div data-ev-id="ev_de818632d3" className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/2]">
                <img data-ev-id="ev_3f4df67378"
                src={getImage(mainItem)}
                alt={mainItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy" />

                <div data-ev-id="ev_755cb19548" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content overlay */}
                <div data-ev-id="ev_df29343336" className="absolute bottom-0 right-0 left-0 p-5">
                  <h3 data-ev-id="ev_a83b32afcb" className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                    {mainItem.title}
                  </h3>
                  {mainItem.description &&
                  <p data-ev-id="ev_94e5967c23" className="text-white/80 text-sm line-clamp-2 mb-3">
                      {mainItem.description}
                    </p>
                  }
                  <div data-ev-id="ev_6c51af17e7" className="flex items-center gap-3 text-white/70 text-xs">
                    {getAuthor(mainItem) &&
                    <span data-ev-id="ev_7d17892dd6" className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getAuthor(mainItem)}
                      </span>
                    }
                    {mainItem.photographer &&
                    <span data-ev-id="ev_e1a3d4c7a0" className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {mainItem.photographer}
                      </span>
                    }
                    {mainItem.hebrew_date &&
                    <span data-ev-id="ev_cf2f99049a">{mainItem.hebrew_date}</span>
                    }
                    {mainItem.created_at &&
                    <span data-ev-id="ev_0d46a18a5f" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(mainItem.created_at)}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side Articles - Left Side */}
          <div data-ev-id="ev_850271a2ee" className="col-span-12 lg:col-span-6 order-1 lg:order-2">
            <div data-ev-id="ev_4925c7e9fb" className="grid grid-cols-2 gap-4">
              {sideItems.map((item, idx) =>
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}>

                  <Link to={`${basePath}/${item.id}`} className="group block">
                    <div data-ev-id="ev_94c1e81546" className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img data-ev-id="ev_d299d50c98"
                    src={getImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy" />

                      <div data-ev-id="ev_de406671e2" className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div data-ev-id="ev_12a329c200" className="mt-2">
                      <h4 data-ev-id="ev_f46a7a9ef8" className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-secondary transition-colors">
                        {item.title}
                      </h4>
                      <div data-ev-id="ev_ca46a790af" className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                        {getAuthor(item) &&
                      <span data-ev-id="ev_bd7fc3e180">{getAuthor(item)}</span>
                      }
                        {getAuthor(item) && item.created_at && <span data-ev-id="ev_a3e80d792a">|</span>}
                        {item.created_at &&
                      <span data-ev-id="ev_b86e74bdf0">{formatTime(item.created_at)}</span>
                      }
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}