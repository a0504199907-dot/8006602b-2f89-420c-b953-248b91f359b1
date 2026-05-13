import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdsForSlot, trackImpression, trackClick, AD_SLOTS } from '@/hooks/useAds';

interface AdBannerProps {
  size: '728x90' | '300x250' | '160x600' | '320x100' | '970x250' | '970x90' | 'full';
  slot: string;
  className?: string;
  rotationInterval?: number; // in milliseconds, default 6000
}

// Use aspect ratios for responsive sizing - banners will scale properly
const sizeConfig: Record<string, {aspect: string;minHeight: string;maxHeight: string;}> = {
  '728x90': { aspect: 'aspect-[728/90]', minHeight: 'min-h-[60px]', maxHeight: 'max-h-[120px]' },
  '970x90': { aspect: 'aspect-[970/90]', minHeight: 'min-h-[60px]', maxHeight: 'max-h-[120px]' },
  '300x250': { aspect: 'aspect-[300/250]', minHeight: 'min-h-[200px]', maxHeight: 'max-h-[300px]' },
  '160x600': { aspect: 'aspect-[160/600]', minHeight: 'min-h-[400px]', maxHeight: 'max-h-[600px]' },
  '320x100': { aspect: 'aspect-[320/100]', minHeight: 'min-h-[80px]', maxHeight: 'max-h-[120px]' },
  '970x250': { aspect: 'aspect-[970/250]', minHeight: 'min-h-[150px]', maxHeight: 'max-h-[280px]' },
  'full': { aspect: 'aspect-[728/90]', minHeight: 'min-h-[60px]', maxHeight: 'max-h-[150px]' }
};

export default function AdBanner({ size, slot, className = '' }: AdBannerProps) {
  const { currentAd, loading } = useAdsForSlot(slot, size);
  const impressionTracked = useRef(false);

  // Track impression when ad is shown
  useEffect(() => {
    if (currentAd && !impressionTracked.current) {
      trackImpression(currentAd.id);
      impressionTracked.current = true;
    }
  }, [currentAd?.id]);

  // Reset impression tracking when ad changes
  useEffect(() => {
    impressionTracked.current = false;
  }, [currentAd?.id]);

  const handleClick = () => {
    if (currentAd) {
      trackClick(currentAd.id);
      window.open(currentAd.target_url, '_blank');
    }
  };

  // Get responsive config for this size
  const config = sizeConfig[size] || sizeConfig['728x90'];

  // Don't show anything if no real ad
  if (!currentAd) {
    return null;
  }

  // Show real ad from database
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAd.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
        className={`w-full ${config.minHeight} overflow-hidden shadow-card cursor-pointer ${className}`}
        style={{ backgroundColor: currentAd.background_color || '#1a1a1a' }}>

        {currentAd.image_url ?
        // Image-based ad - show full image without cropping
        <div data-ev-id="ev_1246840e72" className="relative w-full">
            <img data-ev-id="ev_97db43a4a4"
          src={currentAd.image_url}
          alt={currentAd.title || 'פרסומת'}
          className="w-full h-auto object-contain"
          style={{ maxHeight: '280px' }} />

            {/* Overlay with text if title exists */}
            {(currentAd.title || currentAd.cta_text) &&
          <div data-ev-id="ev_ac9ea07cc2" className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div data-ev-id="ev_1f9662cb2c" className="flex-1">
                  {currentAd.title &&
              <h3 data-ev-id="ev_9ab5cce4a5" className="text-white font-bold text-lg">{currentAd.title}</h3>
              }
                  {currentAd.subtitle &&
              <p data-ev-id="ev_b1ba01074c" className="text-white/70 text-sm">{currentAd.subtitle}</p>
              }
                </div>
                {currentAd.cta_text &&
            <button data-ev-id="ev_0b3c4573a5" className="bg-secondary hover:bg-secondary-light text-primary font-bold px-4 py-2 rounded-[8px] transition-colors">
                    {currentAd.cta_text}
                  </button>
            }
              </div>
          }
          </div> :

        // Text-only ad
        <div data-ev-id="ev_50227f480c" className="h-full flex items-center justify-between px-6 py-4">
            <div data-ev-id="ev_8e619e6977">
              {currentAd.title &&
            <h3 data-ev-id="ev_add9addf97" className="text-white font-bold text-lg">{currentAd.title}</h3>
            }
              {currentAd.subtitle &&
            <p data-ev-id="ev_b888a8fcda" className="text-white/70 text-sm">{currentAd.subtitle}</p>
            }
            </div>
            {currentAd.cta_text &&
          <button data-ev-id="ev_56cadfa730" className="bg-secondary hover:bg-secondary-light text-primary font-bold px-6 py-2.5 rounded-[8px] transition-colors">
                {currentAd.cta_text}
              </button>
          }
          </div>
        }
      </motion.div>
    </AnimatePresence>);

}

export { AD_SLOTS };