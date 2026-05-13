import { Link } from 'react-router';
import { MapPin, ChevronLeft } from 'lucide-react';
import SectionHeader from './SectionHeader';

interface LocalNews {
  id: string;
  title: string;
  city: string;
  image: string;
}

const localNews: LocalNews[] = [
{ id: '1', title: 'סיום הקמת בית מדרש חדש בשכונת ויזניץ', city: 'בני ברק', image: 'https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=300&q=80' },
{ id: '2', title: 'עבודות התחדשות עירונית ברחוב רמות אלחנן', city: 'אלעד', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80' },
{ id: '3', title: 'אלפי תלמידים מביתר עוזרים לקשישים', city: 'ירושלים', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=300&q=80' },
{ id: '4', title: 'הקהילה מתארגנת לקראת מקריטים בועידה', city: 'אשדוד', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' }];


export default function LocalNewsSection() {
  return (
    <section data-ev-id="ev_12c42c7fdf" className="py-8">
      <div data-ev-id="ev_55809c7215" className="container mx-auto px-4">
        <SectionHeader
          title="חדשות מקומיות"
          icon={<MapPin className="w-5 h-5" />}
          link="/news"
          variant="gold" />

        
        <div data-ev-id="ev_bf72cbf2fc" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {localNews.map((item) =>
          <Link key={item.id} to={`/article/${item.id}`} className="group">
              <article data-ev-id="ev_8df85842e1" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover hover:border-secondary/30 transition-all">
                <div data-ev-id="ev_dd4b32da21" className="aspect-[4/3] overflow-hidden relative">
                  <img data-ev-id="ev_3b8ba72b94"
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <div data-ev-id="ev_59545ec714" className="absolute top-2 right-2 bg-primary/90 text-white px-2 py-1 rounded-[6px] text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.city}
                  </div>
                </div>
                <div data-ev-id="ev_7aa59e28d5" className="p-3">
                  <h3 data-ev-id="ev_b71160a936" className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
              </article>
            </Link>
          )}
        </div>
      </div>
    </section>);

}