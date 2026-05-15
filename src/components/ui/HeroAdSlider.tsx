import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useHeroBanners } from '@/hooks/useHeroBanners';

interface Ad {
  id: string;
  imageUrl?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  ctaLink?: string;
  bgGradient?: string;
  showButton?: boolean;
}

interface HeroAdSliderProps {
  height?: string;
  autoPlayInterval?: number;
}

export default function HeroAdSlider({
  height = 'h-[280px] md:h-[320px]',
  autoPlayInterval: propInterval
}: HeroAdSliderProps) {
  const { banners, settings, isLoading } = useHeroBanners();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  // Convert database banners to Ad format
  const activeAds: Ad[] = banners.map((b) => ({
    id: b.id,
    imageUrl: b.image_url,
    title: b.title,
    subtitle: b.subtitle || undefined,
    cta: b.button_text || undefined,
    ctaLink: b.button_link || undefined,
    bgGradient: b.bg_overlay || undefined,
    showButton: b.show_button
  }));

  const autoPlayInterval = propInterval || settings?.autoplay_speed || 5000;
  const showArrows = settings?.show_arrows ?? true;
  const showDots = settings?.show_dots ?? true;
  const pauseOnHover = settings?.pause_on_hover ?? true;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  }, [activeAds.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  }, [activeAds.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (isPaused || activeAds.length <= 1) return;

    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide, activeAds.length]);

  // Reset index when banners change
  useEffect(() => {
    if (currentIndex >= activeAds.length) {
      setCurrentIndex(0);
    }
  }, [activeAds.length, currentIndex]);

  // Don't render if no real ads and not loading
  if (!isLoading && activeAds.length === 0) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div data-ev-id="ev_2a7140c1a2" className={`w-full ${height} bg-muted/30 animate-pulse`} />);

  }

  const currentAd = activeAds[currentIndex];

  // Guard against undefined currentAd
  if (!currentAd) {
    return (
      <div data-ev-id="ev_ffa5c5ac76" className={`relative ${height} overflow-hidden bg-primary flex items-center justify-center`}>
        <p data-ev-id="ev_2ebeaf6618" className="text-white/50">אין באנרים להצגה</p>
      </div>);

  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <div data-ev-id="ev_f1ba82c3af"
    className={`relative ${height} overflow-hidden bg-primary`}
    onMouseEnter={() => pauseOnHover && setIsPaused(true)}
    onMouseLeave={() => pauseOnHover && setIsPaused(false)}>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentAd.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0">

          {/* Background Image */}
          {currentAd.imageUrl &&
          <div data-ev-id="ev_341583ccfb" className="absolute inset-0">
              <img data-ev-id="ev_e456b35f61"
            src={currentAd.imageUrl}
            alt=""
            className="w-full h-full object-cover" />

              <div data-ev-id="ev_942f8746fe" className={`absolute inset-0 bg-gradient-to-l ${currentAd.bgGradient || 'from-black/80 via-black/60 to-black/40'}`} />
            </div>
          }

          {/* Content */}
          <div data-ev-id="ev_396a8e00e1" className="relative h-full container mx-auto px-4 flex items-center">
            <div data-ev-id="ev_656ceaadc0" className="max-w-2xl text-right mr-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-serif mb-4 break-words">

                {currentAd.title}
              </motion.h2>
              {currentAd.subtitle &&
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-white/80 mb-6">

                  {currentAd.subtitle}
                </motion.p>
              }
              {currentAd.showButton !== false && currentAd.cta &&
              <motion.a
                href={currentAd.ctaLink || '#'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 text-lg">

                  {currentAd.cta}
                  <ChevronLeft className="w-5 h-5" />
                </motion.a>
              }
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showArrows && activeAds.length > 1 &&
      <>
          <button data-ev-id="ev_8f5ba92a02"
        onClick={prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110 z-10"
        aria-label="הקודם">

            <ChevronRight className="w-6 h-6" />
          </button>
          <button data-ev-id="ev_1bcc501347"
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110 z-10"
        aria-label="הבא">

            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      }

      {/* Dots Navigation */}
      {showDots && activeAds.length > 1 &&
      <div data-ev-id="ev_902aafe150" className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {activeAds.map((_, index) =>
        <button data-ev-id="ev_c520255d08"
        key={index}
        onClick={() => goToSlide(index)}
        className={`transition-all duration-300 rounded-full ${
        index === currentIndex ?
        'w-8 h-2 bg-secondary' :
        'w-2 h-2 bg-white/50 hover:bg-white/80'}`
        }
        aria-label={`עבור לפרסומת ${index + 1}`} />

        )}
        </div>
      }

      {/* Progress Bar */}
      {activeAds.length > 1 && !isPaused &&
      <div data-ev-id="ev_387401b0f6" className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
          key={currentIndex}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="h-full bg-secondary" />

        </div>
      }
    </div>);

}