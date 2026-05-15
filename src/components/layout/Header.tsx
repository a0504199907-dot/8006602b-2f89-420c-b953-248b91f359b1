import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import SmartSearch from '@/components/ui/SmartSearch';
import logoImage from '@/assets/uploads/logo.png';
import { easings, staggerContainer, staggerItem, transitions } from '@/lib/animations';

const navItems = [
{ label: 'ראשי', path: '/' },
{ label: 'גליונות', path: '/newspaper' },
{ label: 'שיח הציבור', path: '/siah' },
{ label: 'נייעס בציבור', path: '/news-batzibur' },
{ label: 'בעין הציבור', path: '/bein-hatzibur' },
{ label: 'לפני 18 שנה', path: '/before-18' },
{ label: 'אירועים היסטוריים', path: '/historical' },
{ label: 'גלריות', path: '/gallery' }];


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isScrolled } = useScrollPosition();

  const hebrewDate = 'ה׳ שבט תשפ״ה';

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header data-ev-id="ev_55b7b6dc80" className="sticky top-0 z-50">
      {/* Main Header */}
      <div data-ev-id="ev_29654ba9d3"
      className={`transition-all duration-300 ${
      isScrolled ?
      'bg-primary/95 backdrop-blur-md shadow-elevated' :
      'bg-primary shadow-elevated'}`
      }>

        <div data-ev-id="ev_7751f66072" className="container mx-auto px-3 sm:px-4">
          <div data-ev-id="ev_4c16ddd369" className="flex items-center justify-between py-2 sm:py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img data-ev-id="ev_a0c1719d6a"
              src={logoImage}
              alt="הציבור החרדי"
              className="w-auto object-contain transition-all duration-300 h-14 sm:h-20" />

            </Link>

            {/* Center - Hebrew Date (Desktop) */}
            <div data-ev-id="ev_0e646eeb1c" className="hidden lg:flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4 text-secondary" />
              <span data-ev-id="ev_c2dc845b20" className="font-medium text-white">{hebrewDate}</span>
            </div>

            {/* Right Side Actions */}
            <div data-ev-id="ev_e30d36a25f" className="flex items-center gap-2 sm:gap-3">
              {/* Smart Search */}
              <SmartSearch />

              {/* Mobile Menu Button */}
              <button data-ev-id="ev_67517e1b14"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">

                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <nav data-ev-id="ev_6d2bf4969d" className="hidden lg:block bg-primary-dark/50 border-t border-white/10">
          <div data-ev-id="ev_e782ccbf3a" className="container mx-auto px-4">
            <div data-ev-id="ev_8dce4f88d0" className="flex items-center justify-center gap-1">
              {navItems.map((item) =>
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] relative group ${
                location.pathname === item.path ?
                'text-secondary' :
                'text-white/90 hover:text-secondary'}`
                }>

                  <span data-ev-id="ev_96c207c82f" className="relative z-10">{item.label}</span>
                  {/* Hover background */}
                  <span data-ev-id="ev_6ac2ef6364" className="absolute inset-0 bg-white/5 rounded-lg scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]" />
                  {/* Active indicator */}
                  {location.pathname === item.path &&
                <motion.div
                  layoutId="activeNav"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />

                }
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Gold accent line */}
        <div data-ev-id="ev_fbcd715f51" className="h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      </div>

      {/* Mobile Navigation - Side Drawer (like Channel 14) */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <>
            {/* Backdrop covering the page content on the left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60]"
              aria-hidden="true" />


            {/* Close button - in the visible page area on the left */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed top-3 left-3 z-[80] w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
              aria-label="סגור תפריט">

              <X className="w-6 h-6" />
            </motion.button>

            {/* Drawer - slides in from the right (RTL) */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[78%] max-w-[360px] bg-primary z-[70] flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="תפריט ראשי">

              {/* Drawer Header with logo */}
              <div data-ev-id="ev_drawer_header" className="bg-primary-dark/40 border-b border-white/10 px-4 py-3 flex items-center justify-center shrink-0">
                <img
                  src={logoImage}
                  alt="הציבור החרדי"
                  className="h-14 w-auto object-contain" />

              </div>

              {/* Gold accent line */}
              <div data-ev-id="ev_drawer_accent" className="h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />

              {/* Menu Items */}
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
                        onClick={() => setMobileMenuOpen(false)}
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

              {/* Footer with Hebrew Date */}
              <div data-ev-id="ev_drawer_footer" className="border-t border-white/10 px-4 py-4 shrink-0 bg-primary-dark/30">
                <div data-ev-id="ev_drawer_date" className="flex items-center gap-2 text-white/70 justify-center">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span data-ev-id="ev_drawer_date_text" className="text-sm font-medium">{hebrewDate}</span>
                </div>
              </div>
            </motion.aside>
          </>
        }
      </AnimatePresence>
    </header>);

}