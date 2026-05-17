import { useState } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleDetailLayout from '@/components/ui/ArticleDetailLayout';
import ActionBar from '@/components/ui/ActionBar';
import TextToSpeechPlayer from '@/components/ui/TextToSpeechPlayer';
import {
  Calendar,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  User,
  Camera } from
'lucide-react';
import TextSizeSelector, { TextSize, getTextSizeClass } from '@/components/ui/TextSizeSelector';
import ArticleVoting from '@/components/ui/ArticleVoting';
import ArticleComments from '@/components/ui/ArticleComments';
import { useArticleWithCache } from '@/hooks/useArticleCache';

interface ImageWithCaption {
  url: string;
  caption: string;
}

interface HistoricalEvent {
  id: string;
  title: string;
  description: string | null;
  content: string;
  cover_image_url: string | null;
  images: ImageWithCaption[];
  event_year_hebrew: string | null;
  event_year_gregorian: number | null;
  event_decade: string | null;
  chassidut: string | null;
  event_type: string | null;
  location: string | null;
  author: string | null;
  photographer: string | null;
}

export default function HistoricalEventDetail() {
  const { id } = useParams<{id: string;}>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [textSize, setTextSize] = useState<TextSize>('normal');

  // Use cached article hook - shows cached data INSTANTLY
  const { article: event, loading } = useArticleWithCache<HistoricalEvent>(
    'historical_events',
    id,
    {
      incrementViews: true,
      transform: (data) => ({
        ...data,
        content: typeof data.content === 'string' ? data.content : '',
        images: Array.isArray(data.images) ? data.images : []
      })
    }
  );

  const breadcrumbs = event ? [
  { label: 'דף הבית', href: '/' },
  { label: 'אירועים היסטוריים', href: '/historical' },
  { label: event.title }] :
  [];

  const textContent = event?.content?.replace(/<[^>]*>/g, '') || '';

  const nextImage = () => {
    if (event && currentImageIndex < event.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <ArticleDetailLayout
      loading={loading}
      notFound={!event}
      backLink="/historical"
      backText="חזרה לאירועים היסטוריים"
      breadcrumbs={breadcrumbs}>

      {event &&
      <article data-ev-id="ev_b8814d47d3">
          {/* Header */}
          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

            <div data-ev-id="ev_e802317520" className="flex flex-wrap items-center gap-3 mb-4">
              {event.event_type &&
            <span data-ev-id="ev_ff8b155e3b" className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {event.event_type}
                </span>
            }
              {event.chassidut &&
            <span data-ev-id="ev_6b528b3491" className="bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium">
                  {event.chassidut}
                </span>
            }
              {event.event_year_hebrew &&
            <span data-ev-id="ev_16da7b7203" className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                  {event.event_year_hebrew}
                </span>
            }
            </div>

            <h1 data-ev-id="ev_3dcafbc649" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif mb-4 leading-tight break-words">
              {event.title}
            </h1>

            {event.description &&
          <p data-ev-id="ev_8c38241216" className="text-lg sm:text-xl text-muted-foreground mb-6 break-words">{event.description}</p>
          }

            {/* Meta */}
            <div data-ev-id="ev_1244f444ce" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              {event.event_year_gregorian &&
            <span data-ev-id="ev_38c31fb961" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  שנת {event.event_year_gregorian}
                </span>
            }
              {event.location &&
            <span data-ev-id="ev_a569f725d9" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
            }
              {event.author &&
            <span data-ev-id="ev_48ea64f468" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {event.author}
                </span>
            }
              {event.photographer &&
            <span data-ev-id="ev_d516b744b3" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  צילום: {event.photographer}
                </span>
            }
              {event.images.length > 0 &&
            <span data-ev-id="ev_bd6a591849" className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {event.images.length} תמונות
                </span>
            }
            </div>
          </motion.header>

          {/* Action Bar + Text Size on one row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <TextSizeSelector onSizeChange={setTextSize} />
            <ActionBar title={event.title} content={textContent} />
          </div>

          {/* Text to Speech Player */}
          {textContent &&
        <div data-ev-id="ev_844b2f7f85" className="mb-8">
              <TextToSpeechPlayer text={textContent} title={event.title} />
            </div>
        }

          {/* Cover Image */}
          {(event.cover_image_url || event.images.length > 0) &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
          onClick={() => openLightbox(0)}>

              <img data-ev-id="ev_6da47ab86e"
          src={event.cover_image_url || event.images[0]?.url}
          alt={event.title}
          className="w-full h-auto object-contain sepia-[0.15] hover:sepia-0 transition-all" />

              {event.images[0]?.caption &&
          <div data-ev-id="ev_c930f88637" className="bg-muted/50 px-4 py-3 text-base text-muted-foreground">
                  {event.images[0].caption}
                </div>
          }
            </motion.div>
        }

          {/* Content */}
          {event.content &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${getTextSizeClass(textSize)} text-foreground mb-10`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: event.content }} />

        }

          {/* Additional Images Grid */}
          {event.images.length > 1 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8">

              <h3 data-ev-id="ev_bfea599d46" className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-secondary" />
                תמונות נוספות
              </h3>
              <div data-ev-id="ev_9ce787fcc5" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.images.slice(1).map((img, idx) =>
            <div data-ev-id="ev_6935f2078a"
            key={idx}
            className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/3]"
            onClick={() => openLightbox(idx + 1)}>

                    <img data-ev-id="ev_53da45e5cf"
              src={img.url}
              alt={img.caption || `תמונה ${idx + 2}`}
              className="w-full h-full object-cover sepia-[0.15] group-hover:sepia-0 group-hover:scale-105 transition-all duration-300" />

                    <div data-ev-id="ev_7b17475486" className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
            )}
              </div>
            </motion.div>
        }

          {/* Voting Section */}
          <div data-ev-id="ev_1252ee70ae" className="mt-10">
            <ArticleVoting articleType="historical_events" articleId={id || ''} />
          </div>

          {/* Comments Section */}
          <div data-ev-id="ev_e26e90cddf" className="mt-8">
            <ArticleComments articleType="historical_events" articleId={id || ''} />
          </div>
        </article>
      }

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && event && event.images.length > 0 &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}>

            <button data-ev-id="ev_691870dcc4"
          className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
          onClick={() => setLightboxOpen(false)}>

              <X className="w-8 h-8" />
            </button>

            {currentImageIndex > 0 &&
          <button data-ev-id="ev_32d23ba425"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50"
          onClick={(e) => {e.stopPropagation();prevImage();}}>

                <ChevronRight className="w-10 h-10" />
              </button>
          }

            {currentImageIndex < event.images.length - 1 &&
          <button data-ev-id="ev_8ca2669a85"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50"
          onClick={(e) => {e.stopPropagation();nextImage();}}>

                <ChevronLeft className="w-10 h-10" />
              </button>
          }

            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}>

              <img data-ev-id="ev_9caf7f65f2"
            src={event.images[currentImageIndex].url}
            alt={event.images[currentImageIndex].caption || ''}
            className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg" />

              {event.images[currentImageIndex].caption &&
            <p data-ev-id="ev_46e3c437e9" className="text-white/80 text-center mt-4 text-lg">
                  {event.images[currentImageIndex].caption}
                </p>
            }
              <p data-ev-id="ev_5e11774c91" className="text-white/50 text-center mt-2 text-sm">
                {currentImageIndex + 1} / {event.images.length}
              </p>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </ArticleDetailLayout>);

}
