import { Link } from 'react-router';
import { Clock, Eye } from 'lucide-react';
import type { Article } from '@/data/sampleData';

interface ArticleGridProps {
  articles: Article[];
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

export default function ArticleGrid({ articles, variant = 'default' }: ArticleGridProps) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  if (variant === 'featured') {
    // 1 large + 2 small layout
    const [main, ...rest] = articles;
    return (
      <div data-ev-id="ev_bc256e0e63" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Main large article */}
        {main &&
        <Link to={`/article/${main.id}`} className="group md:row-span-2">
            <article data-ev-id="ev_c6af05e7fd" className="relative h-full rounded-[12px] overflow-hidden shadow-card">
              <img data-ev-id="ev_e4028338dc"
            src={main.image}
            alt={main.title}
            className="w-full h-full object-cover min-h-[300px] md:min-h-full group-hover:scale-105 transition-transform duration-700" />

              <div data-ev-id="ev_d6bdeac330" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div data-ev-id="ev_be307b5a98" className="absolute bottom-0 right-0 left-0 p-5">
                {main.chassidut &&
              <span data-ev-id="ev_d92945a98e" className="inline-block bg-secondary text-primary px-3 py-1 rounded-[6px] text-xs font-bold mb-3">
                    {main.chassidut}
                  </span>
              }
                <h3 data-ev-id="ev_a80ccb20ad" className="text-xl md:text-2xl font-bold text-white mb-2 font-serif leading-tight">
                  {main.title}
                </h3>
                <p data-ev-id="ev_946c43657f" className="text-white/70 text-sm line-clamp-2 mb-3">{main.excerpt}</p>
                <div data-ev-id="ev_3ee29dd6a0" className="flex items-center gap-3 text-white/50 text-xs">
                  <span data-ev-id="ev_64d9f2158d" className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(main.publishedAt)}</span>
                  {main.views && <span data-ev-id="ev_c283453f73" className="flex items-center gap-1"><Eye className="w-3 h-3" />{main.views.toLocaleString()}</span>}
                </div>
              </div>
            </article>
          </Link>
        }
        {/* Smaller articles */}
        {rest.slice(0, 2).map((article) =>
        <Link key={article.id} to={`/article/${article.id}`} className="group">
            <article data-ev-id="ev_08df3e7b21" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover transition-all h-full">
              <div data-ev-id="ev_f1e5c204d7" className="aspect-[16/9] overflow-hidden">
                <img data-ev-id="ev_bd53937a00"
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              </div>
              <div data-ev-id="ev_b71a79a862" className="p-4">
                {article.chassidut &&
              <span data-ev-id="ev_b52e29a0c8" className="inline-block bg-secondary/10 text-secondary-dark px-2 py-0.5 rounded text-xs font-semibold mb-2">
                    {article.chassidut}
                  </span>
              }
                <h3 data-ev-id="ev_354215851d" className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif">
                  {article.title}
                </h3>
                <div data-ev-id="ev_6bc80785bd" className="flex items-center gap-3 text-muted-foreground text-xs">
                  <span data-ev-id="ev_624e8d9e6e" className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}</span>
                </div>
              </div>
            </article>
          </Link>
        )}
      </div>);

  }

  if (variant === 'horizontal') {
    return (
      <div data-ev-id="ev_a7007987a3" className="flex gap-4 overflow-x-auto pb-4">
        {articles.map((article) =>
        <Link key={article.id} to={`/article/${article.id}`} className="group shrink-0 w-64">
            <article data-ev-id="ev_dfcfc84b04" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover transition-all">
              <div data-ev-id="ev_e3524d8834" className="aspect-[16/10] overflow-hidden">
                <img data-ev-id="ev_85d82c7302"
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              </div>
              <div data-ev-id="ev_ec11f95fc0" className="p-3">
                <h3 data-ev-id="ev_1327e9f2d8" className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <span data-ev-id="ev_09ea779bf1" className="text-xs text-muted-foreground mt-2 block">{timeAgo(article.publishedAt)}</span>
              </div>
            </article>
          </Link>
        )}
      </div>);

  }

  if (variant === 'compact') {
    return (
      <div data-ev-id="ev_f1c5a13041" className="flex flex-col gap-3">
        {articles.map((article) =>
        <Link key={article.id} to={`/article/${article.id}`} className="group">
            <article data-ev-id="ev_a405ed8581" className="flex gap-3 p-3 rounded-[10px] hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
              <div data-ev-id="ev_7a507a3f58" className="w-24 h-18 rounded-[8px] overflow-hidden shrink-0">
                <img data-ev-id="ev_003c782814"
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

              </div>
              <div data-ev-id="ev_ebd24484e5" className="flex-1 min-w-0">
                <h3 data-ev-id="ev_229c6bda7b" className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {article.title}
                </h3>
                <span data-ev-id="ev_f142ccdfd5" className="text-xs text-muted-foreground">{timeAgo(article.publishedAt)}</span>
              </div>
            </article>
          </Link>
        )}
      </div>);

  }

  // Default grid
  return (
    <div data-ev-id="ev_de643f0205" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {articles.map((article) =>
      <Link key={article.id} to={`/article/${article.id}`} className="group">
          <article data-ev-id="ev_8bcde13133" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover transition-all card-premium">
            <div data-ev-id="ev_ba23047bd8" className="aspect-[16/10] overflow-hidden relative">
              <img data-ev-id="ev_5db0545bc4"
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              {article.isNew &&
            <span data-ev-id="ev_e44d525821" className="absolute top-2 right-2 bg-secondary text-primary px-2 py-0.5 rounded text-xs font-bold shadow-gold">
                  חדש
                </span>
            }
            </div>
            <div data-ev-id="ev_3c4e084d78" className="p-4">
              {article.chassidut &&
            <span data-ev-id="ev_06fdba7ae8" className="inline-block bg-secondary/10 text-secondary-dark px-2 py-0.5 rounded text-xs font-semibold mb-2">
                  {article.chassidut}
                </span>
            }
              <h3 data-ev-id="ev_892fc9c592" className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
                {article.title}
              </h3>
              <div data-ev-id="ev_f3464e107f" className="flex items-center justify-between text-muted-foreground text-xs pt-2 border-t border-border/50">
                <span data-ev-id="ev_2651fa096b" className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}</span>
                {article.views && <span data-ev-id="ev_623acf4bc9" className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>}
              </div>
            </div>
          </article>
        </Link>
      )}
    </div>);

}