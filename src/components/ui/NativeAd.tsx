import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useAdsForSlot, trackImpression, trackClick } from '@/hooks/useAds';

interface NativeAdProps {
  slot: 'native-feed' | 'native-sidebar' | 'in-article-native' | 'sponsored-listing';
  variant?: 'card' | 'inline' | 'list-item';
  className?: string;
}

export default function NativeAd({
  slot,
  variant = 'card',
  className = ''
}: NativeAdProps) {
  const { currentAd, loading } = useAdsForSlot(slot, 'native');
  const impressionTracked = useRef(false);
  const adRef = useRef<HTMLDivElement>(null);

  // Track impression when ad is visible
  useEffect(() => {
    if (!currentAd || impressionTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackImpression(currentAd.id);
          impressionTracked.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [currentAd?.id]);

  const handleClick = () => {
    if (currentAd) {
      trackClick(currentAd.id);
      window.open(currentAd.target_url, '_blank');
    }
  };

  if (loading || !currentAd) return null;

  // Card Variant - looks like a regular article card
  if (variant === 'card') {
    return (
      <motion.div
        ref={adRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleClick}
        className={`group cursor-pointer bg-surface overflow-hidden border border-border hover:border-secondary/30 transition-all duration-300 hover:shadow-lg ${className}`}>

        {/* Image */}
        <div data-ev-id="ev_b1104e78d1" className="relative aspect-video overflow-hidden">
          {currentAd.image_url ?
          <img data-ev-id="ev_c431aea520"
          src={currentAd.image_url}
          alt={currentAd.title || 'תוכן ממומן'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :


          <div data-ev-id="ev_4117a24644"
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: currentAd.background_color || '#1a1a1a' }}>

              <Sparkles className="w-12 h-12 text-amber-500/50" />
            </div>
          }
          
          {/* Sponsored Badge */}
          <div data-ev-id="ev_e2a683a5ef" className="absolute top-2 right-2 px-2 py-1 bg-amber-500/90 text-zinc-900 text-xs font-medium rounded">
            ממומן
          </div>
        </div>

        {/* Content */}
        <div data-ev-id="ev_2e584b2909" className="p-4">
          {currentAd.title &&
          <h3 data-ev-id="ev_a1b29e3a9e" className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-2">
              {currentAd.title}
            </h3>
          }
          {currentAd.subtitle &&
          <p data-ev-id="ev_f2ddf1fa47" className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {currentAd.subtitle}
            </p>
          }
          {currentAd.cta_text &&
          <span data-ev-id="ev_27cba45dd7" className="inline-flex items-center gap-1 text-sm text-secondary font-medium group-hover:underline">
              {currentAd.cta_text}
              <ExternalLink className="w-3 h-3" />
            </span>
          }
        </div>
      </motion.div>);

  }

  // Inline Variant - blends into text content
  if (variant === 'inline') {
    return (
      <motion.div
        ref={adRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClick}
        className={`cursor-pointer p-4 my-4 bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors ${className}`}>

        <div data-ev-id="ev_4269bf2628" className="flex items-start gap-4">
          {currentAd.image_url &&
          <img data-ev-id="ev_15fb0efdcb"
          src={currentAd.image_url}
          alt=""
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />

          }
          <div data-ev-id="ev_591f2eb35e" className="flex-1 min-w-0">
            <div data-ev-id="ev_349bf77bb9" className="flex items-center gap-2 mb-1">
              <span data-ev-id="ev_2869b81b33" className="text-xs text-amber-500 font-medium">ממומן</span>
            </div>
            {currentAd.title &&
            <h4 data-ev-id="ev_e7f543ead2" className="font-bold text-foreground mb-1 line-clamp-1">{currentAd.title}</h4>
            }
            {currentAd.subtitle &&
            <p data-ev-id="ev_305f02a195" className="text-sm text-muted-foreground line-clamp-2">{currentAd.subtitle}</p>
            }
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </motion.div>);

  }

  // List Item Variant - for lists/feeds
  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className={`cursor-pointer flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors ${className}`}>

      <div data-ev-id="ev_ee27824ad4" className="w-1 h-8 bg-amber-500 rounded-full" />
      {currentAd.image_url &&
      <img data-ev-id="ev_db402964d4"
      src={currentAd.image_url}
      alt=""
      className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />

      }
      <div data-ev-id="ev_bca6773093" className="flex-1 min-w-0">
        <span data-ev-id="ev_9e974a9c81" className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">ממומן</span>
        {currentAd.title &&
        <p data-ev-id="ev_8bca262a38" className="font-medium text-foreground text-sm line-clamp-1">{currentAd.title}</p>
        }
      </div>
      <ExternalLink className="w-4 h-4 text-amber-500 flex-shrink-0" />
    </motion.div>);

}