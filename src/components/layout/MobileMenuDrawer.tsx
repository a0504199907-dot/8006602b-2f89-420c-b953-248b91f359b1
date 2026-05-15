import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { staggerContainer, staggerItem } from '@/lib/animations';
import logoImage from '@/assets/uploads/logo.png';

const navItems = [
{ label: 'ראשי', path: '/' },
{ label: 'גליונות', path: '/newspaper' },
{ label: 'שיח הציבור', path: '/siah' },
{ label: 'נייעס בציבור', path: '/news-batzibur' },
{ label: 'בעין הציבור', path: '/bein-hatzibur' },
{ label: 'לפני 18 שנה', path: '/before-18' },
{ label: 'אירועים היסטוריים', path: '/historical' },
{ label: 'גלריות', path: '/gallery' }];


const hebrewDate = 'ה׳ שבט תשפ״ה';

/**
 * Mobile menu drawer (push-menu style).
 *
 * Rendered at the App root, OUTSIDE the page-content wrapper, so it sits
 * on the right edge of the viewport while the page shifts left.
 */
export default function MobileMenuDrawer() {
  const { isOpen, close } = useMobileMenu();
  const location = useLocation();

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop sits over the (now-shifted) page content, blurring/dimming it.
              Click anywhere on it closes the menu. */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          aria-hidden="true" />


          {/* Close button — appears in the visible left strip, over the page */}
          <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ delay: 0.18, duration: 0.2 }}
          onClick={close}
          className="lg:hidden fixed top-3 left-3 z-[80] w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
          aria-label="סגור תפריט">

            <X className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>

          {/* Drawer panel — fixed to right edge. The page wrapper shifts left,
              which "reveals" this panel. We still animate it slightly for polish. */}
          <motion.aside
          initial={{ x: '20%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '20%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden fixed top-0 right-0 bottom-0 w-[78%] max-w-[360px] bg-primary z-[70] flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט ראשי">

            {/* Drawer header with logo */}
            <div data-ev-id="ev_drawer_header" className="bg-primary-dark/40 border-b border-white/10 px-4 py-3 flex items-center justify-center shrink-0">
              <img
              src={logoImage}
              alt="הציבור החרדי"
              className="h-14 w-auto object-contain" />

            </div>

            {/* Gold accent line */}
            <div data-ev-id="ev_drawer_accent" className="h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />

            {/* Menu items */}
            <nav data-ev-id="ev_drawer_nav" className="flex-1 overflow-y-auto px-3 py-4">
              <motion.div
              className="flex flex-col gap-1.5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible">

                {navItems.map((item) =>
              <motion.div key={item.path} variants={staggerItem}>
                    <Link
                  to={item.path}
                  onClick={close}
                  className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.98] ${
                  location.pathname === item.path ?
                  'bg-secondary text-primary shadow-gold font-bold' :
                  'text-white/90 hover:bg-white/10 hover:text-secondary'}`
                  }>

                      {item.label}
                    </Link>
                  </motion.div>
              )}
              </motion.div>
            </nav>

            {/* Footer with Hebrew date */}
            <div data-ev-id="ev_drawer_footer" className="border-t border-white/10 px-4 py-4 shrink-0 bg-primary-dark/30">
              <div data-ev-id="ev_drawer_date" className="flex items-center gap-2 text-white/70 justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
                <span data-ev-id="ev_drawer_date_text" className="text-sm font-medium">{hebrewDate}</span>
              </div>
            </div>
          </motion.aside>
        </>
      }
    </AnimatePresence>);

}
