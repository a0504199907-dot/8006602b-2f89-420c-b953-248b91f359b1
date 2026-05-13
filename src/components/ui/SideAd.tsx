import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackImpression, trackClick, trackDismiss } from '@/hooks/useAds';

interface SideAdProps {
  slot: string;
  side: 'left' | 'right';
}

interface AdData {
  id: string;
  title: string | null;
  image_url: string | null;
  target_url: string;
  background_color: string | null;
  cta_text: string | null;
}

const DEFAULT_AD: AdData = {
  id: 'default',
  title: 'פרסמו אצלנו',
  image_url: null,
  target_url: '/contact',
  background_color: '#1a1a1a',
  cta_text: 'צרו קשר'
};

export default function SideAd({ slot, side }: SideAdProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const impressionTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAd = async () => {
      if (!supabase) {
        setAd(DEFAULT_AD);
        setLoaded(true);
        return;
      }

      // Fast timeout - 3 seconds max
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data: placements, error } = await supabase
          .from('ad_placements')
          .select('*, creative:ad_creatives(*)')
          .eq('slot_name', slot)
          .eq('is_active', true)
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (cancelled) return;

        if (error || !placements?.[0]) {
          setAd(DEFAULT_AD);
          setLoaded(true);
          return;
        }

        const creative = placements[0].creative;
        if (creative?.is_active) {
          setAd({
            id: creative.id,
            title: creative.title,
            image_url: creative.image_url,
            target_url: creative.target_url || '/contact',
            background_color: creative.background_color,
            cta_text: creative.cta_text
          });
        } else {
          setAd(DEFAULT_AD);
        }
        setLoaded(true);
      } catch (e: any) {
        clearTimeout(timeoutId);
        if (e?.name !== 'AbortError') {
          console.error('Error fetching side ad:', e);
        }
        setAd(DEFAULT_AD);
        setLoaded(true);
      }
    };

    fetchAd();
    return () => { cancelled = true; };
  }, [slot]);

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
    <div data-ev-id="ev_ef2b6b90b1"
    className="w-[160px] h-[600px] overflow-hidden cursor-pointer shadow-lg"
    style={{ backgroundColor: ad.background_color || '#1a1a1a' }}
    onClick={handleClick}>

      <button data-ev-id="ev_a659314114"
      onClick={handleDismiss}
      className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-colors rounded"
      title="סגור">

        <X className="w-4 h-4" />
      </button>

      {ad.image_url ?
      <>
          {!imageLoaded &&
        <div data-ev-id="ev_47279409e6" className="w-full h-full bg-muted/30 animate-pulse" />
        }
          <img data-ev-id="ev_0e601748ec"
        src={ad.image_url}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)} />

        </> :

      <div data-ev-id="ev_5ef104941f" className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 text-center bg-gradient-to-b from-zinc-800 to-zinc-900">
          <div data-ev-id="ev_4418430f8d" className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
            <span data-ev-id="ev_170ed8abf5" className="text-3xl">📢</span>
          </div>
          {ad.title &&
        <h3 data-ev-id="ev_ea36c0f188" className="text-white font-bold text-xl leading-tight">{ad.title}</h3>
        }
          <p data-ev-id="ev_d5fc7a510d" className="text-white/60 text-sm">מקום פרסום זמין</p>
          {ad.cta_text &&
        <span data-ev-id="ev_fdc410e8ce" className="px-6 py-3 bg-secondary text-primary font-bold text-sm rounded-lg">
              {ad.cta_text}
            </span>
        }
        </div>
      }
      
      {/* NO label - removed */}
    </div>);

}