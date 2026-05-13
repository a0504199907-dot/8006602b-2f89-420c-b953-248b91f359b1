import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGalleries } from '@/hooks/useGalleries';
import Layout from '@/components/layout/Layout';
import PageAds from '@/components/ui/PageAds';
import {
  Images,
  Calendar,
  Share2,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2,
  Loader2 } from
'lucide-react';

export default function GalleryDetail() {
  const { id } = useParams<{id: string;}>();
  const { galleries, loading } = useGalleries({ includeImages: true });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const album = galleries.find((g) => g.id === id);
  const images = album?.images || [];

  // Loading state
  if (loading) {
    return (
      <Layout showSideAds={false}>
        <div data-ev-id="ev_f829683357" className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        </div>
      </Layout>);

  }

  // Not found
  if (!album) {
    return (
      <Layout showSideAds={false}>
        <div data-ev-id="ev_118fe5f778" className="container mx-auto px-4 py-20 text-center">
          <h1 data-ev-id="ev_c40516d2ea" className="text-2xl font-bold text-foreground mb-4">הגלריה לא נמצאה</h1>
          <Link to="/gallery" className="text-secondary hover:underline">חזרה לגלריות</Link>
        </div>
      </Layout>);

  }

  // Lightbox navigation
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };
  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <Layout showSideAds={false}>
      <div data-ev-id="ev_9c295b1255" className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div data-ev-id="ev_e751dad9ea" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-secondary transition-colors">דף הבית</Link>
          <span data-ev-id="ev_e5d2db16d3">/</span>
          <Link to="/gallery" className="hover:text-secondary transition-colors">גלריות</Link>
          <span data-ev-id="ev_03dd6f1934">/</span>
          <span data-ev-id="ev_88c420b205" className="text-foreground line-clamp-1">{album.title}</span>
        </div>

        {/* Main Grid: Content + Sidebar */}
        <div data-ev-id="ev_c82057a3bc" className="grid grid-cols-12 gap-8">
          {/* Content Area */}
          <div data-ev-id="ev_5fe3a91c8b" className="col-span-12 lg:col-span-8">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8">

              {album.chassidut &&
              <span data-ev-id="ev_cc50c7cf6d" className="inline-block bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {album.chassidut}
                </span>
              }
              <h1 data-ev-id="ev_c1c51b8cba" className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-4">
                {album.title}
              </h1>
              <div data-ev-id="ev_b176c42509" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-border">
                <span data-ev-id="ev_72ad70437a" className="flex items-center gap-1">
                  <Images className="w-4 h-4" />
                  {images.length} תמונות
                </span>
                <span data-ev-id="ev_c24c85a771" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {album.date || album.hebrew_date || album.hebrewDate || 'תאריך לא זמין'}
                </span>
                {album.photographer &&
                <span data-ev-id="ev_73d00a828d" className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    {album.photographer}
                  </span>
                }
              </div>
            </motion.header>

            {/* Share Button */}
            <div data-ev-id="ev_d096060db8" className="flex items-center gap-3 mb-8">
              <button data-ev-id="ev_fd430e8a6d" className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                שיתוף
              </button>
            </div>

            {/* All Images - Vertical Scroll */}
            <div data-ev-id="ev_db4406b4cf" className="flex flex-col gap-6">
              {images.map((image, idx) => {
                const imageUrl = image.image_url || image.url || '';
                return (
                  <motion.div
                    key={image.id || idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4 }}
                    className="relative group">

                    {/* Image Container */}
                    <div data-ev-id="ev_cb68aa0e2d"
                    className="relative rounded-2xl overflow-hidden bg-muted/30 cursor-pointer"
                    onClick={() => openLightbox(idx)}>

                      <img data-ev-id="ev_17580e2843"
                      src={imageUrl}
                      alt={image.caption || `תמונה ${idx + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy" />

                      
                      {/* Hover Overlay */}
                      <div data-ev-id="ev_db6c22237e" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div data-ev-id="ev_cfe8f526b2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Image Number */}
                      <div data-ev-id="ev_9daad61aba" className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                        {idx + 1} / {images.length}
                      </div>
                    </div>

                    {/* Caption */}
                    {(image.caption || image.photographer) &&
                    <div data-ev-id="ev_d251a74562" className="mt-3 px-2">
                        {image.caption &&
                      <p data-ev-id="ev_37e200b493" className="text-foreground text-lg">{image.caption}</p>
                      }
                        {image.photographer &&
                      <p data-ev-id="ev_a0ab6e8a0a" className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                            <Camera className="w-4 h-4" />
                            צילום: {image.photographer}
                          </p>
                      }
                      </div>
                    }
                  </motion.div>);

              })}
            </div>

            {/* Empty State */}
            {images.length === 0 &&
            <div data-ev-id="ev_b8f40d5b92" className="text-center py-20 bg-surface rounded-2xl border border-border">
                <Images className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p data-ev-id="ev_a060307607" className="text-muted-foreground">אין תמונות בגלריה זו</p>
              </div>
            }
          </div>

          {/* Sidebar - Sticky Ads */}
          <aside data-ev-id="ev_6e136b6874" className="col-span-12 lg:col-span-4">
            <div data-ev-id="ev_1f6aec6897" className="sticky top-24 flex flex-col gap-4">
              {/* Back Link */}
              <Link
                to="/gallery"
                className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">

                <ArrowRight className="w-4 h-4" />
                חזרה לגלריות
              </Link>

              {/* Sidebar Ads */}
              <PageAds pageType="article" position="sidebar-1" />
              <PageAds pageType="article" position="sidebar-2" />
              <PageAds pageType="article" position="sidebar-3" />
            </div>
          </aside>
        </div>

        {/* Bottom Ad */}
        <div data-ev-id="ev_e364e5fd27" className="mt-12">
          <PageAds pageType="article" position="bottom" />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}>

            {/* Close Button */}
            <button data-ev-id="ev_3d6ba39903"
          className="absolute top-4 right-4 text-white/80 hover:text-white z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          onClick={closeLightbox}>

              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {lightboxIndex > 0 &&
          <button data-ev-id="ev_f9993a4dad"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          onClick={(e) => {e.stopPropagation();goPrev();}}>

                <ChevronRight className="w-8 h-8" />
              </button>
          }

            {lightboxIndex < images.length - 1 &&
          <button data-ev-id="ev_a3a3d35b97"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          onClick={(e) => {e.stopPropagation();goNext();}}>

                <ChevronLeft className="w-8 h-8" />
              </button>
          }

            {/* Main Image */}
            <motion.div
            key={lightboxIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-[90vw] max-h-[85vh] p-4"
            onClick={(e) => e.stopPropagation()}>

              <img data-ev-id="ev_b7cd74757a"
            src={images[lightboxIndex]?.image_url || images[lightboxIndex]?.url || ''}
            alt={images[lightboxIndex]?.caption || ''}
            className="max-w-full max-h-[75vh] object-contain mx-auto rounded-lg" />

              
              {/* Caption */}
              <div data-ev-id="ev_e1133525ad" className="text-center mt-4">
                {images[lightboxIndex]?.caption &&
              <p data-ev-id="ev_d82b68f5f5" className="text-white/90 text-lg mb-2">{images[lightboxIndex].caption}</p>
              }
                {images[lightboxIndex]?.photographer &&
              <p data-ev-id="ev_fc6c30fa75" className="text-white/60 text-sm flex items-center justify-center gap-1">
                    <Camera className="w-4 h-4" />
                    צילום: {images[lightboxIndex].photographer}
                  </p>
              }
                <p data-ev-id="ev_187325ff1d" className="text-white/40 text-sm mt-2">
                  {lightboxIndex + 1} / {images.length}
                </p>
              </div>
            </motion.div>

            {/* Bottom Thumbnails */}
            <div data-ev-id="ev_c1bd9189ab" className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/50 rounded-xl">
              {images.map((image, idx) => {
              const thumbUrl = image.image_url || image.url || '';
              return (
                <button data-ev-id="ev_a948e31deb"
                key={image.id || idx}
                onClick={(e) => {e.stopPropagation();setLightboxIndex(idx);}}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all ${
                idx === lightboxIndex ?
                'ring-2 ring-white scale-110' :
                'opacity-60 hover:opacity-100'}`
                }>

                    <img data-ev-id="ev_ba021a2f9a"
                  src={thumbUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover" />

                  </button>);

            })}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </Layout>);

}