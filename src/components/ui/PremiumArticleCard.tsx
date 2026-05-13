import { Link } from 'react-router';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, Eye, Flame, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import type { Article } from '@/data/sampleData';

interface PremiumArticleCardProps {
  article: Article;
  variant?: 'default' | 'large' | 'horizontal';
  index?: number;
}

export default function PremiumArticleCard({
  article,
  variant = 'default',
  index = 0
}: PremiumArticleCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  if (variant === 'large') {
    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className="group relative">

        <Link to={`/article/${article.id}`}>
          <article data-ev-id="ev_d8a641ca37" className="relative aspect-[16/9] rounded-[16px] overflow-hidden shadow-card">
            <motion.img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }} />

            <div data-ev-id="ev_e89b729ae4" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Spotlight effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at ${useTransform(mouseXSpring, [-0.5, 0.5], ['20%', '80%'])} ${useTransform(mouseYSpring, [-0.5, 0.5], ['20%', '80%'])}, rgba(212, 175, 55, 0.15) 0%, transparent 50%)`
              }} />


            {article.isBreaking &&
            <div data-ev-id="ev_2e74c3fd2e" className="absolute top-4 right-4 flex items-center gap-2 bg-breaking text-white px-4 py-2 rounded-[8px]">
                <motion.span
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }} />

                <span data-ev-id="ev_6b8835987b" className="font-bold text-sm">חדשות חמות</span>
              </div>
            }

            <div data-ev-id="ev_43acede172"
            className="absolute bottom-0 right-0 left-0 p-6 md:p-8"
            style={{ transform: 'translateZ(30px)' }}>

              {article.chassidut &&
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block bg-secondary text-primary px-4 py-1.5 rounded-[6px] text-sm font-bold mb-4 shadow-gold">

                  {article.chassidut}
                </motion.span>
              }
              <h2 data-ev-id="ev_19a0b771a2" className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 font-serif">
                {article.title}
              </h2>
              <p data-ev-id="ev_022c9baf9b" className="text-white/70 line-clamp-2 mb-4">{article.excerpt}</p>
              <div data-ev-id="ev_9e38b03fa5" className="flex items-center justify-between">
                <div data-ev-id="ev_430ce89fc1" className="flex items-center gap-4 text-white/60 text-sm">
                  <span data-ev-id="ev_5196845291" className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  {article.views &&
                  <span data-ev-id="ev_431be99c40" className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {article.views.toLocaleString()}
                    </span>
                  }
                </div>
                <motion.span
                  className="flex items-center gap-2 text-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ x: -5 }}>

                  לקריאה
                  <ArrowLeft className="w-4 h-4" />
                </motion.span>
              </div>
            </div>
          </article>
        </Link>
      </motion.div>);

  }

  // Default card
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className="group">

      <Link to={`/article/${article.id}`}>
        <article data-ev-id="ev_c5c1760835" className="bg-surface rounded-[12px] overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover hover:border-secondary/30 transition-all duration-300">
          <div data-ev-id="ev_fa53052b52" className="aspect-[16/10] overflow-hidden relative">
            <motion.img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }} />


            {/* Spotlight on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.2) 0%, transparent 50%)'
              }} />


            {article.isNew &&
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 bg-secondary text-primary px-2 py-0.5 rounded text-xs font-bold shadow-gold">

                חדש
              </motion.span>
            }

            {article.views && article.views > 10000 &&
            <span data-ev-id="ev_1e535c7d9d" className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                חם
              </span>
            }
          </div>

          <div data-ev-id="ev_c3c7b2e8a8" className="p-4" style={{ transform: 'translateZ(20px)' }}>
            {article.chassidut &&
            <span data-ev-id="ev_5015e69d45" className="inline-block bg-secondary/10 text-secondary-dark px-2 py-0.5 rounded text-xs font-semibold mb-2">
                {article.chassidut}
              </span>
            }
            <h3 data-ev-id="ev_818186ee93" className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
              {article.title}
            </h3>
            <div data-ev-id="ev_88a9103bf3" className="flex items-center justify-between text-muted-foreground text-xs pt-2 border-t border-border/50">
              <span data-ev-id="ev_2ed13a0502" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(article.publishedAt)}
              </span>
              {article.views &&
              <span data-ev-id="ev_cd39d1b440" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views.toLocaleString()}
                </span>
              }
            </div>
          </div>
        </article>
      </Link>
    </motion.div>);

}