import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import Layout from '@/components/layout/Layout';
import PageAds from '@/components/ui/PageAds';
import HeroAdSlider from '@/components/ui/HeroAdSlider';
import NewspaperSlider from '@/components/ui/NewspaperSlider';
import EventCard from '@/components/ui/EventCard';
import { Calendar, TrendingUp, ChevronLeft, Camera } from 'lucide-react';
import { useHomepageData } from '@/hooks/useHomepageData';
import { prefetchArticles } from '@/hooks/useArticleCache';
import { easings, staggerDelay, scrollReveal, viewportOnce } from '@/lib/animations';
import { useSEO, useOrganizationSchema } from '@/hooks/useSEO';

// Skeleton placeholder - shows instantly while data loads
function Skeleton({ className = '' }: {className?: string;}) {
  return <div data-ev-id="ev_fb10cbba10" className={`bg-muted/60 rounded-lg animate-pulse ${className}`} />;
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

function SectionHeader({ title, moreLink, moreLinkText }: {title: string;moreLink: string;moreLinkText?: string;}) {
  return (
    <motion.div 
      data-ev-id="ev_e3f9b515de" 
      className="flex items-center justify-between mb-6"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}>
      <div data-ev-id="ev_3ad8f35e3c" className="flex items-center gap-3">
        <motion.div 
          data-ev-id="ev_aa240ad0b1" 
          className="w-1 h-8 rounded-full bg-gradient-to-b from-secondary via-secondary/60 to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
          style={{ originY: 0 }} />
        <h2 data-ev-id="ev_1287a3523a" className="text-2xl md:text-3xl font-bold font-serif text-foreground">{title}</h2>
      </div>
      <Link 
        to={moreLink} 
        className="text-muted-foreground hover:text-secondary text-sm font-medium flex items-center gap-1 transition-colors duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group">
        {moreLinkText || `עוד ב${title}`}
        <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
      </Link>
    </motion.div>);

}

