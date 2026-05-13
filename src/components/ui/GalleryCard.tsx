import { Link } from 'react-router';
import { Images, Calendar } from 'lucide-react';
import type { GalleryAlbum } from '@/data/sampleData';

interface GalleryCardProps {
  album: GalleryAlbum;
  variant?: 'default' | 'compact';
}

export default function GalleryCard({ album, variant = 'default' }: GalleryCardProps) {
  if (variant === 'compact') {
    return (
      <Link to={`/gallery/${album.id}`} className="group block">
        <div data-ev-id="ev_f4892e080c" className="flex gap-3 p-3 rounded-[10px] hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
          <div data-ev-id="ev_9d662d35b7" className="w-20 h-16 rounded-[8px] overflow-hidden shrink-0 shadow-sm">
            <img data-ev-id="ev_9f46a3f83a"
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

          </div>
          <div data-ev-id="ev_1c56ec728b" className="flex-1 min-w-0">
            <h4 data-ev-id="ev_4d0ccf479f" className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
              {album.title}
            </h4>
            <p data-ev-id="ev_a26c59e4fe" className="text-xs text-secondary-dark font-medium">{album.chassidut}</p>
            <span data-ev-id="ev_e9f173b0ea" className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Images className="w-3 h-3" />
              {album.images.length} תמונות
            </span>
          </div>
        </div>
      </Link>);

  }

  return (
    <Link to={`/gallery/${album.id}`} className="group block">
      <article data-ev-id="ev_fc768ec119" className="bg-surface rounded-[12px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 card-premium border border-border/50">
        <div data-ev-id="ev_d24cc65770" className="relative aspect-[4/3] overflow-hidden">
          <img data-ev-id="ev_ea048fbd05"
          src={album.coverImage}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

          <div data-ev-id="ev_ed4eadd88a" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Image count badge */}
          <div data-ev-id="ev_9f5eebc2a6" className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-[8px] flex items-center gap-2">
            <Images className="w-4 h-4" />
            <span data-ev-id="ev_3a26804356" className="text-sm font-medium">{album.images.length}</span>
          </div>

          {/* Event type badge */}
          <div data-ev-id="ev_cd4e81bf2a" className="absolute top-3 right-3 bg-secondary text-primary px-3 py-1.5 rounded-[8px] text-sm font-bold shadow-gold">
            {album.eventType}
          </div>

          {/* Title overlay */}
          <div data-ev-id="ev_37ac604156" className="absolute bottom-0 right-0 left-0 p-4">
            <span data-ev-id="ev_e11b4fa93d" className="inline-block bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-[6px] text-xs font-medium text-white mb-2">
              {album.chassidut}
            </span>
            <h3 data-ev-id="ev_8695f842b1" className="font-bold text-lg text-white group-hover:text-secondary-light transition-colors font-serif leading-snug">
              {album.title}
            </h3>
          </div>
        </div>
        
        <div data-ev-id="ev_c75e51b9b2" className="p-3 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50">
          <div data-ev-id="ev_44b3666739" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span data-ev-id="ev_1d9f07d53c">{album.hebrewDate}</span>
          </div>
        </div>
      </article>
    </Link>);

}