import { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Camera, Calendar, User, ChevronLeft, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageAds from '@/components/ui/PageAds';

export interface SectionItem {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  main_image?: string | null;
  author?: string | null;
  photographer?: string | null;
  hebrew_date?: string | null;
  badge?: string | null;
}

interface SectionPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  items: SectionItem[];
  loading: boolean;
  basePath: string;
  getImage: (item: SectionItem) => string;
  getBadge?: (item: SectionItem) => string | null;
  emptyIcon?: ReactNode;
  emptyText?: string;
  filters?: ReactNode;
  section?: string; // NEW: section identifier for ad targeting
}

export default function SectionPageLayout({
  title,
  subtitle,
  icon,
  items,
  loading,
  basePath,
  getImage,
  getBadge,
  emptyIcon,
  emptyText = 'אין פריטים להצגה',
  filters,
  section
}: SectionPageLayoutProps) {
  if (loading) {
    return (
      <Layout showSideAds={true} pageType="section" section={section}>
        <div data-ev-id="ev_e66bd2f183" className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        </div>
      </Layout>);

  }

  const mainItem = items[0];
  const sideItems = items.slice(1, 3);
  const restItems = items.slice(3);

  return (
    <Layout showSideAds={true} pageType="section" section={section}>
      <div data-ev-id="ev_section_page" className="container mx-auto px-4 py-8">
        {/* Header */}
        <div data-ev-id="ev_section_header" className="mb-8">
          <div data-ev-id="ev_section_title_row" className="flex items-center gap-3 mb-2">
            <div data-ev-id="ev_gradient_line" className="w-1 h-10 rounded-full bg-gradient-to-b from-secondary via-secondary/60 to-transparent" />
            <h1 data-ev-id="ev_section_title" className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              {title}
            </h1>
            {icon && <span data-ev-id="ev_f1c993d169" className="text-secondary">{icon}</span>}
          </div>
          {subtitle &&
          <p data-ev-id="ev_section_subtitle" className="text-muted-foreground text-lg mr-5">
              {subtitle}
            </p>
          }
        </div>

        {/* Filters */}
        {filters && <div data-ev-id="ev_filters" className="mb-8">{filters}</div>}

        {items.length === 0 ?
        <div data-ev-id="ev_empty_state" className="text-center py-20 bg-surface rounded-2xl border border-border">
            {emptyIcon && <div data-ev-id="ev_9f1ec7f356" className="text-muted-foreground mx-auto mb-4">{emptyIcon}</div>}
            <p data-ev-id="ev_c84bfe47b9" className="text-muted-foreground text-lg">{emptyText}</p>
          </div> : (

        /* Main Content - Full Width (no sidebar) */
        <div data-ev-id="ev_content_area">
            {/* Hero Section: 1 Big + 2 Side */}
            <div data-ev-id="ev_hero_grid" className="grid grid-cols-12 gap-6 mb-8">
              {/* Main Article - Big */}
              {mainItem &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 lg:col-span-7">

                  <Link to={`${basePath}/${mainItem.id}`} className="group block">
                    <div data-ev-id="ev_main_card" className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4">
                      <img
                    data-ev-id="ev_3ec567639c"
                    src={getImage(mainItem)}
                    alt={mainItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      {getBadge && getBadge(mainItem) &&
                  <div data-ev-id="ev_b8b3617b35" className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold">
                          {getBadge(mainItem)}
                        </div>
                  }
                    </div>
                    <h2 data-ev-id="ev_main_title" className="text-2xl md:text-3xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                      {mainItem.title}
                    </h2>
                    {(mainItem.subtitle || mainItem.description) &&
                <p data-ev-id="ev_63a6dc0eda" className="text-muted-foreground line-clamp-2 mb-3">
                        {mainItem.subtitle || mainItem.description}
                      </p>
                }
                    <div data-ev-id="ev_main_meta" className="flex items-center gap-3 text-muted-foreground text-sm">
                      {mainItem.author &&
                  <span data-ev-id="ev_a9870e7a63" className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {mainItem.author}
                        </span>
                  }
                      {mainItem.photographer &&
                  <span data-ev-id="ev_f9ae31c273" className="flex items-center gap-1">
                          <Camera className="w-4 h-4" />
                          {mainItem.photographer}
                        </span>
                  }
                      {mainItem.hebrew_date &&
                  <span data-ev-id="ev_ab414201fa" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {mainItem.hebrew_date}
                        </span>
                  }
                    </div>
                  </Link>
                </motion.div>
            }

              {/* Side Articles - 2 stacked */}
              <div data-ev-id="ev_side_cards" className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                {sideItems.map((item, idx) =>
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                className="flex-1">

                    <Link to={`${basePath}/${item.id}`} className="group flex gap-4 h-full">
                      <div data-ev-id="ev_side_img" className="w-40 md:w-48 shrink-0 rounded-xl overflow-hidden">
                        <img
                      data-ev-id="ev_1a9faec262"
                      src={getImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500" />

                      </div>
                      <div data-ev-id="ev_side_content" className="flex flex-col justify-center flex-1 min-w-0">
                        {getBadge && getBadge(item) &&
                    <span data-ev-id="ev_31e223a98b" className="text-secondary text-xs font-medium mb-1">
                            {getBadge(item)}
                          </span>
                    }
                        <h3 data-ev-id="ev_2f819b185b" className="font-bold text-foreground text-lg line-clamp-2 group-hover:text-secondary transition-colors mb-2">
                          {item.title}
                        </h3>
                        <div data-ev-id="ev_7b2ce20b98" className="flex items-center gap-2 text-muted-foreground text-xs">
                          {item.author && <span data-ev-id="ev_15ad8dcbc6">{item.author}</span>}
                          {item.hebrew_date &&
                      <>
                              {item.author && <span data-ev-id="ev_878c815139">|</span>}
                              <span data-ev-id="ev_c520483861">{item.hebrew_date}</span>
                            </>
                      }
                        </div>
                      </div>
                    </Link>
                  </motion.div>
              )}
                {sideItems.length < 2 &&
              <div data-ev-id="ev_2fb844cdd3" className="flex-1 rounded-xl bg-muted/30 flex items-center justify-center min-h-[120px]">
                    <span data-ev-id="ev_145862fbdb" className="text-muted-foreground/50 text-sm">בקרוב</span>
                  </div>
              }
              </div>
            </div>

            {/* Rest of Articles - Grid */}
            {restItems.length > 0 &&
          <div data-ev-id="ev_rest_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {restItems.map((item, idx) =>
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}>

                    <Link to={`${basePath}/${item.id}`} className="group block">
                      <div data-ev-id="ev_grid_img" className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                        <img
                    data-ev-id="ev_667b6bdccd"
                    src={getImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        {getBadge && getBadge(item) &&
                  <div data-ev-id="ev_d82e6f61dd" className="absolute top-2 right-2 bg-secondary text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                            {getBadge(item)}
                          </div>
                  }
                      </div>
                      <h3 data-ev-id="ev_971d5422d7" className="font-bold text-foreground line-clamp-2 group-hover:text-secondary transition-colors mb-2">
                        {item.title}
                      </h3>
                      <div data-ev-id="ev_f14070b57a" className="flex items-center gap-2 text-muted-foreground text-xs">
                        {item.author && <span data-ev-id="ev_9c4b717ee5">{item.author}</span>}
                        {item.photographer &&
                  <span data-ev-id="ev_e2ef6887e5" className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {item.photographer}
                          </span>
                  }
                        {item.hebrew_date &&
                  <>
                            {(item.author || item.photographer) && <span data-ev-id="ev_ec60e85fce">|</span>}
                            <span data-ev-id="ev_6ed0011d73">{item.hebrew_date}</span>
                          </>
                  }
                      </div>
                    </Link>
                  </motion.div>
            )}
              </div>
          }
          </div>)
        }

        {/* Bottom Ad - Full Width */}
        <div data-ev-id="ev_bottom_ad" className="mt-8">
          <PageAds pageType="section" position="bottom" section={section} />
        </div>
      </div>
    </Layout>);

}