export default function Index() {
  // SEO - Homepage
  useSEO({ url: '/', type: 'website' });
  useOrganizationSchema();

  // Single hook fetches ALL data in one batched request
  const {
    galleries,
    siahArticles,
    newsItems,
    before18Items,
    beinItems,
    historicalEvents,
    events,
    showHeroBanner,
    loading
  } = useHomepageData();

  // Prefetch articles in background for instant navigation
  useEffect(() => {
    if (siahArticles.length > 0) {
      prefetchArticles('siah_hatzibur', siahArticles.map((a) => a.id));
    }
    if (newsItems.length > 0) {
      prefetchArticles('news_batzibur', newsItems.map((a) => a.id));
    }
    if (before18Items.length > 0) {
      prefetchArticles('before_18_years', before18Items.map((a) => a.id));
    }
    if (beinItems.length > 0) {
      prefetchArticles('bein_hatzibur', beinItems.map((a) => a.id));
    }
    if (historicalEvents.length > 0) {
      prefetchArticles('historical_events', historicalEvents.map((a) => a.id));
    }
  }, [siahArticles, newsItems, before18Items, beinItems, historicalEvents]);

  const renderSection = (
  title: string,
  moreLink: string,
  basePath: string,
  items: any[],
  bgClass: string,
  getImage: (i: any) => string,
  getBadge: ((i: any) => string | null) | null,
  getAuthor: ((i: any) => string | null) | null,
  getPhotographer: ((i: any) => string | null) | null,
  getDate: ((i: any) => string | null) | null,
  getSubtitle: ((i: any) => string | null) | null) =>
  {
    // Show skeleton placeholders when no data yet
    if (items.length === 0) {
      return (
        <section data-ev-id="ev_skeleton_section" className={`py-8 ${bgClass}`}>
          <div data-ev-id="ev_ec2540d3aa" className="container mx-auto px-4">
            <SectionHeader title={title} moreLink={moreLink} />
            <div data-ev-id="ev_da87c122c1" className="grid grid-cols-12 gap-6">
              {/* Main skeleton */}
              <div data-ev-id="ev_4f15499fea" className="col-span-12 lg:col-span-6">
                <Skeleton className="aspect-[4/3] rounded-2xl mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              {/* Side skeletons */}
              <div data-ev-id="ev_4d921eca2c" className="col-span-12 lg:col-span-6">
                <div data-ev-id="ev_fb71b0443a" className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) =>
                  <div data-ev-id="ev_a440cacb25" key={i}>
                      <Skeleton className="aspect-[4/3] rounded-xl mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>);

    }

    const mainItem = items[0];
    const sideItems = items.slice(1, 5);

    return (
      <section data-ev-id="ev_7c648834bc" className={`py-8 ${bgClass}`}>
        <div data-ev-id="ev_cf45f95ca2" className="container mx-auto px-4">
          <SectionHeader title={title} moreLink={moreLink} />
          <div data-ev-id="ev_bc624b765b" className="grid grid-cols-12 gap-6">
            {/* Main Article - RIGHT in RTL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-6">

              <Link to={`${basePath}/${mainItem.id}`} className="group block">
                <div data-ev-id="ev_88341ce94e" className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                  <img data-ev-id="ev_e12720c2f3"
                  src={getImage(mainItem)}
                  alt={mainItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                </div>
                <div data-ev-id="ev_82c0258c4e" className="px-1">
                  <h3 data-ev-id="ev_7f22c57935" className="text-xl md:text-2xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                    {mainItem.title}
                  </h3>
                  {getSubtitle && getSubtitle(mainItem) &&
                  <p data-ev-id="ev_208d2f01ef" className="text-muted-foreground text-sm line-clamp-3 mb-3">{getSubtitle(mainItem)}</p>
                  }
                  <div data-ev-id="ev_c5c31d7375" className="flex items-center gap-2 text-muted-foreground text-xs">
                    {getAuthor && getAuthor(mainItem) && <span data-ev-id="ev_b14efd0a88">{getAuthor(mainItem)}</span>}
                    {getPhotographer && getPhotographer(mainItem) &&
                    <>
                        {getAuthor && getAuthor(mainItem) && <span data-ev-id="ev_9773635adc">|</span>}
                        <span data-ev-id="ev_7bb59ecb98" className="flex items-center gap-1"><Camera className="w-3 h-3" />{getPhotographer(mainItem)}</span>
                      </>
                    }
                    {getDate && getDate(mainItem) &&
                    <>
                        <span data-ev-id="ev_a4aec50145">|</span>
                        <span data-ev-id="ev_8036e4dd7f">{getDate(mainItem)}</span>
                      </>
                    }
                    {mainItem.created_at &&
                    <>
                        <span data-ev-id="ev_eab90e9796">|</span>
                        <span data-ev-id="ev_f3f643dfa7">{formatTime(mainItem.created_at)}</span>
                      </>
                    }
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Side Articles - LEFT in RTL */}
            <div data-ev-id="ev_0afebc783c" className="col-span-12 lg:col-span-6">
              {sideItems.length > 0 ?
              <div data-ev-id="ev_eabfef67d0" className="grid grid-cols-2 gap-4">
                {sideItems.map((sideItem, idx) =>
                <motion.div
                  key={sideItem.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ 
                    delay: staggerDelay(idx, 0.08),
                    duration: 0.4,
                    ease: easings.outQuart 
                  }}>

                    <Link to={`${basePath}/${sideItem.id}`} className="group block">
                      <div data-ev-id="ev_0582f6e0e5" className="relative rounded-xl overflow-hidden aspect-[4/3] mb-2">
                        <img data-ev-id="ev_010f3147dc"
                      src={getImage(sideItem)}
                      alt={sideItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      </div>
                      <h4 data-ev-id="ev_65be5e09b8" className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-secondary transition-colors mb-1">
                        {sideItem.title}
                      </h4>
                      <div data-ev-id="ev_07c42f47a9" className="flex items-center gap-2 text-muted-foreground text-xs">
                        {getAuthor && getAuthor(sideItem) && <span data-ev-id="ev_f9b95d5ca7">{getAuthor(sideItem)}</span>}
                        {getPhotographer && getPhotographer(sideItem) &&
                      <>
                            {getAuthor && getAuthor(sideItem) && <span data-ev-id="ev_8547981f6d">|</span>}
                            <span data-ev-id="ev_cb315119db">{getPhotographer(sideItem)}</span>
                          </>
                      }
                        {sideItem.created_at &&
                      <>
                            <span data-ev-id="ev_4cfaacc886">|</span>
                            <span data-ev-id="ev_d59014d66d">{formatTime(sideItem.created_at)}</span>
                          </>
                      }
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div> :

              <div data-ev-id="ev_empty_side" className="h-full flex items-center justify-center">
                <div data-ev-id="ev_empty_msg" className="grid grid-cols-2 gap-4 w-full">
                  {[0, 1, 2, 3].map((i) =>
                  <div data-ev-id="ev_4353afb3c0" key={i} className="aspect-[4/3] rounded-xl bg-muted/50 flex items-center justify-center">
                      <span data-ev-id="ev_07b86a6b19" className="text-muted-foreground/50 text-xs">בקרוב</span>
                    </div>
                  )}
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </section>);

  };

  return (
    <Layout showSideAds={true} pageType="home">
      
      {showHeroBanner && <HeroAdSlider autoPlayInterval={5000} />}

      {/* Top Banner Ad - Full Width */}
      <div data-ev-id="ev_top_banner_wrapper" className="w-full py-4">
        <PageAds pageType="home" position="top-banner" className="w-full" />
      </div>

      {/* 1. גלריות השבוע */}
      {renderSection(
        'גלריות השבוע',
        '/gallery',
        '/gallery',
        galleries,
        'bg-muted/30',
        (i) => i.main_image || '',
        (i) => i.image_count ? `${i.image_count} תמונות` : null,
        null,
        (i) => i.photographer,
        (i) => i.hebrew_date,
        null
      )}

      {/* 2. שיח הציבור */}
      {renderSection(
        'שיח הציבור',
        '/siah',
        '/siah',
        siahArticles,
        'bg-background',
        (i) => i.cover_image_url || '',
        null,
        (i) => i.author,
        (i) => i.photographer,
        (i) => i.hebrew_date,
        (i) => i.subtitle
      )}

      {/* 3. נייעס בציבור */}
      {renderSection(
        'נייעס בציבור',
        '/news-batzibur',
        '/news-batzibur',
        newsItems,
        'bg-muted/30',
        (i) => i.image_url || '',
        null,
        (i) => i.author,
        null,
        (i) => i.hebrew_date,
        (i) => i.description
      )}

      {/* Newspaper Slider */}
      <section data-ev-id="ev_fd0f8330fa" className="py-8 bg-muted/40">
        <div data-ev-id="ev_cbd423bc33" className="container mx-auto px-4">
          <NewspaperSlider />
        </div>
      </section>

      {/* 4. לפני 18 שנה */}
      {renderSection(
        'לפני 18 שנה',
        '/before-18',
        '/before-18',
        before18Items,
        'bg-background',
        (i) => i.images?.[0]?.url || i.main_image || '',
        (i) => i.year_hebrew,
        null,
        null,
        (i) => `פרשת ${i.week_parasha}`,
        (i) => i.description
      )}

      {/* 5. בעין הציבור */}
      {renderSection(
        'בעין הציבור',
        '/bein-hatzibur',
        '/bein-hatzibur',
        beinItems,
        'bg-muted/30',
        (i) => i.image_url || '',
        null,
        null,
        (i) => i.photographer,
        (i) => i.hebrew_date,
        (i) => i.description
      )}

      {/* 6. אירועים היסטוריים */}
      {renderSection(
        'אירועים היסטוריים',
        '/historical',
        '/historical',
        historicalEvents,
        'bg-background',
        (i) => i.images?.[0]?.url || i.main_image || '',
        (i) => i.year,
        null,
        null,
        (i) => i.hebrew_date,
        (i) => i.description
      )}

      {/* Events + Trending */}


      <div data-ev-id="ev_1eab7b5be8" className="container mx-auto px-4 py-6">
        <PageAds pageType="home" position="bottom" />
      </div>

    </Layout>);

}
