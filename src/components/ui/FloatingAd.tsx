import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackImpression, trackClick, trackDismiss, PageType } from '@/hooks/useAds';

interface FloatingAdProps {
  pageType: PageType;
  side: 'left' | 'right';
  section?: string;
  articleId?: string;
}

interface AdData {
  id: string;
  title: string | null;
  image_url: string | null;
  target_url: string;
  background_color: string | null;
  cta_text: string | null;
}

// Default fallback ad when no database ad exists
const DEFAULT_AD: AdData = {
  id: 'default',
  title: 'פרסמו אצלנו',
  image_url: null,
  target_url: '/advertise',
  background_color: '#1a1a1a',
  cta_text: 'צרו קשר'
};

export default function FloatingAd({ pageType, side, section, articleId }: FloatingAdProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const impressionTracked = useRef(false);

  // Build slot name: e.g., "home-floating-left" or "section-floating-right"
  const slotName = `${pageType}-floating-${side}`;

  useEffect(() => {
    let cancelled = false;

    const fetchAd = async () => {
      if (!supabase) {
        setAd(DEFAULT_AD);
        setLoaded(true);
        return;
      }

      // Longer timeout - 15 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const now = new Date().toISOString();

        const { data: placements, error } = await supabase.
        from('ad_placements').
        select(`
            *,
            ad_creatives (
              id,
              title,
              image_url,
              target_url,
              background_color,
              cta_text,
              is_active,
              ad_campaigns (
                status,
                start_date,
                end_date
              )
            )
          `).
        eq('slot_name', slotName).
        eq('is_active', true).
        abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (cancelled) return;

        if (error || !placements?.length) {
          setAd(DEFAULT_AD);
          setLoaded(true);
          return;
        }

        // Filter and prioritize: article > section > default
        let selectedPlacement = null;

        for (const placement of placements) {
          const creative = placement.ad_creatives as any;
          if (!creative?.is_active) continue;

          const campaign = creative.ad_campaigns as any;
          if (!campaign || campaign.status !== 'active') continue;

          if (campaign.start_date && new Date(campaign.start_date) > new Date(now)) continue;
          if (campaign.end_date && new Date(campaign.end_date) < new Date(now)) continue;

          // Prioritize by targeting level
          if (articleId && placement.article_id === articleId) {
            selectedPlacement = placement;
            break; // Article-specific takes highest priority
          } else if (section && placement.section === section && !placement.article_id) {
            if (!selectedPlacement || selectedPlacement.section === 'default') {
              selectedPlacement = placement;
            }
          } else if ((!placement.section || placement.section === 'default') && !placement.article_id) {
            if (!selectedPlacement) {
              selectedPlacement = placement;
            }
          }
        }

        if (!selectedPlacement) {
          setAd(DEFAULT_AD);
          setLoaded(true);
          return;
        }

        const creative = selectedPlacement.ad_creatives as any;
        setAd({
          id: creative.id,
          title: creative.title,
          image_url: creative.image_url,
          target_url: creative.target_url || '/advertise',
          background_color: creative.background_color,
          cta_text: creative.cta_text
        });
        setLoaded(true);
      } catch (e: any) {
        clearTimeout(timeoutId);
        // Silent fail - just show default ad
        if (e?.name !== 'AbortError') {
          console.error('Error fetching floating ad:', e);
        }
        setAd(DEFAULT_AD);
        setLoaded(true);
      }
    };

    // Fast load - no delay
    fetchAd();
    return () => {cancelled = true;};
  }, [slotName, section, articleId]);

  useEffect(() => {
    if (ad && ad.id !== 'default' && !impressionTracked.current && isVisible) {
      trackImpression(ad.id);
      impressionTracked.current = true;
    }
  }, [ad, isVisible]);

  const handleClick = () => {
    if (ad && ad.id !== 'default') {
      trackClick(ad.id);
    }
    if (ad?.target_url) {
      window.open(ad.target_url, '_blank');
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ad && ad.id !== 'default') {
      trackDismiss(ad.id); // Track X click
    }
    setIsVisible(false);
  };

  if (!isVisible || !loaded || !ad) return null;

  return (
    <div data-ev-id="ev_fbef86824e"
    className="relative w-[160px] h-[600px] overflow-hidden cursor-pointer shadow-lg"
    style={{ backgroundColor: ad.background_color || '#1a1a1a' }}
    onClick={handleClick}>

      {/* X Button to close */}
      <button data-ev-id="ev_c1b7622858"
      onClick={handleDismiss}
      className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-colors"
      title="סגור">

        <X className="w-4 h-4" />
      </button>

      {ad.image_url ?
      <>
          {!imageLoaded &&
        <div data-ev-id="ev_0315f44f72" className="w-full h-full bg-muted/30 animate-pulse" />
        }
          <img data-ev-id="ev_58e11a98d7"
        src={ad.image_url}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)} />

        </> :

      <div data-ev-id="ev_2a4507be0e" className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 text-center bg-gradient-to-b from-zinc-800 to-zinc-900">
          <div data-ev-id="ev_fa0a2a1fac" className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
            <span data-ev-id="ev_9da927f82a" className="text-3xl">📢</span>
          </div>
          {ad.title &&
        <h3 data-ev-id="ev_63a3f3458c" className="text-white font-bold text-xl leading-tight">{ad.title}</h3>
        }
          <p data-ev-id="ev_53b1696649" className="text-white/60 text-sm">מקום פרסום זמין</p>
          {ad.cta_text &&
        <span data-ev-id="ev_ad32c1da4f" className="px-6 py-3 bg-secondary text-primary font-bold text-sm">
              {ad.cta_text}
            </span>
        }
        </div>
      }
    </div>);

}