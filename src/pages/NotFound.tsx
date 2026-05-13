import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home, Search, ArrowRight, Newspaper, Image, Calendar, Video, BookOpen } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function NotFound() {
  // SEO - noIndex for 404 page
  useSEO({
    title: 'הדף לא נמצא',
    description: 'הדף שחיפשת לא קיים. חזרו לדף הבית או חפשו תוכן אחר.',
    noIndex: true
  });
  const quickLinks = [
  { to: '/', label: 'דף הבית', icon: Home, color: 'from-amber-500 to-orange-500' },
  { to: '/news', label: 'חדשות', icon: Newspaper, color: 'from-blue-500 to-cyan-500' },
  { to: '/gallery', label: 'גלריות', icon: Image, color: 'from-pink-500 to-rose-500' },
  { to: '/video', label: 'וידאו', icon: Video, color: 'from-purple-500 to-indigo-500' },
  { to: '/siah-hatzibur', label: 'שיח הציבור', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
  { to: '/events', label: 'אירועים', icon: Calendar, color: 'from-red-500 to-pink-500' }];


  return (
    <div data-ev-id="ev_707014a435" className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-12">
      <div data-ev-id="ev_42b91fa467" className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="relative mb-8">

          {/* Glowing background */}
          <div data-ev-id="ev_f8903e83ba" className="absolute inset-0 blur-3xl opacity-30">
            <div data-ev-id="ev_a095c0ab90" className="w-full h-full bg-gradient-to-r from-secondary via-amber-400 to-secondary rounded-full" />
          </div>
          
          {/* 404 Text */}
          <h1 data-ev-id="ev_db6075a59b" className="relative text-[150px] md:text-[200px] font-bold font-serif leading-none">
            <span data-ev-id="ev_9de676ac22" className="bg-gradient-to-b from-secondary via-amber-300 to-secondary-dark bg-clip-text text-transparent">
              404
            </span>
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>

          <h2 data-ev-id="ev_5a7cf0ea86" className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
            אופס! הדף לא נמצא
          </h2>
          <p data-ev-id="ev_ed696fb768" className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            נראה שהדף שחיפשת לא קיים, הועבר או נמחק.
            אל דאגה - יש לנו עוד המון תוכן מעניין!
          </p>
        </motion.div>

        {/* Search suggestion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10">

          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-secondary-dark text-black font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-secondary/20">

            <Home className="w-5 h-5" />
            חזרה לדף הבית
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}>

          <p data-ev-id="ev_d756ec9450" className="text-gray-500 text-sm mb-4">או נסה אחד מהדפים הפופולריים:</p>
          <div data-ev-id="ev_2df010634e" className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.to}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}>

                  <Link
                    to={link.to}
                    className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-secondary/30 rounded-xl transition-all group">

                    <div data-ev-id="ev_bb0caa119e" className={`w-8 h-8 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span data-ev-id="ev_bb424c5dd0" className="text-white group-hover:text-secondary transition-colors font-medium">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>);

            })};
          </div>
        </motion.div>

        {/* Fun animation */}
        <motion.div
          className="mt-12 text-6xl"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}>

          🔍
        </motion.div>

        {/* Background decorations */}
        <div data-ev-id="ev_39f3cd629c" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) =>
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }} />

          )}
        </div>
      </div>
    </div>);

}