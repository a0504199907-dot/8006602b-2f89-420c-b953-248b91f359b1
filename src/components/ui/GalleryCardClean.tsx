import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Camera, Calendar } from 'lucide-react';
import type { GalleryAlbum } from '@/hooks/useGalleries';

interface GalleryCardCleanProps {
  album: GalleryAlbum;
  index?: number;
}

export default function GalleryCardClean({ album, index = 0 }: GalleryCardCleanProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group h-full">

      <Link to={`/gallery/${album.id}`} className="block h-full">
        <div data-ev-id="ev_18d2409827" className="relative aspect-[4/3] rounded-[14px] overflow-hidden shadow-card h-full">
          <motion.img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5 }} />

          <div data-ev-id="ev_6a513dca2a" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Image count badge */}
          {album.imageCount > 0 &&
          <div data-ev-id="ev_edc2e9b037" className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-[8px] text-sm">
            <Camera className="w-4 h-4" />
            <span data-ev-id="ev_94157e913e" className="font-medium">{album.imageCount}</span>
          </div>
          }

          {/* Chassidut badge */}
          {album.chassidut &&
          <span data-ev-id="ev_d26160f9f8" className="absolute top-3 right-3 bg-secondary text-primary px-3 py-1.5 rounded-[8px] text-xs font-bold">
            {album.chassidut}
          </span>
          }

          {/* Content */}
          <div data-ev-id="ev_4f3dd8171b" className="absolute bottom-0 right-0 left-0 p-5">
            {album.eventType &&
            <span data-ev-id="ev_ac877881dc" className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-[6px] text-xs font-medium mb-2">
              {album.eventType}
            </span>
            }
            <h3 data-ev-id="ev_77e3cd56cf" className="font-bold text-lg text-white leading-snug font-serif group-hover:text-secondary transition-colors">
              {album.title}
            </h3>
            {album.hebrewDate &&
            <div data-ev-id="ev_ad6988a68b" className="flex items-center gap-2 mt-2 text-white/60 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span data-ev-id="ev_5356b3d363">{album.hebrewDate}</span>
            </div>
            }
          </div>

          {/* Hover overlay */}
          <div data-ev-id="ev_c80f8aa864" className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.article>);

}