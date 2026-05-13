import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import ArticleDetailLayout from '@/components/ui/ArticleDetailLayout';
import ActionBar from '@/components/ui/ActionBar';
import TextToSpeechPlayer from '@/components/ui/TextToSpeechPlayer';
import { Calendar, User, Eye } from 'lucide-react';
import TextSizeSelector, { TextSize, getTextSizeClass } from '@/components/ui/TextSizeSelector';
import ArticleVoting from '@/components/ui/ArticleVoting';
import ArticleComments from '@/components/ui/ArticleComments';
import { useArticleWithCache } from '@/hooks/useArticleCache';
import ReadingProgressBar from '@/components/ui/ReadingProgressBar';
import { useSEO, useArticleSchema } from '@/hooks/useSEO';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'subtitle' | 'quote';
  content?: string;
  // Support both field names for images
  url?: string;
  imageUrl?: string;
  caption?: string;
  credit?: string;
  photographer?: string;
  quoteSource?: string;
}

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  cover_image_url: string | null;
  content: string;
  content_blocks: ContentBlock[] | null;
  author: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  chassidut: string | null;
  tags: string[] | null;
  views: number;
}

export default function SiahDetail() {
  const { id } = useParams<{id: string;}>();
  const [textSize, setTextSize] = useState<TextSize>('normal');

  // Use cached article hook - shows cached data INSTANTLY
  const { article, loading } = useArticleWithCache<Article>(
    'siah_hatzibur',
    id,
    {
      incrementViews: true,
      transform: (data) => ({
        ...data,
        content: typeof data.content === 'string' ? data.content : '',
        content_blocks: data.content_blocks as ContentBlock[] | null
      })
    }
  );

  const getTextContent = () => {
    if (article?.content_blocks && article.content_blocks.length > 0) {
      return article.content_blocks.
      filter((b) => b.type === 'text' || b.type === 'subtitle' || b.type === 'quote').
      map((b) => b.content).
      join('. ');
    }
    return article?.content || '';
  };

  // SEO for article page
  useSEO({
    title: article?.title,
    description: article?.subtitle || getTextContent().slice(0, 160),
    image: article?.cover_image_url || undefined,
    url: `/siah/${id}`,
    type: 'article',
    publishedTime: article?.gregorian_date,
    author: article?.author || undefined,
    section: 'שיח הציבור'
  });

  // Structured data for article
  useArticleSchema({
    title: article?.title || '',
    description: article?.subtitle || getTextContent().slice(0, 160),
    image: article?.cover_image_url || undefined,
    url: `/siah/${id}`,
    publishedTime: article?.gregorian_date || new Date().toISOString(),
    authorName: article?.author || 'הציבור החרדי',
    section: 'שיח הציבור'
  });

  const breadcrumbs = article ? [
  { label: 'דף הבית', href: '/' },
  { label: 'שיח הציבור', href: '/siah' },
  { label: article.title }] :
  [];

  return (
    <ArticleDetailLayout
      loading={loading}
      notFound={!article}
      backLink="/siah"
      backText="חזרה לשיח הציבור"
      breadcrumbs={breadcrumbs}>

      {/* Reading Progress Bar */}
      <ReadingProgressBar 
        textContent={getTextContent()} 
        variant="detailed" 
        showReadingTime 
        showPercentage 
      />

      {article &&
      <article data-ev-id="ev_5ed0eb0597" data-article-content>
          {/* Header */}
          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

            {article.chassidut &&
          <span data-ev-id="ev_106c0cda08" className="inline-block bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium mb-4">
                {article.chassidut}
              </span>
          }
            <h1 data-ev-id="ev_b342983112" className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-4 leading-tight">
              {article.title}
            </h1>
            {article.subtitle &&
          <p data-ev-id="ev_0bfb335e0a" className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>
          }

            {/* Meta */}
            <div data-ev-id="ev_de3601670a" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              <span data-ev-id="ev_87839b0b8b" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.hebrew_date}
              </span>
              {article.author &&
            <span data-ev-id="ev_177614a45f" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.author}
                </span>
            }
              <span data-ev-id="ev_91f65363cc" className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views} צפיות
              </span>
            </div>
          </motion.header>

          {/* Action Bar */}
          <ActionBar title={article.title} content={getTextContent()} className="mb-6" />

          {/* Text Size Selector */}
          <div data-ev-id="ev_36645b6afc" className="mb-6">
            <TextSizeSelector onSizeChange={setTextSize} />
          </div>

          {/* Text to Speech Player */}
          <div data-ev-id="ev_647c9ab232" className="mb-8">
            <TextToSpeechPlayer text={getTextContent()} title={article.title} />
          </div>

          {/* Cover Image */}
          {article.cover_image_url &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden shadow-lg">

              <img data-ev-id="ev_fa5cfc4bda"
          src={article.cover_image_url}
          alt={article.title}
          className="w-full h-auto object-contain" />

            </motion.div>
        }

          {/* Content */}
          {article.content_blocks && article.content_blocks.length > 0 ?
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`flex flex-col gap-8 ${getTextSizeClass(textSize)}`}
          style={{ direction: 'rtl' }}>

              {article.content_blocks.map((block, idx) =>
          <BlockRenderer key={block.id || idx} block={block} />
          )}
            </motion.div> :

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`prose prose-xl max-w-none text-foreground leading-loose ${getTextSizeClass(textSize)}`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: article.content }} />

        }

          {/* Tags */}
          {article.tags && article.tags.length > 0 &&
        <div data-ev-id="ev_aeff8163b1" className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
              {article.tags.map((tag, idx) =>
          <span data-ev-id="ev_51f4f65404" key={idx} className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
                  #{tag}
                </span>
          )}
            </div>
        }

          {/* Voting Section */}
          <div data-ev-id="ev_2b705bb171" className="mt-10">
            <ArticleVoting articleType="siah_hatzibur" articleId={id || ''} />
          </div>

          {/* Comments Section */}
          <div data-ev-id="ev_ac5fe66550" className="mt-8">
            <ArticleComments articleType="siah_hatzibur" articleId={id || ''} />
          </div>
        </article>
      }
    </ArticleDetailLayout>);

}

