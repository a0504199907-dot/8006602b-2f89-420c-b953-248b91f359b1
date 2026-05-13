import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, Eye, Flame, ChevronLeft, TrendingUp } from 'lucide-react';
import type { Article } from '@/data/sampleData';

interface HeroSectionProps {
  mainArticle: Article;
  sideArticles: Article[];
}

export default function HeroSection({ mainArticle, sideArticles }: HeroSectionProps) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  return (
    <section data-ev-id="ev_b10c7f9331" className="bg-background py-6">
      <div data-ev-id="ev_e600ea84e5" className="container mx-auto px-4">
        <div data-ev-id="ev_d074b28da3" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Article - Large with Ken Burns effect */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <Link to={`/article/${mainArticle.id}`} className="group block relative">
              <div data-ev-id="ev_95055f641f" className="relative aspect-[16/10] rounded-[12px] overflow-hidden shadow-card">
                {/* Ken Burns animated image */}
                <motion.img
                  src={mainArticle.image}
                  alt={mainArticle.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear'
                  }} />

                <div data-ev-id="ev_dda371244c" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Breaking badge with pulse */}
                {mainArticle.isBreaking &&
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-breaking text-white px-4 py-2 rounded-[8px] shadow-lg">

                    <motion.span
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }} />

                    <span data-ev-id="ev_0b8d683416" className="font-bold text-sm">חדשות חמות</span>
                  </motion.div>
                }

                {/* Content with staggered animation */}
                <div data-ev-id="ev_2223fe41c7" className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
                  {mainArticle.chassidut &&
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-secondary text-primary px-4 py-1.5 rounded-[6px] text-sm font-bold mb-4 shadow-gold">

                      {mainArticle.chassidut}
                    </motion.span>
                  }
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 font-serif">

                    {mainArticle.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 text-base md:text-lg line-clamp-2 mb-4 max-w-2xl">

                    {mainArticle.excerpt}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 text-white/60 text-sm">

                    <span data-ev-id="ev_ba19c6534a" className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {timeAgo(mainArticle.publishedAt)}
                    </span>
                    {mainArticle.views &&
                    <span data-ev-id="ev_a0fbaa3f9b" className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {mainArticle.views.toLocaleString()}
                      </span>
                    }
                  </motion.div>
                </div>

                {/* Hover overlay */}
                <motion.div
                  className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              </div>
            </Link>
          </motion.div>

          {/* Side Articles */}
          <div data-ev-id="ev_b219ac636a" className="lg:col-span-5 flex flex-col gap-3">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-2">

              <div data-ev-id="ev_602fcf1537" className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}>

                  <TrendingUp className="w-5 h-5 text-secondary" />
                </motion.div>
                <span data-ev-id="ev_7aeb5f8d18" className="font-bold text-foreground">נקראים עכשיו</span>
              </div>
              <Link
                to="/news"
                className="flex items-center gap-1 text-secondary text-sm font-medium hover:underline group">

                הכל
                <motion.div whileHover={{ x: -3 }}>
                  <ChevronLeft className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Side article cards */}
            {sideArticles.map((article, idx) =>
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}>

                <Link
                to={`/article/${article.id}`}
                className="group flex gap-4 p-3 bg-surface rounded-[10px] border border-border/50 hover:border-secondary/30 hover:shadow-card transition-all duration-300">

                  <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-20 rounded-[8px] overflow-hidden shrink-0">

                    <img data-ev-id="ev_52b6f54b7c"
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover" />

                  </motion.div>
                  <div data-ev-id="ev_3ad95d32ff" className="flex-1 min-w-0 flex flex-col justify-between">
                    <div data-ev-id="ev_6cc70e28f6">
                      {article.chassidut &&
                    <span data-ev-id="ev_5fa2467a3f" className="inline-block bg-secondary/10 text-secondary-dark px-2 py-0.5 rounded text-xs font-semibold mb-1">
                          {article.chassidut}
                        </span>
                    }
                      <h3 data-ev-id="ev_79acbb1aa5" className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug text-sm">
                        {article.title}
                      </h3>
                    </div>
                    <div data-ev-id="ev_d1d8ed9392" className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span data-ev-id="ev_3b1d7ed287">{timeAgo(article.publishedAt)}</span>
                      {article.views && article.views > 10000 &&
                    <span data-ev-id="ev_17d281fb72" className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-3 h-3" />
                          חם
                        </span>
                    }
                    </div>
                  </div>
                  <motion.span
                  className="text-3xl font-bold text-secondary/20 group-hover:text-secondary/40 font-serif transition-colors"
                  whileHover={{ scale: 1.1 }}>

                    {idx + 1}
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}