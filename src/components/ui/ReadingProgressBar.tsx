import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

interface ReadingProgressBarProps {
  /** Target element selector to track (default: article content) */
  target?: string;
  /** Show estimated reading time */
  showReadingTime?: boolean;
  /** Show progress percentage */
  showPercentage?: boolean;
  /** Text content for reading time calculation */
  textContent?: string;
  /** Variant style */
  variant?: 'minimal' | 'detailed' | 'floating';
  /** Position */
  position?: 'top' | 'bottom';
  /** Color theme */
  color?: 'gold' | 'blue' | 'green' | 'gradient';
}

/**
 * Reading Progress Bar Component
 * מראה את התקדמות הקריאה בכתבה
 */
export default function ReadingProgressBar({
  target,
  showReadingTime = true,
  showPercentage = true,
  textContent = '',
  variant = 'detailed',
  position = 'top',
  color = 'gold'
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // Calculate reading time (Hebrew average: ~200 words per minute)
  useEffect(() => {
    if (textContent) {
      const words = textContent.split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      setReadingTime(minutes);
    }
  }, [textContent]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      let targetElement: HTMLElement | null = null;

      if (target) {
        targetElement = document.querySelector(target);
      } else {
        // Default: find article content
        targetElement = document.querySelector('article') ||
        document.querySelector('[data-article-content]') ||
        document.querySelector('.article-content');
      }

      if (!targetElement) {
        // Fallback to document scroll
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollTop / docHeight * 100;
        setProgress(Math.min(100, Math.max(0, scrollProgress)));
        setIsVisible(scrollTop > 200);
        return;
      }

      containerRef.current = targetElement;
      const rect = targetElement.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = targetElement.offsetHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show when article is in view
      setIsVisible(scrollTop > elementTop - windowHeight * 0.5);

      // Calculate progress within the article
      const startReading = elementTop - windowHeight * 0.3;
      const endReading = elementTop + elementHeight - windowHeight * 0.7;

      if (scrollTop < startReading) {
        setProgress(0);
      } else if (scrollTop > endReading) {
        setProgress(100);
        setIsComplete(true);
      } else {
        const currentProgress = (scrollTop - startReading) / (endReading - startReading) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
        setIsComplete(false);
      }
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [target]);

  // Calculate time left
  useEffect(() => {
    if (readingTime > 0) {
      const remaining = Math.ceil(readingTime * (1 - progress / 100));
      setTimeLeft(remaining);
    }
  }, [progress, readingTime]);

  // Color schemes
  const colorSchemes = {
    gold: {
      bar: 'bg-gradient-to-r from-secondary via-amber-400 to-secondary',
      bg: 'bg-secondary/20',
      text: 'text-secondary'
    },
    blue: {
      bar: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500',
      bg: 'bg-blue-500/20',
      text: 'text-blue-500'
    },
    green: {
      bar: 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-500'
    },
    gradient: {
      bar: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
      bg: 'bg-purple-500/20',
      text: 'text-purple-500'
    }
  };

  const colors = colorSchemes[color];

  // Minimal variant - just a thin line
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 h-1 ${colors.bg}`}>

        <motion.div
          className={`h-full ${colors.bar}`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }} />

      </motion.div>);

  }

  // Floating variant - shows in corner
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
          y: isVisible ? 0 : 20
        }}
        className="fixed bottom-20 left-4 z-50">

        <div data-ev-id="ev_55374665bb" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 p-4 min-w-[120px]">
          {/* Circular Progress */}
          <div data-ev-id="ev_db5a4112f2" className="relative w-16 h-16 mx-auto mb-2">
            <svg data-ev-id="ev_62e00437cd" className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle data-ev-id="ev_5311a05d77"
              cx="18" cy="18" r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200" />

              <circle data-ev-id="ev_20f5ecde44"
              cx="18" cy="18" r="16"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${progress}, 100`} />

              <defs data-ev-id="ev_f2cd5e2619">
                <linearGradient data-ev-id="ev_9b0194cc08" id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop data-ev-id="ev_210f493727" offset="0%" stopColor="#d4af37" />
                  <stop data-ev-id="ev_b67bf592ec" offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div data-ev-id="ev_f99bea2091" className="absolute inset-0 flex items-center justify-center">
              {isComplete ?
              <CheckCircle className={`w-6 h-6 ${colors.text}`} /> :

              <span data-ev-id="ev_b52250ebb7" className={`text-sm font-bold ${colors.text}`}>
                  {Math.round(progress)}%
                </span>
              }
            </div>
          </div>
          
          {/* Time Left */}
          {showReadingTime && timeLeft > 0 && !isComplete &&
          <div data-ev-id="ev_12f985b1f9" className="text-center text-xs text-gray-500">
              <Clock className="w-3 h-3 inline ml-1" />
              {timeLeft} דק' נותרו
            </div>
          }
          
          {isComplete &&
          <div data-ev-id="ev_af63ce660b" className="text-center text-xs text-emerald-500 font-medium">
              קריאה הושלמה!
            </div>
          }
        </div>
      </motion.div>);

  }

  // Detailed variant (default) - full bar with info
  return (
    <motion.div
      initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : position === 'top' ? -100 : 100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 shadow-sm`}>

      <div data-ev-id="ev_306102f631" className="container mx-auto px-4">
        <div data-ev-id="ev_57c642f77d" className="flex items-center justify-between py-2">
          {/* Left side - Reading info */}
          <div data-ev-id="ev_7e35c96b93" className="flex items-center gap-4 text-sm">
            {showReadingTime && readingTime > 0 &&
            <div data-ev-id="ev_9b724538fa" className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span data-ev-id="ev_c646f325b4">{readingTime} דק' קריאה</span>
              </div>
            }
            
            {timeLeft > 0 && !isComplete &&
            <div data-ev-id="ev_aadc04b6a0" className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-4 h-4" />
                <span data-ev-id="ev_e9a7018311">{timeLeft} דק' נותרו</span>
              </div>
            }
            
            {isComplete &&
            <div data-ev-id="ev_db1141ab56" className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-4 h-4" />
                <span data-ev-id="ev_d8334bab2c">קריאה הושלמה!</span>
              </div>
            }
          </div>

          {/* Right side - Progress */}
          {showPercentage &&
          <div data-ev-id="ev_facf870d6c" className={`font-bold text-sm ${colors.text}`}>
              {Math.round(progress)}%
            </div>
          }
        </div>
      </div>

      {/* Progress bar */}
      <div data-ev-id="ev_8b3befc103" className={`h-1 ${colors.bg}`}>
        <motion.div
          className={`h-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }} />

      </div>
    </motion.div>);

}

// Hook for custom implementations
export function useReadingProgress(targetSelector?: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      let target: HTMLElement | null = null;

      if (targetSelector) {
        target = document.querySelector(targetSelector);
      }

      if (!target) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollTop / docHeight * 100);
        return;
      }

      const rect = target.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = target.offsetHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      const startReading = elementTop - windowHeight * 0.3;
      const endReading = elementTop + elementHeight - windowHeight * 0.7;

      if (scrollTop < startReading) {
        setProgress(0);
      } else if (scrollTop > endReading) {
        setProgress(100);
      } else {
        const currentProgress = (scrollTop - startReading) / (endReading - startReading) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetSelector]);

  return progress;
}