// Block Renderer Component - תצוגה משופרת
function BlockRenderer({ block }: {block: ContentBlock;}) {
  // פונקציה לניקוי HTML tags מהטקסט
  const cleanText = (text: string) => {
    if (!text) return '';
    return text.
    replace(/<\/?p>/g, '').
    replace(/<\/?br\s*\/?>/g, '\n').
    replace(/<[^>]*>/g, '').
    replace(/&nbsp;/g, ' ').
    replace(/&amp;/g, '&').
    replace(/&lt;/g, '<').
    replace(/&gt;/g, '>').
    replace(/\s+/g, ' ').
    trim();
  };

  switch (block.type) {
    case 'text':
      const textContent = cleanText(block.content);
      const paragraphs = textContent.split(/\n+/).filter((p) => p.trim());

      return (
        <div data-ev-id="ev_b0c06b1a2f" className="text-lg md:text-xl text-foreground leading-relaxed md:leading-loose">
          {paragraphs.map((paragraph, idx) =>
          paragraph.trim() &&
          <p data-ev-id="ev_1248caa07e" key={idx} className="mb-6 first:mt-0">
                {paragraph}
              </p>

          )}
        </div>);


    case 'subtitle':
      return (
        <h2 data-ev-id="ev_99f5060942" className="text-2xl md:text-3xl font-bold text-foreground font-serif mt-10 mb-6 pb-3 border-b-2 border-secondary/30">
          {cleanText(block.content)}
        </h2>);


    case 'quote':
      return (
        <blockquote data-ev-id="ev_7de4c43d77" className="border-r-4 border-secondary pr-6 py-4 my-8 bg-gradient-to-l from-muted/50 to-transparent rounded-l-2xl">
          <p data-ev-id="ev_39a9485e94" className="text-xl md:text-2xl italic text-foreground leading-relaxed">
            "{cleanText(block.content)}"
          </p>
        </blockquote>);


    case 'image':
      // Support both url and imageUrl field names
      const imgSrc = block.imageUrl || block.url;
      const imgCredit = block.photographer || block.credit;
      
      if (!imgSrc) return null;
      
      return (
        <figure data-ev-id="ev_16798d8e6c" className="my-10">
          <div data-ev-id="ev_a2db19b81b" className="rounded-2xl overflow-hidden shadow-lg">
            <img data-ev-id="ev_b88d56d39e"
              src={imgSrc}
              alt={block.caption || ''}
              className="w-full h-auto object-contain" />
          </div>
          {(block.caption || imgCredit) &&
            <figcaption data-ev-id="ev_3f4e08942e" className="mt-4 px-2 text-base text-muted-foreground flex flex-wrap items-center justify-between gap-2">
              {block.caption &&
                <span data-ev-id="ev_323dbef239" className="font-medium">{block.caption}</span>
              }
              {imgCredit &&
                <span data-ev-id="ev_28bc84fee8" className="text-sm bg-muted/50 px-3 py-1 rounded-full">
                  צילום: {imgCredit}
                </span>
              }
            </figcaption>
          }
        </figure>
      );


    default:
      return null;
  }
}