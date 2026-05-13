import { Link } from 'react-router';
import { Play, Eye, Clock } from 'lucide-react';
import type { Video } from '@/data/sampleData';

interface VideoCardProps {
  video: Video;
  variant?: 'large' | 'medium' | 'small';
}

export default function VideoCard({ video, variant = 'medium' }: VideoCardProps) {
  if (variant === 'large') {
    return (
      <Link to={`/video/${video.id}`} className="group block">
        <div data-ev-id="ev_b9a9d21956" className="relative aspect-video rounded-[12px] overflow-hidden shadow-card">
          <img data-ev-id="ev_34cba5dc6b"
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />


          <div data-ev-id="ev_0463273ab9" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Play button - Premium */}
          <div data-ev-id="ev_47ddea2ac7" className="absolute inset-0 flex items-center justify-center">
            <div data-ev-id="ev_b609567b63" className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-gold">
              <Play className="w-10 h-10 text-primary fill-primary mr-[-4px]" />
            </div>
          </div>

          {/* Duration */}
          <div data-ev-id="ev_923f41998f" className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-[8px] text-sm font-medium backdrop-blur-sm">
            {video.duration}
          </div>

          {/* Chassidut badge */}
          {video.chassidut &&
          <div data-ev-id="ev_59458c746d" className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1.5 rounded-[8px] text-sm font-bold shadow-gold">
              {video.chassidut}
            </div>
          }
        </div>
        <div data-ev-id="ev_477272024e" className="mt-5">
          <h3 data-ev-id="ev_eafa2cfc3f" className="text-xl font-bold text-foreground group-hover:text-primary transition-colors font-serif">
            {video.title}
          </h3>
          <p data-ev-id="ev_df0c561e73" className="text-muted-foreground mt-2 line-clamp-2">
            {video.description}
          </p>
          <div data-ev-id="ev_3f35aa4cf8" className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span data-ev-id="ev_73b471925a" className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {video.views?.toLocaleString() || 0} צפיות
            </span>
            <span data-ev-id="ev_bbd40024bd" className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {video.publishedAt}
            </span>
          </div>
        </div>
      </Link>);

  }

  if (variant === 'small') {
    return (
      <Link to={`/video/${video.id}`} className="group flex gap-3">
        <div data-ev-id="ev_ababca5c88" className="relative w-32 h-20 rounded-[10px] overflow-hidden shrink-0 shadow-sm">
          <img data-ev-id="ev_d3ea4e60c5"
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />


          <div data-ev-id="ev_e9b7880b7a" className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div data-ev-id="ev_baf675b30e" className="absolute inset-0 flex items-center justify-center">
            <div data-ev-id="ev_b0988d09b1" className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center shadow-gold">
              <Play className="w-4 h-4 text-primary fill-primary mr-[-2px]" />
            </div>
          </div>
          <div data-ev-id="ev_99595c40d4" className="absolute bottom-1.5 left-1.5 bg-black/80 text-white px-1.5 py-0.5 rounded-[4px] text-xs backdrop-blur-sm">
            {video.duration}
          </div>
        </div>
        <div data-ev-id="ev_3c367fa849" className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 data-ev-id="ev_c51b0ec998" className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug">
            {video.title}
          </h4>
          <span data-ev-id="ev_f6bace5b5b" className="text-xs text-muted-foreground mt-1">
            {video.views?.toLocaleString() || 0} צפיות
          </span>
        </div>
      </Link>);

  }

  // Default: medium
  return (
    <Link to={`/video/${video.id}`} className="group block">
      <div data-ev-id="ev_c6f7fa8451" className="relative aspect-video rounded-[12px] overflow-hidden shadow-card">
        <img data-ev-id="ev_b73c30528c"
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />


        <div data-ev-id="ev_a60a3b9230" className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70" />
        
        {/* Play button */}
        <div data-ev-id="ev_88a4165027" className="absolute inset-0 flex items-center justify-center">
          <div data-ev-id="ev_5ac19a8317" className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-gold">
            <Play className="w-7 h-7 text-primary fill-primary mr-[-3px]" />
          </div>
        </div>

        {/* Duration */}
        <div data-ev-id="ev_9b8504f662" className="absolute bottom-3 left-3 bg-black/80 text-white px-2.5 py-1 rounded-[6px] text-sm backdrop-blur-sm">
          {video.duration}
        </div>
      </div>
      <div data-ev-id="ev_23fb2eda4d" className="mt-3">
        <h4 data-ev-id="ev_aba01fb1f1" className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {video.title}
        </h4>
        <div data-ev-id="ev_5c763d58c2" className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span data-ev-id="ev_8a812ffcdf">{video.views?.toLocaleString() || 0} צפיות</span>
          {video.chassidut &&
          <span data-ev-id="ev_caa71efa39" className="bg-secondary/15 text-secondary-dark px-2 py-0.5 rounded-[6px] text-xs font-medium">
              {video.chassidut}
            </span>
          }
        </div>
      </div>
    </Link>);

}