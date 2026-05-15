import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { BookOpen, Star, TrendingUp, ChevronLeft, Sparkles } from 'lucide-react';
import { useNewspaperIssues } from '@/hooks/useNewspaperSections';

export default function FeaturedIssueSection() {
  const { issues } = useNewspaperIssues(1);

  // אם אין גליונות, לא מציגים כלום
  if (issues.length === 0) {
    return null;
  }

  const latestIssue = issues[0];

  return (
    <section data-ev-id="ev_a2edcc5f3b" className="relative py-20 overflow-hidden">
      {/* Dark gradient background */}
      <div data-ev-id="ev_452d39c926" className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-dark to-gray-900" />
      
      {/* Decorative elements */}
      <div data-ev-id="ev_baa120e979" className="absolute inset-0 opacity-10">
        <div data-ev-id="ev_d10fbe2173" className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div data-ev-id="ev_d3828723e5" className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Pattern overlay */}
      <div data-ev-id="ev_a60fd37be1"
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div data-ev-id="ev_87e121e6cb" className="container mx-auto px-4 relative z-10">
        <div data-ev-id="ev_7fa4e69d49" className="grid lg:grid-cols-2 gap-12 items-center">
          
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
              <Sparkles className="w-4 h-4" />
              <span data-ev-id="ev_2b5999341e" className="font-medium">הגליון השבועי</span>
            </motion.div>

            <h2 data-ev-id="ev_4bdc884a50" className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-4 break-words">
              <span data-ev-id="ev_2ec88a366c" className="text-secondary">גליון</span> #{latestIssue.issue_number}
            </h2>
            <h3 data-ev-id="ev_00353a49b5" className="text-xl sm:text-2xl md:text-3xl font-serif text-white/80 mb-6 break-words">
              {latestIssue.title}
            </h3>

            {/* Stats */}
            <div data-ev-id="ev_ce61da6291" className="flex flex-wrap gap-6 mb-8">
              <div data-ev-id="ev_8ecca8ae48" className="flex items-center gap-2">
                <div data-ev-id="ev_d4b117bd66" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div data-ev-id="ev_0b3ac0c2e2">
                  <div data-ev-id="ev_6b5caf6017" className="text-2xl font-bold text-white">64</div>
                  <div data-ev-id="ev_deb5f86426" className="text-xs text-white/60">עמודים</div>
                </div>
              </div>
              <div data-ev-id="ev_244217c650" className="flex items-center gap-2">
                <div data-ev-id="ev_f93ef72c43" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <div data-ev-id="ev_7806ea1526">
                  <div data-ev-id="ev_ebb4f9a4e5" className="text-2xl font-bold text-white">12</div>
                  <div data-ev-id="ev_0823cb469f" className="text-xs text-white/60">כתבות</div>
                </div>
              </div>
              <div data-ev-id="ev_0f760b8e07" className="flex items-center gap-2">
                <div data-ev-id="ev_5ed0676edc" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div data-ev-id="ev_3555fd1f2e">
                  <div data-ev-id="ev_4f15a948a0" className="text-2xl font-bold text-white">200+</div>
                  <div data-ev-id="ev_7202f297da" className="text-xs text-white/60">תמונות</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {latestIssue.description &&
            <p data-ev-id="ev_ea114c8d0f" className="text-white/70 mb-8 text-lg">
                {latestIssue.description}
              </p>
            }

            {/* CTA */}
            <div data-ev-id="ev_a7bf620fb1" className="flex flex-wrap gap-4">
              <Link
                to="/newspaper"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-secondary/30">
                <BookOpen className="w-5 h-5" />
                צפה בגליון
              </Link>
              <Link
                to="/newspaper"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20">
                כל הגליונות
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Cover Image Side */}
          {latestIssue.cover_image_url &&
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2 flex justify-center">

              {/* Glow effect behind */}
              <div data-ev-id="ev_35901ed401" className="absolute inset-0 bg-secondary/30 blur-3xl rounded-full scale-75" />
              
              {/* Cover image */}
              <motion.div
              whileHover={{ scale: 1.02, rotateY: -5 }}
              transition={{ duration: 0.3 }}
              className="relative"
              style={{ perspective: '1000px' }}>

                <div data-ev-id="ev_826d865c89" className="relative aspect-[3/4] w-72 md:w-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <img data-ev-id="ev_2b0a751c14"
                src={latestIssue.cover_image_url}
                alt={`גליון ${latestIssue.issue_number}`}
                className="w-full h-full object-cover" />
                  {/* Shine effect */}
                  <div data-ev-id="ev_74cd3ddd3a" className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
                
                {/* Floating badge */}
                <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-secondary text-primary px-5 py-2 rounded-full font-bold text-lg shadow-xl">
                  חדש!
                </motion.div>
                
                {/* Issue number badge */}
                <div data-ev-id="ev_7f3be99307" className="absolute -bottom-3 -left-3 bg-white text-primary px-4 py-2 rounded-xl font-bold shadow-xl">
                  #{latestIssue.issue_number}
                </div>
              </motion.div>
            </motion.div>
          }
        </div>
      </div>
    </section>);

}