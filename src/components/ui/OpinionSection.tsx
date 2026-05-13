import { Link } from 'react-router';
import { MessageSquareQuote, ChevronLeft } from 'lucide-react';
import SectionHeader from './SectionHeader';

interface Opinion {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorImage: string;
  authorTitle: string;
}

const opinions: Opinion[] = [
{
  id: '1',
  title: 'המסר שבין חינוך לטכנולוגיה',
  excerpt: 'האם אנחנו משכילים בדור הטכנולוגי את הערכים החשובים באמת?',
  author: 'הרב יעקב כהן',
  authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  authorTitle: 'רב ומחנך'
},
{
  id: '2',
  title: 'על המאבקים של דורנו',
  excerpt: 'כיצד לשמור על היהדות בעולם משתנה',
  author: 'הרב משה לוי',
  authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  authorTitle: 'מרצה וסופר'
},
{
  id: '3',
  title: 'שינויים במערכת החינוך',
  excerpt: 'האתגרים החדשים והשפעתם על ילדינו',
  author: 'הרב שמואל רוזנטל',
  authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  authorTitle: 'מחנך ופרשן'
}];


export default function OpinionSection() {
  return (
    <section data-ev-id="ev_5dc8eefb60" className="py-8 bg-gradient-to-b from-muted/50 to-background">
      <div data-ev-id="ev_efcadfbdfc" className="container mx-auto px-4">
        <SectionHeader
          title="דעות ופרשנות"
          icon={<MessageSquareQuote className="w-5 h-5" />}
          link="/articles"
          variant="centered" />

        
        <div data-ev-id="ev_490fb626e2" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opinions.map((opinion) =>
          <Link key={opinion.id} to={`/article/${opinion.id}`} className="group">
              <article data-ev-id="ev_3ed36037f8" className="bg-surface rounded-[12px] p-6 shadow-card border border-border/50 hover:shadow-card-hover hover:border-secondary/30 transition-all h-full flex flex-col">
                <MessageSquareQuote className="w-8 h-8 text-secondary/30 mb-4" />
                <h3 data-ev-id="ev_bbaa96fe7e" className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors font-serif">
                  {opinion.title}
                </h3>
                <p data-ev-id="ev_ca94c6e5f5" className="text-muted-foreground text-sm mb-4 flex-1">{opinion.excerpt}</p>
                <div data-ev-id="ev_beb3b84196" className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <img data-ev-id="ev_c6e575adc9"
                src={opinion.authorImage}
                alt={opinion.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-secondary/30" />

                  <div data-ev-id="ev_25d832f0b5">
                    <div data-ev-id="ev_1ce94f763c" className="font-bold text-foreground text-sm">{opinion.author}</div>
                    <div data-ev-id="ev_6a4ce337fc" className="text-xs text-muted-foreground">{opinion.authorTitle}</div>
                  </div>
                </div>
              </article>
            </Link>
          )}
        </div>
      </div>
    </section>);

}