import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ExternalLink } from 'lucide-react';
import { useAdsForSlot, trackImpression, trackClick } from '@/hooks/useAds';

interface InterstitialAdProps {
  slot?: 'interstitial' | 'welcome-mat';
  skipDelay?: number; // Seconds before skip button appears
  autoClose?: number; // Auto close after X seconds (0 = disabled)
  onClose?: () => void;
  className?: string;
}

export default function InterstitialAd({
  slot = 'interstitial',
  skipDelay = 5,
  autoClose = 0,
  onClose,
  className = ''
}: InterstitialAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(skipDelay);
  const [canSkip, setCanSkip] = useState(skipDelay === 0);
  const size = slot === 'welcome-mat' ? 'fullscreen' : '640x480';
  const { currentAd, loading } = useAdsForSlot(slot, size);
  const impressionTracked = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && isVisible) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, isVisible]);

  // Auto close timer
  useEffect(() => {
    if (autoClose > 0 && isVisible && canSkip) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, canSkip]);

  // Track impression
  useEffect(() => {
    if (isVisible && currentAd && !impressionTracked.current) {
      trackImpression(currentAd.id);
      impressionTracked.current = true;
    }
  }, [isVisible, currentAd?.id]);

  // Prevent body scroll when visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleClick = () => {
    if (currentAd) {
      trackClick(currentAd.id);
      window.open(currentAd.target_url, '_blank');
    }
  };

  if (loading || !currentAd) return null;

  return (
    <AnimatePresence>
      {isVisible &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[200] bg-black ${className}`}>

          {/* Skip/Close Button */}
          <div data-ev-id="ev_3c1e8d2d6b" className="absolute top-4 left-4 z-10">
            {canSkip ?
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors">

                <X className="w-4 h-4" />
                דלג
              </motion.button> :

          <div data-ev-id="ev_e39c504f5b" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white/70 rounded-full">
                <Clock className="w-4 h-4" />
                דלג בעוד {countdown} שניות
              </div>
          }
          </div>

          {/* Progress Bar */}
          {!canSkip &&
        <div data-ev-id="ev_2ca8111741" className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: skipDelay, ease: 'linear' }}
            className="h-full bg-amber-500" />

            </div>
        }

          {/* Ad Content */}
          <div data-ev-id="ev_7bc921d913"
        className="w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleClick}>

            {currentAd.image_url ?
          <img data-ev-id="ev_42edf8d8e2"
          src={currentAd.image_url}
          alt={currentAd.title || 'פרסומת'}
          className="max-w-full max-h-full object-contain" /> :


          <div data-ev-id="ev_d80f69a4eb"
          className="w-full h-full flex flex-col items-center justify-center p-8"
          style={{ backgroundColor: currentAd.background_color || '#000' }}>

                {currentAd.title &&
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">

                    {currentAd.title}
                  </motion.h2>
            }
                {currentAd.subtitle &&
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-300 mb-8 text-center max-w-2xl">

                    {currentAd.subtitle}
                  </motion.p>
            }
                {currentAd.cta_text &&
            <motion.span
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 text-zinc-900 text-xl font-bold rounded-2xl hover:bg-amber-400 transition-colors">

                    {currentAd.cta_text}
                    <ExternalLink className="w-5 h-5" />
                  </motion.span>
            }
              </div>
          }
          </div>

          {/* Sponsor Label */}
          <div data-ev-id="ev_179173e8bd" className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white/60">
            מודעה ממומנת
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}