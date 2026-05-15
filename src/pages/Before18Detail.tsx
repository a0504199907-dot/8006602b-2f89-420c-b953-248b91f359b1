import { useState } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleDetailLayout from '@/components/ui/ArticleDetailLayout';
import ActionBar from '@/components/ui/ActionBar';
import TextToSpeechPlayer from '@/components/ui/TextToSpeechPlayer';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
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

interface Before18Item {
  id: string;
  title: string;
  week_parasha: string;
  year_hebrew: string;
  year_gregorian: number;
  description: string | null;
  images: ImageWithCaption[];
  author: string | null;
  photographer: string | null;
}

export default function Before18Detail() {
  const { id } = useParams<{id: string;}>();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [textSize, setTextSize] = useState<TextSize>('normal');

  // Use cached article hook - shows cached data INSTANTLY
  const { article: item, loading } = useArticleWithCache<Before18Item>(
    'before_18_years',
    id,
    {
      incrementViews: true,
      transform: (data) => ({
        ...data,
        images: Array.isArray(data.images) ? data.images : []
      })
    }
  );

  const nextImage = () => {
    if (item && selectedImage !== null && selectedImage < item.images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const breadcrumbs = item ? [
  { label: 'דף הבית', href: '/' },
  { label: 'לפני 18 שנה', href: '/before-18' },
  { label: item.title }] :
  [];

  return (
    <ArticleDetailLayout
      loading={loading}
      notFound={!item}
      backLink="/before-18"
      backText="חזרה ללפני 18 שנה"
      breadcrumbs={breadcrumbs}>

      {item &&
      <article data-ev-id="ev_c64ee43492">
          {/* Header */}
          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

            <div data-ev-id="ev_4f00448476" className="flex flex-wrap items-center gap-3 mb-4">
              <span data-ev-id="ev_2df29d5fda" className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold">
                <Clock className="w-4 h-4" />
                לפני 18 שנה
              </span>
              <span data-ev-id="ev_942dc9dcc0" className="bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold">
                {item.year_hebrew}
              </span>
              <span data-ev-id="ev_4ebc0caab2" className="text-muted-foreground text-sm">
                פרשת {item.week_parasha}
              </span>
            </div>

            <h1 data-ev-id="ev_b3600f85f9" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif mb-4 leading-tight break-words">
              {item.title}
            </h1>

            {/* Meta */}
            <div data-ev-id="ev_cddf40f07f" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              <span data-ev-id="ev_924fdf9479" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                שנת {item.year_gregorian}
              </span>
              {item.author &&
            <span data-ev-id="ev_dc899075ef" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {item.author}
                </span>
            }
              {item.photographer &&
            <span data-ev-id="ev_02d690db60" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  צילום: {item.photographer}
                </span>
            }
              {item.images.length > 0 &&
            <span data-ev-id="ev_ee1a26c37f" className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {item.images.length} תמונות
                </span>
            }
            </div>
          </motion.header>

          {/* Action Bar */}
          <ActionBar title={item.title} content={item.description || ''} className="mb-6" />

          {/* Text Size Selector */}
          <div data-ev-id="ev_0caed27bf5" className="mb-6">
            <TextSizeSelector onSizeChange={setTextSize} />
          </div>

          {/* Text to Speech Player */}
          {item.description &&
        <div data-ev-id="ev_5d59423bab" className="mb-8">
              <TextToSpeechPlayer text={item.description} title={item.title} />
            </div>
        }

          {/* Main Image */}
          {item.images.length > 0 &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
          onClick={() => setSelectedImage(0)}>

              <img data-ev-id="ev_488818164d"
          src={item.images[0].url}
          alt={item.images[0].caption || item.title}
          className="w-full h-auto object-contain sepia-[0.2] hover:sepia-0 transition-all" />

              {item.images[0].caption &&
          <div data-ev-id="ev_44999e5985" className="bg-muted/50 px-4 py-3 text-base text-muted-foreground">
                  {item.images[0].caption}
                </div>
          }
            </motion.div>
        }

          {/* Description */}
          {item.description &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${getTextSizeClass(textSize)} text-foreground mb-10`}
          style={{ direction: 'rtl' }}
          dangerouslySetInnerHTML={{ __html: item.description }} />

        }

          {/* Additional Images Grid */}
          {item.images.length > 1 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8">

              <h3 data-ev-id="ev_fc1b81b748" className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-secondary" />
                תמונות נוספות
              </h3>
              <div data-ev-id="ev_a1cebc4b08" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.images.slice(1).map((img, idx) =>
            <div data-ev-id="ev_4931364d65"
            key={idx}
            className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/3]"
            onClick={() => setSelectedImage(idx + 1)}>

                    <img data-ev-id="ev_8f535941b1"
              src={img.url}
              alt={img.caption || `תמונה ${idx + 2}`}
              className="w-full h-full object-cover sepia-[0.2] group-hover:sepia-0 group-hover:scale-105 transition-all duration-300" />

                    <div data-ev-id="ev_621cac282d" className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
            )}
              </div>
            </motion.div>
        }

          {/* Voting Section */}
          <div data-ev-id="ev_ba575f9bec" className="mt-10">
            <ArticleVoting articleType="before_18_years" articleId={id || ''} />
          </div>

          {/* Comments Section */}
          <div data-ev-id="ev_4a791e73ba" className="mt-8">
            <ArticleComments articleType="before_18_years" articleId={id || ''} />
          </div>
        </article>
      }

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && item &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}>

            <button data-ev-id="ev_7e52811520"
          className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
          onClick={() => setSelectedImage(null)}>

              <X className="w-8 h-8" />
            </button>

            {selectedImage > 0 &&
          <button data-ev-id="ev_3e7fdf17d7"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50"
          onClick={(e) => {e.stopPropagation();prevImage();}}>

                <ChevronRight className="w-10 h-10" />
              </button>
          }

            {selectedImage < item.images.length - 1 &&
          <button data-ev-id="ev_33dced5b8e"
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

              <img data-ev-id="ev_93020c082b"
            src={item.images[selectedImage].url}
            alt={item.images[selectedImage].caption || ''}
            className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg" />

              {item.images[selectedImage].caption &&
            <p data-ev-id="ev_b09d34680f" className="text-white/80 text-center mt-4 text-lg">
                  {item.images[selectedImage].caption}
                </p>
            }
              <p data-ev-id="ev_66fae623a9" className="text-white/50 text-center mt-2 text-sm">
                {selectedImage + 1} / {item.images.length}
              </p>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </ArticleDetailLayout>);

}