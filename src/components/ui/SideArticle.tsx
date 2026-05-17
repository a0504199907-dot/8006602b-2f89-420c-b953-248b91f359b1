import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';
import type { Article } from '@/data/sampleData';

interface SideArticleProps {
  article: Article;
  index: number;
}

export default function SideArticle({ article, index }: SideArticleProps) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}>

      <Link
        to={`/article/${article.id}`}
        className="group flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-surface rounded-[12px] border border-border/40 hover:border-secondary/40 hover:shadow-card transition-all duration-300">

        <motion.div
          className="w-full aspect-[16/9] rounded-[10px] overflow-hidden"
          whileHover={{ scale: 1.05 }}>

          <img data-ev-id="ev_011ee57c07"
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover" />

        </motion.div>
        
        <div data-ev-id="ev_152f4656af" className="flex-1 min-w-0 flex flex-col justify-between">
          <div data-ev-id="ev_20a31f2c89">
            {article.chassidut &&
            <span data-ev-id="ev_2268c5d130" className="inline-block bg-secondary/15 text-secondary-dark px-2 py-0.5 rounded text-xs font-semibold mb-1">
                {article.chassidut}
              </span>
            }
            <h3 data-ev-id="ev_3253768941" className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug text-xs sm:text-sm">
              {article.title}
            </h3>
          </div>
          <div data-ev-id="ev_c37c2e5821" className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 sm:mt-2">
            <Clock className="w-3 h-3" />
            <span data-ev-id="ev_29579ac2ee">{timeAgo(article.publishedAt)}</span>
            {article.views && article.views > 10000 &&
            <span data-ev-id="ev_3876ed8883" className="flex items-center gap-1 text-orange-500">
                <Flame className="w-3 h-3" />
                חם
              </span>
            }
          </div>
        </div>
        
        <span data-ev-id="ev_f58287cf2a" className="text-2xl sm:text-3xl font-bold text-secondary/20 group-hover:text-secondary/50 font-serif transition-colors">
          {index + 1}
        </span>
      </Link>
    </motion.div>
  );
}
