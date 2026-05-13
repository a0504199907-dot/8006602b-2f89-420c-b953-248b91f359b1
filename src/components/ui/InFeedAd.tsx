import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { trackImpression, trackClick } from '@/hooks/useAds';

interface InFeedAdProps {
  page: string;
  index: number; // position in the feed
  className?: string;
}

interface AdData {
  id: string;
  title: string | null;
  image_url: string | null;
  target_url: string;
  background_color: string | null;
  cta_text: string | null;
}

// Configuration for in-feed ads
const IN_FEED_CONFIG: Record<string, {interval: number;slots: string[];}> = {
  'siah-list': { interval: 4, slots: ['siah-feed-1', 'siah-feed-2', 'siah-feed-3'] },
  'before18-list': { interval: 3, slots: ['before18-feed-1', 'before18-feed-2'] },
  'bein-list': { interval: 4, slots: ['bein-feed-1', 'bein-feed-2'] },
  'news-list': { interval: 4, slots: ['news-feed-1', 'news-feed-2', 'news-feed-3'] },
  'historical-list': { interval: 3, slots: ['historical-feed-1', 'historical-feed-2'] },
  'gallery-list': { interval: 6, slots: ['gallery-feed-1', 'gallery-feed-2'] },
  'events-list': { interval: 4, slots: ['events-feed-1', 'events-feed-2'] },
  'video-list': { interval: 4, slots: ['video-feed-1', 'video-feed-2'] },
  'articles-list': { interval: 4, slots: ['articles-feed-1', 'articles-feed-2'] },
  'home': { interval: 6, slots: ['home-feed-1', 'home-feed-2'] }
};

const FALLBACK_AD: AdData = {
  id: 'fallback-feed',
  title: 'מקום פרסום',
  image_url: null,
  target_url: '/contact',
  background_color: '#1a1a2e',
  cta_text: 'פרסמו כאן'
};

export default function InFeedAd({ page, index, className = '' }: InFeedAdProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const impressionTracked = useRef(false);

  const config = IN_FEED_CONFIG[page];
  if (!config) return null;

  // Check if we should show an ad at this position
  if ((index + 1) % config.interval !== 0) return null;

  // Calculate which slot to use
  const slotIndex = Math.floor(index / config.interval) % config.slots.length;
  const slot = config.slots[slotIndex];

  // Fetch ad from database
  useEffect(() => {
    const fetchAd = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        const { data: placements, error } = await supabase.
        from('ad_placements').
        select(`
            *,
            creative:ad_creatives!inner(
              *,
              campaign:ad_campaigns!inner(*)
            )
          `).
        eq('slot_name', slot).
        eq('is_active', true).
        order('priority', { ascending: false }).
        limit(1);

        if (error) throw error;

        const placement = (placements || [])[0];
        if (placement) {
          const creative = placement.creative;
          const campaign = creative?.campaign;

          if (creative?.is_active && campaign?.status === 'active') {
            if ((!campaign.start_date || campaign.start_date <= today) && (
            !campaign.end_date || campaign.end_date >= today)) {
              setAd({
                id: creative.id,
                title: creative.title,
                image_url: creative.image_url,
                target_url: creative.target_url,
                background_color: creative.background_color,
                cta_text: creative.cta_text
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching in-feed ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [slot]);

  // Track impression
  useEffect(() => {
    if (ad && !impressionTracked.current) {
      trackImpression(ad.id);
      impressionTracked.current = true;
    }
  }, [ad]);

  const currentAd = ad || FALLBACK_AD;

  const handleClick = () => {
    if (ad) {
      trackClick(ad.id);
    }
    if (currentAd.target_url) {
      window.open(currentAd.target_url, '_blank');
    }
  };

  return (
    <div data-ev-id="ev_1f49f8bc29" className={`col-span-full py-4 ${className}`}>
      <div data-ev-id="ev_016cf645a5" className="bg-muted/30 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            className="w-full min-h-[90px] max-w-[728px] mx-auto overflow-hidden shadow-lg cursor-pointer"
            style={{ backgroundColor: currentAd.background_color || '#1a1a1a' }}>

            {currentAd.image_url ?
            <img data-ev-id="ev_a1885c4065"
            src={currentAd.image_url}
            alt={currentAd.title || 'פרסומת'}
            className="w-full h-auto object-cover" /> :


            <div data-ev-id="ev_8b9bc49d25" className="w-full h-[90px] flex items-center justify-center gap-4 px-4">
                <div data-ev-id="ev_ac27f9d5c9" className="text-white/40 text-xs">מקום פרסום</div>
                {currentAd.title &&
              <span data-ev-id="ev_5e2f4e459c" className="text-white font-bold">{currentAd.title}</span>
              }
                {currentAd.cta_text &&
              <span data-ev-id="ev_303558d326" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm">
                    {currentAd.cta_text}
                  </span>
              }
              </div>
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);

}

// Helper function to insert ads into an array of items
export function insertAdsIntoFeed<T>(
items: T[],
page: string,
renderItem: (item: T, index: number) => React.ReactNode,
renderAd: (index: number) => React.ReactNode)
: React.ReactNode[] {
  const config = IN_FEED_CONFIG[page];
  if (!config) return items.map(renderItem);

  const result: React.ReactNode[] = [];

  items.forEach((item, index) => {
    result.push(renderItem(item, index));

    // Add ad after every 'interval' items
    if ((index + 1) % config.interval === 0 && index < items.length - 1) {
      result.push(renderAd(index));
    }
  });

  return result;
}

// Export config for admin
export { IN_FEED_CONFIG };