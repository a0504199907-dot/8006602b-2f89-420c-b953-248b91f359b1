import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Newspaper, FileText, MessageSquare, Eye, Clock,
  History, Camera, BookOpen } from
'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
}

const categories: Category[] = [
{ id: 'newspaper', label: 'גליונות', icon: <BookOpen className="w-5 h-5" />, link: '/newspaper' },
{ id: 'siah', label: 'שיח הציבור', icon: <FileText className="w-5 h-5" />, link: '/siah' },
{ id: 'news-batzibur', label: 'ניועס בציבור', icon: <Newspaper className="w-5 h-5" />, link: '/news-batzibur' },
{ id: 'bein-hatzibur', label: 'בעין הציבור', icon: <Eye className="w-5 h-5" />, link: '/bein-hatzibur' },
{ id: 'before-18', label: 'לפני 18 שנה', icon: <Clock className="w-5 h-5" />, link: '/before-18' },
{ id: 'historical', label: 'אירועים היסטוריים', icon: <History className="w-5 h-5" />, link: '/historical' },
{ id: 'gallery', label: 'גלריות', icon: <Camera className="w-5 h-5" />, link: '/gallery' }];


export default function CategoryStrip() {
  return (
    <nav data-ev-id="ev_a1a1cc66a5" className="bg-primary border-b border-white/10">
      <div data-ev-id="ev_de81da4cc6" className="container mx-auto px-4">
        <div data-ev-id="ev_4f6d48a6ed" className="flex items-center justify-center overflow-x-auto scrollbar-hide">
          <div data-ev-id="ev_4a9bc7119f" className="flex items-center gap-1 py-2">
            {categories.map((category, index) =>
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}>

                <Link
                to={category.link}
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-secondary hover:bg-white/5 rounded-lg transition-all whitespace-nowrap text-sm font-medium group">

                  <span data-ev-id="ev_46adab3066" className="text-secondary/70 group-hover:text-secondary transition-colors">
                    {category.icon}
                  </span>
                  {category.label}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>);

}