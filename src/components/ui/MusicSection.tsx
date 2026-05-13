import { Link } from 'react-router';
import { Music, Play, ChevronLeft } from 'lucide-react';
import SectionHeader from './SectionHeader';

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration: string;
  isNew?: boolean;
}

const musicItems: MusicItem[] = [
{ id: '1', title: 'אלוקי נשמתא', artist: 'מרדכי בן דוד', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', duration: '4:32', isNew: true },
{ id: '2', title: 'הלב שלי', artist: 'שלמה קוהן', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&q=80', duration: '5:18' },
{ id: '3', title: 'בשמים', artist: 'מושה דרעי', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', duration: '3:45' },
{ id: '4', title: 'אשת חיל', artist: 'עמי מימרן', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', duration: '4:02' }];


export default function MusicSection() {
  return (
    <section data-ev-id="ev_c65126004e" className="py-8">
      <div data-ev-id="ev_d37009ee25" className="container mx-auto px-4">
        <SectionHeader
          title="מוזיקה וניגונים"
          icon={<Music className="w-5 h-5" />}
          link="/video"
          variant="gold" />

        
        <div data-ev-id="ev_e567ad668b" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {musicItems.map((item) =>
          <Link key={item.id} to={`/video/${item.id}`} className="group">
              <article data-ev-id="ev_33db8ad12a" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover hover:border-secondary/30 transition-all">
                <div data-ev-id="ev_bb7be8d6fd" className="aspect-square overflow-hidden relative">
                  <img data-ev-id="ev_426a62b619"
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <div data-ev-id="ev_26b2411b57" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div data-ev-id="ev_3598e48d59" className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-gold">
                      <Play className="w-6 h-6 text-primary fill-primary" />
                    </div>
                  </div>
                  {item.isNew &&
                <span data-ev-id="ev_b4377e4272" className="absolute top-2 right-2 bg-secondary text-primary px-2 py-0.5 rounded text-xs font-bold">
                      חדש
                    </span>
                }
                  <span data-ev-id="ev_b7411692c5" className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                    {item.duration}
                  </span>
                </div>
                <div data-ev-id="ev_3dc6ce8f4e" className="p-3">
                  <h3 data-ev-id="ev_ff2178c303" className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  <span data-ev-id="ev_4424684b03" className="text-xs text-muted-foreground">{item.artist}</span>
                </div>
              </article>
            </Link>
          )}
        </div>
      </div>
    </section>);

}