import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, ExternalLink, Play, Pause, Clock } from 'lucide-react';
import { useAdsForSlot, trackImpression, trackClick } from '@/hooks/useAds';

interface VideoAdProps {
  slot: 'video-preroll' | 'video-midroll' | 'video-postroll' | 'video-overlay';
  onComplete?: () => void;
  onSkip?: () => void;
  skipAfter?: number; // Seconds before skip is allowed
  className?: string;
}

export default function VideoAd({
  slot,
  onComplete,
  onSkip,
  skipAfter = 5,
  className = ''
}: VideoAdProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(skipAfter === 0);
  const [countdown, setCountdown] = useState(skipAfter);
  const [duration] = useState(15); // Simulated video duration
  const { currentAd, loading } = useAdsForSlot(slot, 'video');
  const impressionTracked = useRef(false);
  const progressRef = useRef<number>(0);

  // Track impression
  useEffect(() => {
    if (currentAd && !impressionTracked.current) {
      trackImpression(currentAd.id);
      impressionTracked.current = true;
    }
  }, [currentAd?.id]);

  // Countdown to skip
  useEffect(() => {
    if (countdown > 0 && isPlaying) {
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
  }, [countdown, isPlaying]);

  // Simulate video progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      progressRef.current += 100 / (duration * 10);
      setProgress(progressRef.current);

      if (progressRef.current >= 100) {
        onComplete?.();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration, onComplete]);

  const handleSkip = () => {
    if (canSkip) {
      onSkip?.();
    }
  };

  const handleClick = () => {
    if (currentAd) {
      trackClick(currentAd.id);
      window.open(currentAd.target_url, '_blank');
    }
  };

  if (loading || !currentAd) return null;

  // Overlay variant (banner over video)
  if (slot === 'video-overlay') {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={`absolute bottom-12 left-0 right-0 mx-4 ${className}`}>

        <div data-ev-id="ev_8061d9a9d9"
        onClick={handleClick}
        className="cursor-pointer bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 backdrop-blur-sm p-3 border border-zinc-700 flex items-center gap-4">

          <button data-ev-id="ev_5949ea2f42"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(false);
            onSkip?.();
          }}
          className="w-6 h-6 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">

            <X className="w-3 h-3" />
          </button>
          
          {currentAd.image_url &&
          <img data-ev-id="ev_fa08eb204c"
          src={currentAd.image_url}
          alt=""
          className="w-16 h-10 rounded object-cover" />

          }
          
          <div data-ev-id="ev_6f8a8c5aa4" className="flex-1 min-w-0">
            <p data-ev-id="ev_173d17b5f1" className="text-white font-medium text-sm truncate">{currentAd.title}</p>
            <p data-ev-id="ev_55e6f62abd" className="text-zinc-400 text-xs truncate">{currentAd.subtitle}</p>
          </div>
          
          {currentAd.cta_text &&
          <span data-ev-id="ev_2f007a3fc8" className="px-3 py-1.5 bg-amber-500 text-zinc-900 text-sm font-medium rounded-lg whitespace-nowrap">
              {currentAd.cta_text}
            </span>
          }
        </div>
      </motion.div>);

  }

  // Full video ad (preroll/midroll/postroll)
  return (
    <div data-ev-id="ev_1b86ad4439" className={`relative bg-black aspect-video ${className}`}>
      {/* Video/Image Content */}
      <div data-ev-id="ev_9f934c67c4"
      onClick={handleClick}
      className="absolute inset-0 cursor-pointer flex items-center justify-center">

        {currentAd.image_url ?
        <img data-ev-id="ev_6cd7a31467"
        src={currentAd.image_url}
        alt={currentAd.title || ''}
        className="w-full h-full object-cover" /> :


        <div data-ev-id="ev_85f457662b"
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: currentAd.background_color || '#000' }}>

            <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>

              {currentAd.title &&
            <h3 data-ev-id="ev_5a8b6abd9d" className="text-2xl md:text-4xl font-bold text-white text-center mb-3">
                  {currentAd.title}
                </h3>
            }
            </motion.div>
            {currentAd.subtitle &&
          <p data-ev-id="ev_6e5ec7b0db" className="text-lg text-zinc-300 text-center mb-6">{currentAd.subtitle}</p>
          }
            {currentAd.cta_text &&
          <span data-ev-id="ev_3b48d7031b" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-900 font-bold rounded-xl">
                {currentAd.cta_text}
                <ExternalLink className="w-4 h-4" />
              </span>
          }
          </div>
        }
      </div>

      {/* Controls Overlay */}
      <div data-ev-id="ev_26fa139906" className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div data-ev-id="ev_9cb3c80d15" className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
          <div data-ev-id="ev_791c00c69f" className="flex items-center gap-3">
            <span data-ev-id="ev_b799d337c3" className="px-2 py-1 bg-amber-500/90 text-zinc-900 text-xs font-medium rounded">
              פרסומת
            </span>
            {!canSkip &&
            <span data-ev-id="ev_b83d86e5d6" className="flex items-center gap-1 text-white/70 text-sm">
                <Clock className="w-3 h-3" />
                דלג בעוד {countdown}
              </span>
            }
          </div>
          
          <div data-ev-id="ev_3328fecaac" className="flex items-center gap-2">
            <button data-ev-id="ev_f5d275d3ab"
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center">

              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            {canSkip &&
            <button data-ev-id="ev_d1fdf4839f"
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30">

                דלג
                <X className="w-3 h-3" />
              </button>
            }
          </div>
        </div>

        {/* Play/Pause Center */}
        <div data-ev-id="ev_34e17d77e7" className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button data-ev-id="ev_51a0a07dbc"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">

            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div data-ev-id="ev_9e17077f6a" className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-amber-500"
            style={{ width: `${progress}%` }} />

        </div>
      </div>
    </div>);

}