import { Link } from 'react-router';
import { Clock, Eye, User, Flame } from 'lucide-react';
import type { Article } from '@/data/sampleData';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal';
  showExcerpt?: boolean;
  showMeta?: boolean;
}

export default function ArticleCard({
  article,
  variant = 'medium',
  showExcerpt = true,
  showMeta = true
}: ArticleCardProps) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'אתמול';
    if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
    return article.hebrewDate;
  };

  const categoryColors = {
    news: 'bg-news',
    articles: 'bg-articles',
    events: 'bg-events',
    video: 'bg-video'
  };

  const categoryLabels = {
    news: 'חדשות',
    articles: 'מאמרים',
    events: 'אירועים',
    video: 'וידאו'
  };

  if (variant === 'large') {
    return (
      <Link to={`/article/${article.id}`} className="group block">
        <article data-ev-id="ev_ca68304369" className="relative rounded-[12px] overflow-hidden bg-surface shadow-card hover:shadow-card-hover transition-all duration-300 card-premium">
          {/* Image */}
          <div data-ev-id="ev_e3e7f70d4b" className="relative aspect-[16/9] overflow-hidden">
            <img data-ev-id="ev_bcee79c7b4"
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />

            <div data-ev-id="ev_757c7e92ea" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Badges */}
            <div data-ev-id="ev_79dfa4be0f" className="absolute top-4 right-4 flex items-center gap-2">
              {article.isBreaking &&
              <span data-ev-id="ev_5094f33f2c" className="bg-breaking text-white px-3 py-1.5 rounded-[8px] text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <span data-ev-id="ev_385a1c798e" className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  חדשות חמות
                </span>
              }
              {article.isNew &&
              <span data-ev-id="ev_4a40cffc42" className="bg-secondary text-primary px-3 py-1.5 rounded-[8px] text-sm font-bold shadow-gold">
                  חדש
                </span>
              }
            </div>

            {/* Category badge */}
            <div data-ev-id="ev_ffb22137cf" className="absolute top-4 left-4">
              <span data-ev-id="ev_2fa9e88fd3" className={`${categoryColors[article.category]} text-white px-3 py-1.5 rounded-[8px] text-sm font-medium shadow-sm`}>
                {categoryLabels[article.category]}
              </span>
            </div>

            {/* Content overlay */}
            <div data-ev-id="ev_ed331ee519" className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
              {/* Chassidut tag */}
              {article.chassidut &&
              <span data-ev-id="ev_05a1daa5a5" className="inline-block bg-secondary/90 text-primary px-3 py-1 rounded-[6px] text-sm font-medium mb-3">
                  {article.chassidut}
                </span>
              }
              
              <h2 data-ev-id="ev_b044b5363f" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight font-serif text-white">
                {article.title}
              </h2>
              {showExcerpt &&
              <p data-ev-id="ev_1c63af80b2" className="text-white/85 text-base md:text-lg line-clamp-2 mb-4 max-w-3xl">
                  {article.excerpt}
                </p>
              }
              {showMeta &&
              <div data-ev-id="ev_3c0b066afd" className="flex items-center gap-5 text-white/70 text-sm">
                  <span data-ev-id="ev_1e4f309f96" className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  <span data-ev-id="ev_50e6b65c5e" className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {article.author}
                  </span>
                  {article.views &&
                <span data-ev-id="ev_41511ede8f" className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {article.views.toLocaleString()}
                    </span>
                }
                </div>
              }
            </div>
          </div>
        </article>
      </Link>);

  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.id}`} className="group block">
        <article data-ev-id="ev_c801fadbae" className="flex gap-4 p-3 rounded-[10px] bg-surface hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
          <div data-ev-id="ev_3e8173722a" className="w-28 h-24 md:w-36 md:h-28 rounded-[8px] overflow-hidden shrink-0 shadow-sm">
            <img data-ev-id="ev_486db80eb9"
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          </div>
          <div data-ev-id="ev_4922db9591" className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div data-ev-id="ev_6601cecd49">
              <div data-ev-id="ev_4ca5cc3a30" className="flex items-center gap-2 mb-2">
                {article.chassidut &&
                <span data-ev-id="ev_14c61ad66b" className="bg-secondary/15 text-secondary-dark px-2 py-0.5 rounded-[6px] text-xs font-semibold">
                    {article.chassidut}
                  </span>
                }
                {article.isNew &&
                <span data-ev-id="ev_b3d8e9f729" className="bg-secondary text-primary px-2 py-0.5 rounded-[6px] text-xs font-bold">
                    חדש
                  </span>
                }
              </div>
              <h3 data-ev-id="ev_a5d3130820" className="font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
                {article.title}
              </h3>
            </div>
            <div data-ev-id="ev_65d62698e7" className="flex items-center gap-3 text-muted-foreground text-xs">
              <span data-ev-id="ev_aceb6f63b8" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(article.publishedAt)}
              </span>
              {article.views && article.views > 10000 &&
              <span data-ev-id="ev_934f34d600" className="flex items-center gap-1 text-orange-600">
                  <Flame className="w-3 h-3" />
                  פופולרי
                </span>
              }
            </div>
          </div>
        </article>
      </Link>);

  }

  if (variant === 'small') {
    return (
      <Link to={`/article/${article.id}`} className="group block">
        <article data-ev-id="ev_457f46e051" className="flex gap-3 py-3 border-b border-border last:border-b-0">
          <div data-ev-id="ev_ed03716477" className="w-20 h-16 rounded-[8px] overflow-hidden shrink-0 shadow-xs">
            <img data-ev-id="ev_68aee9215f"
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

          </div>
          <div data-ev-id="ev_b61495d4cb" className="flex-1 min-w-0">
            <h4 data-ev-id="ev_b8e5d61b8b" className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1 leading-snug">
              {article.title}
            </h4>
            <span data-ev-id="ev_7ef10fc69f" className="text-xs text-muted-foreground">
              {timeAgo(article.publishedAt)}
            </span>
          </div>
        </article>
      </Link>);

  }

  // Default: medium
  return (
    <Link to={`/article/${article.id}`} className="group block">
      <article data-ev-id="ev_0da6d4d5ba" className="bg-surface rounded-[12px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 card-premium border border-border/50">
        <div data-ev-id="ev_fd4b2f89fc" className="relative aspect-[16/10] overflow-hidden">
          <img data-ev-id="ev_79516921c7"
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />

          <div data-ev-id="ev_36c4f6b35c" className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Badges */}
          <div data-ev-id="ev_17ea9a9ffc" className="absolute top-3 right-3 flex items-center gap-2">
            {article.isNew &&
            <span data-ev-id="ev_9b035bda4a" className="bg-secondary text-primary px-2.5 py-1 rounded-[6px] text-xs font-bold shadow-gold">
                חדש
              </span>
            }
          </div>
          
          {/* Category */}
          <div data-ev-id="ev_c190e41318" className="absolute top-3 left-3">
            <span data-ev-id="ev_60033e20f5" className={`${categoryColors[article.category]} text-white px-2.5 py-1 rounded-[6px] text-xs font-medium`}>
              {categoryLabels[article.category]}
            </span>
          </div>

          {/* Gold accent line at bottom */}
          <div data-ev-id="ev_590c21e86a" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div data-ev-id="ev_5033563687" className="p-4">
          {/* Chassidut tag */}
          {article.chassidut &&
          <span data-ev-id="ev_68ae85babb" className="inline-block bg-secondary/10 text-secondary-dark px-2.5 py-0.5 rounded-[6px] text-xs font-semibold mb-2">
              {article.chassidut}
            </span>
          }
          
          <h3 data-ev-id="ev_990890b362" className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
            {article.title}
          </h3>
          {showExcerpt &&
          <p data-ev-id="ev_b925480716" className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {article.excerpt}
            </p>
          }
          {showMeta &&
          <div data-ev-id="ev_1481b85f5d" className="flex items-center justify-between text-muted-foreground text-xs pt-3 border-t border-border/50">
              <span data-ev-id="ev_8b7ac98d5b" className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(article.publishedAt)}
              </span>
              {article.views &&
            <span data-ev-id="ev_787ed9cb98" className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {article.views.toLocaleString()}
                </span>
            }
            </div>
          }
        </div>
      </article>
    </Link>);

}