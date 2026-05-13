import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Play, Eye, ChevronLeft } from 'lucide-react';
import type { Video } from '@/data/sampleData';

interface VideoSectionProps {
  videos: Video[];
}

export default function VideoSection({ videos }: VideoSectionProps) {
  return (
    <section data-ev-id="ev_c1fddd2202" className="py-16 bg-primary relative overflow-hidden">
      {/* Background gradient */}
      <div data-ev-id="ev_d2d8942c89" className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary opacity-50" />
      
      <div data-ev-id="ev_853f59b681" className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10">

          <div data-ev-id="ev_a886848645">
            <h2 data-ev-id="ev_7ee9e7509c" className="text-3xl font-bold text-white font-serif mb-2">
              תיעוד <span data-ev-id="ev_4491095319" className="text-secondary">וידאו</span>
            </h2>
            <p data-ev-id="ev_f9d2097773" className="text-white/60">צפו ברגעים המרגשים ביותר מעולם החסידות</p>
          </div>
          <Link
            to="/video"
            className="hidden md:flex items-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-[10px] font-bold hover:bg-secondary-light transition-colors group">

            לכל הסרטונים
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Video Grid */}
        <div data-ev-id="ev_78fda3346f" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.slice(0, 8).map((video, index) =>
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}>

              <Link to={`/video/${video.id}`} className="group block">
                <div data-ev-id="ev_2259fcd581" className="relative aspect-video rounded-[12px] overflow-hidden shadow-card">
                  <motion.img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }} />

                  <div data-ev-id="ev_740f532293" className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Play button */}
                  <div data-ev-id="ev_4a8137a69a" className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                    className="w-12 h-12 rounded-full bg-secondary/90 flex items-center justify-center shadow-gold group-hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>

                      <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Duration */}
                  <span data-ev-id="ev_e1c0a319f0" className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded-[6px] text-xs font-medium">
                    {video.duration}
                  </span>

                  {/* Chassidut badge */}
                  {video.chassidut &&
                <span data-ev-id="ev_c27129327d" className="absolute top-2 right-2 bg-secondary text-primary px-2 py-1 rounded-[6px] text-xs font-bold">
                      {video.chassidut}
                    </span>
                }
                </div>

                <div data-ev-id="ev_1b8101b4cb" className="mt-3">
                  <h3 data-ev-id="ev_7685a0d43d" className="font-bold text-white text-sm line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                    {video.title}
                  </h3>
                  <div data-ev-id="ev_1b755b2c6d" className="flex items-center gap-2 mt-2 text-white/50 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span data-ev-id="ev_203cbc53c3">{video.views.toLocaleString()} צפיות</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile link */}
        <div data-ev-id="ev_1739f8b152" className="mt-8 flex justify-center md:hidden">
          <Link
            to="/video"
            className="flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-[10px] font-bold">

            לכל הסרטונים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>);

}