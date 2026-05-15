import { useState } from 'react';
import { useParams } from 'react-router';
import { motion } from 'framer-motion';
import ArticleDetailLayout from '@/components/ui/ArticleDetailLayout';
import ActionBar from '@/components/ui/ActionBar';
import TextToSpeechPlayer from '@/components/ui/TextToSpeechPlayer';
import { Calendar, User } from 'lucide-react';
import TextSizeSelector, { TextSize, getTextSizeClass } from '@/components/ui/TextSizeSelector';
import ArticleVoting from '@/components/ui/ArticleVoting';
import ArticleComments from '@/components/ui/ArticleComments';
import { useArticleWithCache } from '@/hooks/useArticleCache';

interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  hebrew_date: string | null;
  chassidut: string | null;
}

export default function NewsBatziburDetail() {
  const { id } = useParams<{id: string;}>();
  const [textSize, setTextSize] = useState<TextSize>('normal');

  // Use cached article hook - shows cached data INSTANTLY
  const { article: item, loading } = useArticleWithCache<NewsItem>(
    'news_batzibur',
    id,
    { incrementViews: true }
  );

  const breadcrumbs = item ? [
  { label: 'דף הבית', href: '/' },
  { label: 'נייעס בציבור', href: '/news-batzibur' },
  { label: item.title }] :
  [];

  const textContent = item?.content || item?.description || '';

  return (
    <ArticleDetailLayout
      loading={loading}
      notFound={!item}
      backLink="/news-batzibur"
      backText="חזרה לנייעס בציבור"
      breadcrumbs={breadcrumbs}>

      {item &&
      <article data-ev-id="ev_c83f7f4573">
          {/* Header */}
          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

            {item.chassidut &&
          <span data-ev-id="ev_71e05f54c1" className="inline-block bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium mb-4">
                {item.chassidut}
              </span>
          }
            <h1 data-ev-id="ev_f68c8c6de8" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif mb-4 leading-tight break-words">
              {item.title}
            </h1>
            {item.description &&
          <p data-ev-id="ev_4c197d0632" className="text-lg sm:text-xl text-muted-foreground mb-6 break-words">{item.description}</p>
          }

            {/* Meta */}
            <div data-ev-id="ev_9ce9b5a745" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              {item.hebrew_date &&
            <span data-ev-id="ev_5805c125e1" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.hebrew_date}
                </span>
            }
              {item.author &&
            <span data-ev-id="ev_f700aeca59" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {item.author}
                </span>
            }
            </div>
          </motion.header>

          {/* Action Bar */}
          <ActionBar title={item.title} content={textContent} className="mb-6" />

          {/* Text Size Selector */}
          <div data-ev-id="ev_576638b539" className="mb-6">
            <TextSizeSelector onSizeChange={setTextSize} />
          </div>

          {/* Text to Speech Player */}
          {textContent &&
        <div data-ev-id="ev_0f74b9e941" className="mb-8">
              <TextToSpeechPlayer text={textContent} title={item.title} />
            </div>
        }

          {/* Image */}
          {item.image_url &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden shadow-lg">

              <img data-ev-id="ev_e5fb239c19"
          src={item.image_url}
          alt={item.title}
          className="w-full h-auto object-contain" />

            </motion.div>
        }

          {/* Content */}
          {item.content &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${getTextSizeClass(textSize)} text-foreground`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: item.content }} />

        }

          {/* Voting Section */}
          <div data-ev-id="ev_5443715dba" className="mt-10">
            <ArticleVoting articleType="news_batzibur" articleId={id || ''} />
          </div>

          {/* Comments Section */}
          <div data-ev-id="ev_5ecd700557" className="mt-8">
            <ArticleComments articleType="news_batzibur" articleId={id || ''} />
          </div>
        </article>
      }
    </ArticleDetailLayout>);

}