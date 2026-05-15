import { useState } from 'react';
import { useParams } from 'react-router';
import { motion } from 'framer-motion';
import ArticleDetailLayout from '@/components/ui/ArticleDetailLayout';
import ActionBar from '@/components/ui/ActionBar';
import TextToSpeechPlayer from '@/components/ui/TextToSpeechPlayer';
import { Calendar, MapPin, Camera } from 'lucide-react';
import TextSizeSelector, { TextSize, getTextSizeClass } from '@/components/ui/TextSizeSelector';
import ArticleVoting from '@/components/ui/ArticleVoting';
import ArticleComments from '@/components/ui/ArticleComments';
import { useArticleWithCache } from '@/hooks/useArticleCache';

interface BeinItem {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  short_text: string | null;
  description: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  photographer: string | null;
  location: string | null;
  chassidut: string | null;
}

export default function BeinHatziburDetail() {
  const { id } = useParams<{id: string;}>();
  const [textSize, setTextSize] = useState<TextSize>('normal');

  // Use cached article hook - shows cached data INSTANTLY
  const { article: item, loading } = useArticleWithCache<BeinItem>(
    'bein_hatzibur',
    id,
    { incrementViews: true }
  );

  const breadcrumbs = item ? [
  { label: 'דף הבית', href: '/' },
  { label: 'בעין הציבור', href: '/bein-hatzibur' },
  { label: item.title }] :
  [];

  const textContent = item?.description || item?.short_text || '';

  return (
    <ArticleDetailLayout
      loading={loading}
      notFound={!item}
      backLink="/bein-hatzibur"
      backText="חזרה לבעין הציבור"
      breadcrumbs={breadcrumbs}>

      {item &&
      <article data-ev-id="ev_a4f96dcc48">
          {/* Header */}
          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

            {item.chassidut &&
          <span data-ev-id="ev_f71c7c9441" className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {item.chassidut}
              </span>
          }
            <h1 data-ev-id="ev_c930f04cc4" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif mb-4 leading-tight break-words">
              {item.title}
            </h1>
            {item.caption &&
          <p data-ev-id="ev_807968d87a" className="text-lg sm:text-xl text-muted-foreground mb-6 break-words">{item.caption}</p>
          }

            {/* Meta */}
            <div data-ev-id="ev_a19a9c73c3" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              {item.hebrew_date &&
            <span data-ev-id="ev_3046604fcf" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.hebrew_date}
                </span>
            }
              {item.photographer &&
            <span data-ev-id="ev_e071cd3746" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  צילום: {item.photographer}
                </span>
            }
              {item.location &&
            <span data-ev-id="ev_7818d3ae2b" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </span>
            }
            </div>
          </motion.header>

          {/* Action Bar */}
          <ActionBar title={item.title} content={textContent} className="mb-6" />

          {/* Text Size Selector */}
          <div data-ev-id="ev_4f377038fc" className="mb-6">
            <TextSizeSelector onSizeChange={setTextSize} />
          </div>

          {/* Text to Speech Player */}
          {textContent &&
        <div data-ev-id="ev_c14a25a387" className="mb-8">
              <TextToSpeechPlayer text={textContent} title={item.title} />
            </div>
        }

          {/* Main Image */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden shadow-lg">

            <img data-ev-id="ev_6967b14a41"
          src={item.image_url}
          alt={item.title}
          className="w-full h-auto object-contain bg-muted/30" />

            {item.photographer &&
          <div data-ev-id="ev_571ff3f90d" className="bg-muted/50 px-4 py-3 flex items-center gap-2 text-base text-muted-foreground">
                <Camera className="w-4 h-4" />
                צילום: {item.photographer}
              </div>
          }
          </motion.div>

          {/* Short Text */}
          {item.short_text &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${getTextSizeClass(textSize)} text-foreground mb-8`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: item.short_text }} />

        }

          {/* Full Description */}
          {item.description &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${getTextSizeClass(textSize)} text-foreground`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: item.description }} />

        }

          {/* Voting Section */}
          <div data-ev-id="ev_cc7973e397" className="mt-10">
            <ArticleVoting articleType="bein_hatzibur" articleId={id || ''} />
          </div>

          {/* Comments Section */}
          <div data-ev-id="ev_f70f3fd148" className="mt-8">
            <ArticleComments articleType="bein_hatzibur" articleId={id || ''} />
          </div>
        </article>
      }
    </ArticleDetailLayout>);

}