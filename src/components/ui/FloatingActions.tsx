import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-ev-id="ev_b4784e3ac8" className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {showScrollTop &&
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-secondary text-primary shadow-gold flex items-center justify-center"
          aria-label="חזרה למעלה">

            <ArrowUp className="w-5 h-5" />
          </motion.button>
        }
      </AnimatePresence>
    </div>);

}