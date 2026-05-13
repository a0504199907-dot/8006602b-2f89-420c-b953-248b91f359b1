import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { History, Calendar, Camera, ChevronLeft, Sparkles } from 'lucide-react';
import { useHistoricalEvents } from '@/hooks/useNewspaperSections';

export default function FeaturedHistoricalSection() {
  const { events } = useHistoricalEvents(1);

  // אם אין אירועים, לא מציגים כלום
  if (events.length === 0) {
    return null;
  }

  const featuredEvent = events[0];
  const mainImage = featuredEvent.images?.[0]?.url || featuredEvent.main_image;

  return (
    <section data-ev-id="ev_df002d169a" className="relative py-20 overflow-hidden">
      {/* Dark gradient background */}
      <div data-ev-id="ev_f328461f16" className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-dark to-gray-900" />
      
      {/* Decorative elements */}
      <div data-ev-id="ev_8ed429afe8" className="absolute inset-0 opacity-10">
        <div data-ev-id="ev_51af760d0b" className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div data-ev-id="ev_0444a5a069" className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Pattern overlay */}
      <div data-ev-id="ev_16db271135"
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />


      <div data-ev-id="ev_6f9dfa4de3" className="container mx-auto px-4 relative z-10">
        <div data-ev-id="ev_2183e6bcbc" className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white order-2 lg:order-1">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 text-secondary px-4 py-2 rounded-full mb-6">

              <History className="w-4 h-4" />
              <span data-ev-id="ev_090e8cfd0f" className="font-medium">אירועים היסטוריים</span>
            </motion.div>

            <h2 data-ev-id="ev_263ddd287f" className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">
              {featuredEvent.title}
            </h2>
            
            {featuredEvent.hebrew_date &&
            <div data-ev-id="ev_c293276e94" className="flex items-center gap-2 text-secondary mb-6">
                <Calendar className="w-5 h-5" />
                <span data-ev-id="ev_5a7f481c66" className="text-xl font-medium">{featuredEvent.hebrew_date}</span>
              </div>
            }

            {/* Stats */}
            <div data-ev-id="ev_e61b1ebc3a" className="flex flex-wrap gap-6 mb-8">
              {featuredEvent.year &&
              <div data-ev-id="ev_776198ee8a" className="flex items-center gap-2">
                  <div data-ev-id="ev_4b6deda43f" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <History className="w-5 h-5 text-secondary" />
                  </div>
                  <div data-ev-id="ev_f2386ea572">
                    <div data-ev-id="ev_61a071a598" className="text-2xl font-bold text-white">{featuredEvent.year}</div>
                    <div data-ev-id="ev_eecfbdfd3f" className="text-xs text-white/60">שנה</div>
                  </div>
                </div>
              }
              {featuredEvent.images && featuredEvent.images.length > 0 &&
              <div data-ev-id="ev_f8e8b5ff2a" className="flex items-center gap-2">
                  <div data-ev-id="ev_c9226e003e" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-secondary" />
                  </div>
                  <div data-ev-id="ev_0e0c8fdae7">
                    <div data-ev-id="ev_bb56c9abad" className="text-2xl font-bold text-white">{featuredEvent.images.length}</div>
                    <div data-ev-id="ev_b0a3d8e93c" className="text-xs text-white/60">תמונות</div>
                  </div>
                </div>
              }
            </div>

            {/* Description */}
            {featuredEvent.description &&
            <p data-ev-id="ev_1eccaa51f9" className="text-white/70 mb-8 text-lg line-clamp-3">
                {featuredEvent.description}
              </p>
            }

            {/* CTA */}
            <div data-ev-id="ev_026b668d32" className="flex flex-wrap gap-4">
              <Link
                to={`/historical/${featuredEvent.id}`}
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-secondary/30">

                <History className="w-5 h-5" />
                קרא עוד
              </Link>
              <Link
                to="/historical"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20">

                כל האירועים
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Image Side */}
          {mainImage &&
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2 flex justify-center">

              {/* Glow effect behind */}
              <div data-ev-id="ev_c8999ead3d" className="absolute inset-0 bg-secondary/30 blur-3xl rounded-full scale-75" />
              
              {/* Main image */}
              <motion.div
              whileHover={{ scale: 1.02, rotateY: -5 }}
              transition={{ duration: 0.3 }}
              className="relative"
              style={{ perspective: '1000px' }}>

                <div data-ev-id="ev_9a21886da1" className="relative aspect-[4/3] w-80 md:w-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <img data-ev-id="ev_1a970fa024"
                src={mainImage}
                alt={featuredEvent.title}
                className="w-full h-full object-cover" />

                  {/* Shine effect */}
                  <div data-ev-id="ev_2d0a324b9f" className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
                
                {/* Floating badge */}
                <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-secondary text-primary px-5 py-2 rounded-full font-bold text-lg shadow-xl flex items-center gap-2">

                  <Sparkles className="w-4 h-4" />
                  היסטוריה
                </motion.div>
                
                {/* Year badge */}
                {featuredEvent.year &&
              <div data-ev-id="ev_2fdbe55c07" className="absolute -bottom-3 -left-3 bg-white text-primary px-4 py-2 rounded-xl font-bold shadow-xl">
                    {featuredEvent.year}
                  </div>
              }
              </motion.div>
            </motion.div>
          }
        </div>
      </div>
    </section>);

}