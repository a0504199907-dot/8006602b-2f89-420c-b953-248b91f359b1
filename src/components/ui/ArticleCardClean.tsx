import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, Eye, Flame } from 'lucide-react';
import type { Article } from '@/data/sampleData';
import { cardVariants, cardImageVariants, transitions, easings, staggerDelay } from '@/lib/animations';

interface ArticleCardCleanProps {
  article: Article;
  index?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function ArticleCardClean({ article, index = 0, size = 'medium' }: ArticleCardCleanProps) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  if (size === 'large') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ 
          duration: 0.5, 
          delay: staggerDelay(index),
          ease: easings.outQuart 
        }}
        className="group relative">

        <Link to={`/article/${article.id}`} className="block">
          <div data-ev-id="ev_310a52f916" className="relative aspect-[16/9] rounded-[12px] sm:rounded-[16px] overflow-hidden shadow-card">
            <motion.img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              variants={cardImageVariants}
              initial="rest"
              whileHover="hover" />

            <div data-ev-id="ev_3ce4f67a73" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {article.isBreaking &&
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-[8px]">

                <span data-ev-id="ev_f626361b17" className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                <span data-ev-id="ev_a5804ebd57" className="font-bold text-xs sm:text-sm">חדשות חמות</span>
              </motion.div>
            }

            <div data-ev-id="ev_e32e8f6f35" className="absolute bottom-0 right-0 left-0 p-4 sm:p-6 md:p-8">
              {article.chassidut &&
              <span data-ev-id="ev_fd310481f1" className="inline-block bg-secondary text-primary px-3 sm:px-4 py-1 sm:py-1.5 rounded-[6px] text-xs sm:text-sm font-bold mb-2 sm:mb-4">
                  {article.chassidut}
                </span>
              }
              <h2 data-ev-id="ev_795a9ee3c9" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2 sm:mb-3 font-serif group-hover:text-secondary transition-colors">
                {article.title}
              </h2>
              <p data-ev-id="ev_405adcae36" className="text-white/70 line-clamp-2 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">{article.excerpt}</p>
              <div data-ev-id="ev_e1ed5c662b" className="flex items-center gap-3 sm:gap-4 text-white/60 text-xs sm:text-sm">
                <span data-ev-id="ev_2ff90fe1be" className="flex items-center gap-1 sm:gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {timeAgo(article.publishedAt)}
                </span>
                {article.views &&
                <span data-ev-id="ev_51bb55fb41" className="flex items-center gap-1 sm:gap-1.5">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {article.views.toLocaleString()}
                  </span>
                }
              </div>
            </div>
          </div>
        </Link>
      </motion.article>);

  }

  // Medium size (default)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ 
        duration: 0.45, 
        delay: staggerDelay(index, 0.06),
        ease: easings.outQuart 
      }}
      whileHover="hover"
      variants={cardVariants}
      className="group h-full">

      <Link to={`/article/${article.id}`} className="block h-full">
        <div data-ev-id="ev_76da09bd32" className="bg-surface rounded-[14px] overflow-hidden shadow-card border border-border/40 hover:shadow-card-hover hover:border-secondary/40 transition-all duration-300 h-full flex flex-col">
          <div data-ev-id="ev_33451d2a4e" className="aspect-[16/10] overflow-hidden relative flex-shrink-0">
            <motion.img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }} />

            
            {/* Overlay on hover */}
            <div data-ev-id="ev_f63aedf2a0" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {article.isNew &&
            <span data-ev-id="ev_0763cd16a3" className="absolute top-3 right-3 bg-secondary text-primary px-3 py-1 rounded-[6px] text-xs font-bold shadow-gold">
                חדש
              </span>
            }

            {article.isBreaking &&
            <span data-ev-id="ev_6ee77ca6f8" className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-[6px] text-xs font-bold flex items-center gap-1">
                <span data-ev-id="ev_cbf3a1f624" className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                חם
              </span>
            }

            {article.views && article.views > 15000 && !article.isNew && !article.isBreaking &&
            <span data-ev-id="ev_56cf7eb979" className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-[6px] text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                פופולרי
              </span>
            }
          </div>

          <div data-ev-id="ev_f4270de69e" className="p-5 flex flex-col flex-grow">
            {article.chassidut &&
            <span data-ev-id="ev_e2624afda9" className="inline-block bg-secondary/15 text-secondary-dark px-3 py-1 rounded-[6px] text-xs font-semibold mb-3 self-start">
                {article.chassidut}
              </span>
            }
            <h3 data-ev-id="ev_07dd13bcdc" className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
              {article.title}
            </h3>
            <p data-ev-id="ev_2c73dcddeb" className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
              {article.excerpt}
            </p>
            <div data-ev-id="ev_c14ef1b4d7" className="flex items-center justify-between text-muted-foreground text-xs pt-3 border-t border-border/50 mt-auto">
              <span data-ev-id="ev_5474e23831" className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(article.publishedAt)}
              </span>
              {article.views &&
              <span data-ev-id="ev_67b3de7477" className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {article.views.toLocaleString()}
                </span>
              }
            </div>
          </div>
        </div>
      </Link>
    </motion.article>);

}