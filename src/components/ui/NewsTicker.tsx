import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCache, CACHE_KEYS } from '@/lib/cache';

/**
 * Ultra-fast NewsTicker that uses already-cached data
 * No additional network requests - instant display
 */
export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState<string[]>([]);

  // Use already-cached data from other hooks - no extra fetch!
  useEffect(() => {
    const getNewsFromCache = () => {
      // Try siah articles first
      const siahArticles = getCache<any[]>(CACHE_KEYS.SIAH_ARTICLES);
      if (siahArticles?.length) {
        return siahArticles.slice(0, 5).map((a) => a.title);
      }

      // Fallback to news batzibur
      const newsItems = getCache<any[]>(CACHE_KEYS.NEWS_BATZIBUR);
      if (newsItems?.length) {
        return newsItems.slice(0, 5).map((a) => a.title);
      }

      return [];
    };

    // Initial load from cache
    setNewsItems(getNewsFromCache());

    // Check cache periodically for updates (when other hooks refresh data)
    const interval = setInterval(() => {
      const cached = getNewsFromCache();
      if (cached.length > 0) {
        setNewsItems(cached);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  const goToNext = () => {
    if (newsItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const goToPrev = () => {
    if (newsItems.length === 0) return;
    setCurrentIndex((prev) => prev === 0 ? newsItems.length - 1 : prev - 1);
  };

  // Show minimal placeholder while waiting for cache (very brief)
  if (newsItems.length === 0) {
    return (
      <div data-ev-id="ev_cf36bfb9f9" className="bg-gradient-to-r from-primary via-primary-light to-primary">
        <div data-ev-id="ev_52a63b79f4" className="container mx-auto px-3 sm:px-4">
          <div data-ev-id="ev_d28d465b33" className="flex items-center py-2.5 sm:py-3">
            <div data-ev-id="ev_4b3981cabc" className="flex items-center gap-1.5 sm:gap-2 pl-3 sm:pl-5 border-l border-secondary/30 ml-3 sm:ml-5 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span data-ev-id="ev_dcd231dfa3" className="font-bold text-xs sm:text-sm text-secondary">עדכונים</span>
            </div>
            <div data-ev-id="ev_327bb63ec7" className="flex-1 px-2 sm:px-4">
              <span data-ev-id="ev_197255e6df" className="text-xs sm:text-sm text-white/50">...</span>
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_9cf453454e" className="bg-gradient-to-r from-primary via-primary-light to-primary overflow-hidden">
      <div data-ev-id="ev_d82ee40855" className="container mx-auto px-3 sm:px-4">
        <div data-ev-id="ev_d2ae728417" className="flex items-center py-2.5 sm:py-3">
          {/* Breaking label */}
          <div data-ev-id="ev_617c353011" className="flex items-center gap-1.5 sm:gap-2 pl-3 sm:pl-5 border-l border-secondary/30 ml-3 sm:ml-5 shrink-0">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>

              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <motion.span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />

            </motion.div>
            <span data-ev-id="ev_903b6fd02d" className="font-bold text-xs sm:text-sm text-secondary">עדכונים</span>
          </div>

          {/* News content */}
          <div data-ev-id="ev_7dbc23919b" className="flex-1 overflow-hidden px-2 sm:px-4 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}>

                <span data-ev-id="ev_c3810ea449" className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                  {newsItems[currentIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {newsItems.length > 1 &&
          <div data-ev-id="ev_550e8b3b97" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrev}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-[6px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">

                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
              {/* Dots - hidden on mobile */}
              <div data-ev-id="ev_e8fafa8f2d" className="hidden sm:flex items-center gap-1.5 px-2">
                {newsItems.map((_, idx) =>
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-colors ${
                idx === currentIndex ?
                'bg-secondary' :
                'bg-white/30 hover:bg-white/50'}`
                }
                animate={{ width: idx === currentIndex ? 20 : 8 }}
                transition={{ duration: 0.3 }} />

              )}
              </div>
              <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-[6px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">

                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </div>
          }
        </div>
      </div>
    </div>);

}