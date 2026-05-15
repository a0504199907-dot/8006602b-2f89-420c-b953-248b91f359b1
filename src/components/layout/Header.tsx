import { Link, useLocation } from 'react-router';
import { Menu, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import SmartSearch from '@/components/ui/SmartSearch';
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


export default function Header() {
  const location = useLocation();
  const { isScrolled } = useScrollPosition();
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu } = useMobileMenu();

  const hebrewDate = 'ה׳ שבט תשפ״ה';

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
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              aria-label={mobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
              aria-expanded={mobileMenuOpen}>

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
    </header>);

}
