import { useParams, Link } from 'react-router';
import Layout from '@/components/layout/Layout';
import { useVideos } from '@/hooks/useVideos';
import PageAds from '@/components/ui/PageAds';
import { ChevronLeft, Play, Eye, Clock, Share2, ThumbsUp, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoCard from '@/components/ui/VideoCard';

export default function VideoDetail() {
  const { id } = useParams<{id: string;}>();
  const { videos, loading } = useVideos({});

  const video = videos.find((v) => v.id === id);
  const relatedVideos = videos.filter((v) => v.id !== id).slice(0, 4);

  if (loading) {
    return (
      <Layout>
        <div data-ev-id="ev_033d2cb254" className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
          <p data-ev-id="ev_50159742b1" className="text-muted-foreground mt-4">טוען וידאו...</p>
        </div>
      </Layout>);

  }

  if (!video) {
    return (
      <Layout>
        <div data-ev-id="ev_40e77b0685" className="container mx-auto px-4 py-20 text-center">
          <div data-ev-id="ev_88049ce10e" className="bg-surface rounded-[12px] p-10 shadow-card border border-border max-w-md mx-auto">
            <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 data-ev-id="ev_6b5db960b5" className="text-2xl font-bold mb-4 font-serif">הסרטון לא נמצא</h1>
            <p data-ev-id="ev_8fe694ad74" className="text-muted-foreground mb-6">הסרטון שחיפשת לא קיים או הוסר</p>
            <Link
              to="/video"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-[10px] font-bold hover:bg-secondary-light transition-all shadow-gold">

              <ChevronLeft className="w-5 h-5" />
              חזרה לסרטונים
            </Link>
          </div>
        </div>
      </Layout>);

  }

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = video.videoUrl ? getYouTubeId(video.videoUrl) : null;

  return (
    <Layout showTicker={false} showSideAds={false}>
      {/* Breadcrumb */}
      <div data-ev-id="ev_8823d07fbe" className="bg-muted/50 border-b border-border">
        <div data-ev-id="ev_8d00836b68" className="container mx-auto px-4 py-4">
          <div data-ev-id="ev_01cac5665f" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-secondary transition-colors">ראשי</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link to="/video" className="hover:text-secondary transition-colors">וידאו</Link>
            <ChevronLeft className="w-4 h-4" />
            <span data-ev-id="ev_3676f8dfba" className="text-foreground truncate max-w-[250px]">{video.title}</span>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <section data-ev-id="ev_01a4559f8f" className="py-8 bg-background">
        <div data-ev-id="ev_ae646ec46c" className="container mx-auto px-4">
          <div data-ev-id="ev_72303ac49f" className="grid lg:grid-cols-3 gap-8">
            {/* Main Video */}
            <div data-ev-id="ev_7a91b162a7" className="lg:col-span-2">
              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-video rounded-2xl overflow-hidden bg-black mb-6">

                {youtubeId ?
                <iframe data-ev-id="ev_23bf83b5b2"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen /> :


                <div data-ev-id="ev_423bcce70b" className="relative w-full h-full">
                    <img data-ev-id="ev_4409aa8059"
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover" />

                    <div data-ev-id="ev_1904c9a1ae" className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div data-ev-id="ev_4939e601bc" className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-gold">
                        <Play className="w-10 h-10 text-primary fill-primary mr-[-4px]" />
                      </div>
                    </div>
                  </div>
                }
              </motion.div>

              {/* Video Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>

                {video.chassidut &&
                <span data-ev-id="ev_8ccf110bf8" className="inline-block bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {video.chassidut}
                  </span>
                }

                <h1 data-ev-id="ev_14abcec855" className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-foreground mb-4 break-words">
                  {video.title}
                </h1>

                <div data-ev-id="ev_353d3081e5" className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                  <span data-ev-id="ev_58a4cc3f69" className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {video.views?.toLocaleString() || 0} צפיות
                  </span>
                  <span data-ev-id="ev_cf5959680d" className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {video.duration}
                  </span>
                  <span data-ev-id="ev_090962b8b8" className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {video.publishedAt}
                  </span>
                </div>

                {/* Actions */}
                <div data-ev-id="ev_2e46e51fea" className="flex items-center gap-3 pb-6 border-b border-border">
                  <button data-ev-id="ev_5196f56cb5" className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    אהבתי
                  </button>
                  <button data-ev-id="ev_01217585ea" className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    שיתוף
                  </button>
                </div>

                {/* Description */}
                {video.description &&
                <div data-ev-id="ev_3da868ceb3" className="mt-6">
                    <h3 data-ev-id="ev_e0d2859170" className="font-bold mb-3">תיאור</h3>
                    <p data-ev-id="ev_bb5b536872" className="text-foreground/80 leading-relaxed">{video.description}</p>
                  </div>
                }
              </motion.div>
            </div>

            {/* Related Videos Sidebar */}
            <div data-ev-id="ev_3d3167341c" className="lg:col-span-1">
              <h3 data-ev-id="ev_9acc99dce0" className="text-lg font-bold mb-4">סרטונים נוספים</h3>
              <div data-ev-id="ev_78d1a9c8d9" className="flex flex-col gap-4">
                {relatedVideos.map((relatedVideo, index) =>
                <Link key={relatedVideo.id} to={`/video/${relatedVideo.id}`}>
                    <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 group cursor-pointer">

                      <div data-ev-id="ev_ced9faa824" className="w-40 aspect-video rounded-lg overflow-hidden shrink-0 relative">
                        <img data-ev-id="ev_6d234e083c"
                      src={relatedVideo.thumbnail}
                      alt={relatedVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                        <div data-ev-id="ev_3bfb0e72c9" className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {relatedVideo.duration}
                        </div>
                      </div>
                      <div data-ev-id="ev_e7107c7075" className="flex-1 min-w-0">
                        <h4 data-ev-id="ev_6fcef44012" className="font-medium text-foreground line-clamp-2 group-hover:text-secondary transition-colors text-sm">
                          {relatedVideo.title}
                        </h4>
                        <p data-ev-id="ev_ba48e25a5c" className="text-xs text-muted-foreground mt-1">
                          {relatedVideo.views?.toLocaleString() || 0} צפיות
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Banner Ad */}
      <div data-ev-id="ev_6c7dec874a" className="bg-muted/30 py-8">
        <div data-ev-id="ev_81c08a0034" className="container mx-auto px-4">
          <PageAds page="video-detail" position="bottom" />
        </div>
      </div>
    </Layout>);

}