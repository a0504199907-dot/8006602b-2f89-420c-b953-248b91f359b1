import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useAdsForSlot, trackImpression, trackClick } from '@/hooks/useAds';

interface PopupAdProps {
  slot: 'popup' | 'popup-exit';
  delay?: number; // Delay before showing (ms)
  showOnce?: boolean; // Show only once per session
  className?: string;
}

export default function PopupAd({
  slot,
  delay = 3000,
  showOnce = true,
  className = ''
}: PopupAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { currentAd, loading } = useAdsForSlot(slot, '600x400');
  const impressionTracked = useRef(false);

  // Show popup after delay (for regular popup)
  useEffect(() => {
    if (slot === 'popup' && !hasShown && currentAd) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [slot, delay, hasShown, currentAd]);

  // Exit intent detection (for popup-exit)
  useEffect(() => {
    if (slot !== 'popup-exit' || hasShown || !currentAd) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [slot, hasShown, currentAd]);

  // Track impression
  useEffect(() => {
    if (isVisible && currentAd && !impressionTracked.current) {
      trackImpression(currentAd.id);
      impressionTracked.current = true;
    }
  }, [isVisible, currentAd?.id]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) {
      sessionStorage.setItem(`popup-${slot}-shown`, 'true');
    }
  };

  const handleClick = () => {
    if (currentAd) {
      trackClick(currentAd.id);
      window.open(currentAd.target_url, '_blank');
    }
  };

  // Check if already shown this session
  useEffect(() => {
    if (showOnce && sessionStorage.getItem(`popup-${slot}-shown`)) {
      setHasShown(true);
    }
  }, [slot, showOnce]);

  if (loading || !currentAd) return null;

  return (
    <AnimatePresence>
      {isVisible &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}>

          <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full ${className}`}>

            {/* Close Button */}
            <button data-ev-id="ev_6b02a22420"
          onClick={handleClose}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors">

              <X className="w-4 h-4" />
            </button>

            {/* Ad Content */}
            <div data-ev-id="ev_b768338c72"
          onClick={handleClick}
          className="cursor-pointer">

              {currentAd.image_url ?
            <img data-ev-id="ev_0096fd1f87"
            src={currentAd.image_url}
            alt={currentAd.title || 'פרסומת'}
            className="w-full h-auto" /> :


            <div data-ev-id="ev_49a850df3f"
            className="p-8 text-center"
            style={{ backgroundColor: currentAd.background_color || '#1a1a1a' }}>

                  {currentAd.title &&
              <h3 data-ev-id="ev_0c2f5552de" className="text-2xl font-bold text-white mb-2">{currentAd.title}</h3>
              }
                  {currentAd.subtitle &&
              <p data-ev-id="ev_e0e43f9acd" className="text-zinc-300 mb-4">{currentAd.subtitle}</p>
              }
                  {currentAd.cta_text &&
              <span data-ev-id="ev_469b854351" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-900 font-bold rounded-xl hover:bg-amber-400 transition-colors">
                      {currentAd.cta_text}
                      <ExternalLink className="w-4 h-4" />
                    </span>
              }
                </div>
            }
            </div>

            {/* Sponsor Label */}
            <div data-ev-id="ev_aaae4411bb" className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-zinc-400">
              ממומן
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}