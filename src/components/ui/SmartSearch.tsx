import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Newspaper, Image, Calendar, Clock, FileText, BookOpen, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: 'siah' | 'news' | 'bein' | 'before18' | 'historical' | 'gallery' | 'event' | 'newspaper';
  url: string;
  date?: string;
}

const TYPE_CONFIG = {
  siah: { label: 'שיח הציבור', icon: FileText, color: 'bg-blue-500' },
  news: { label: 'נייעס בציבור', icon: Newspaper, color: 'bg-purple-500' },
  bein: { label: 'בעין הציבור', icon: Camera, color: 'bg-pink-500' },
  before18: { label: 'לפני 18 שנה', icon: Clock, color: 'bg-amber-500' },
  historical: { label: 'אירועים היסטוריים', icon: BookOpen, color: 'bg-emerald-500' },
  gallery: { label: 'גלריה', icon: Image, color: 'bg-cyan-500' },
  event: { label: 'אירוע', icon: Calendar, color: 'bg-red-500' },
  newspaper: { label: 'גליון', icon: Newspaper, color: 'bg-gray-500' }
};

// Hebrew keyboard typo corrections
const HEBREW_TYPO_MAP: Record<string, string[]> = {
  'ש': ['ס'], 'ס': ['ש'], 'כ': ['ח'], 'ח': ['כ'],
  'ב': ['ו'], 'ו': ['ב'], 'ט': ['ת'], 'ת': ['ט'],
  'א': ['ע'], 'ע': ['א'], 'ק': ['כ'], 'צ': ['ץ'],
  'ץ': ['צ'], 'מ': ['ם', 'נ'], 'ם': ['מ'], 'נ': ['ן', 'מ'],
  'ן': ['נ'], 'פ': ['ף'], 'ף': ['פ']
};

function generateSearchVariants(query: string): string[] {
  const variants = new Set<string>([query]);
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const alternatives = HEBREW_TYPO_MAP[char];
    if (alternatives) {
      for (const alt of alternatives) {
        variants.add(query.slice(0, i) + alt + query.slice(i + 1));
      }
    }
  }
  const withoutFinals = query.
  replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').
  replace(/ץ/g, 'צ').replace(/ך/g, 'כ');
  variants.add(withoutFinals);
  return Array.from(variants);
}

export default function SmartSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!supabase) return;
    setLoading(true);

    try {
      const searchVariants = generateSearchVariants(searchQuery);
      const allResults: SearchResult[] = [];

      const buildOrCondition = (fields: string[]) => {
        const conditions: string[] = [];
        for (const variant of searchVariants) {
          const term = `%${variant}%`;
          for (const field of fields) {
            conditions.push(`${field}.ilike.${term}`);
          }
        }
        return conditions.join(',');
      };

      const [siahRes, newsRes, beinRes, before18Res, historicalRes, galleryRes, eventRes, newspaperRes] = await Promise.all([
      supabase.from('siah_hatzibur').select('id, title, subtitle, cover_image_url, hebrew_date').
      eq('is_published', true).or(buildOrCondition(['title', 'subtitle', 'author', 'chassidut'])).limit(5),
      supabase.from('news_batzibur').select('id, title, subtitle, image_url, hebrew_date').
      eq('is_published', true).or(buildOrCondition(['title', 'subtitle', 'chassidut'])).limit(5),
      supabase.from('bein_hatzibur').select('id, title, subtitle, image_url').
      eq('is_published', true).or(buildOrCondition(['title', 'subtitle'])).limit(5),
      supabase.from('before_18_years').select('id, title, description, year_hebrew, week_parasha').
      eq('is_published', true).or(buildOrCondition(['title', 'description', 'week_parasha'])).limit(5),
      supabase.from('historical_events').select('id, title, subtitle, cover_image_url, event_hebrew_date').
      eq('is_published', true).or(buildOrCondition(['title', 'subtitle'])).limit(5),
      supabase.from('galleries').select('id, title, description, cover_image').
      eq('status', 'published').or(buildOrCondition(['title', 'description'])).limit(5),
      supabase.from('events').select('id, title, description, image_url, event_date').
      eq('status', 'published').or(buildOrCondition(['title', 'description', 'location'])).limit(5),
      supabase.from('newspaper_issues').select('id, title, issue_number, cover_image_url, hebrew_date, parasha').
      eq('is_published', true).or(buildOrCondition(['title', 'parasha'])).limit(5)]
      );

      if (siahRes.data) {
        allResults.push(...siahRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.subtitle || undefined,
          image: r.cover_image_url || undefined, type: 'siah' as const,
          url: `/siah/${r.id}`, date: r.hebrew_date || undefined
        })));
      }
      if (newsRes.data) {
        allResults.push(...newsRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.subtitle || undefined,
          image: r.image_url || undefined, type: 'news' as const,
          url: `/news-batzibur/${r.id}`, date: r.hebrew_date || undefined
        })));
      }
      if (beinRes.data) {
        allResults.push(...beinRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.subtitle || undefined,
          image: r.image_url || undefined, type: 'bein' as const,
          url: `/bein-hatzibur/${r.id}`
        })));
      }
      if (before18Res.data) {
        allResults.push(...before18Res.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.description || undefined,
          type: 'before18' as const, url: `/before-18/${r.id}`,
          date: r.year_hebrew || undefined
        })));
      }
      if (historicalRes.data) {
        allResults.push(...historicalRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.subtitle || undefined,
          image: r.cover_image_url || undefined, type: 'historical' as const,
          url: `/historical/${r.id}`, date: r.event_hebrew_date || undefined
        })));
      }
      if (galleryRes.data) {
        allResults.push(...galleryRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.description || undefined,
          image: r.cover_image || undefined, type: 'gallery' as const,
          url: `/gallery/${r.id}`
        })));
      }
      if (eventRes.data) {
        allResults.push(...eventRes.data.map((r) => ({
          id: r.id, title: r.title, subtitle: r.description || undefined,
          image: r.image_url || undefined, type: 'event' as const,
          url: `/events/${r.id}`, date: r.event_date || undefined
        })));
      }
      if (newspaperRes.data) {
        allResults.push(...newspaperRes.data.map((r) => ({
          id: r.id, title: `גליון #${r.issue_number} - ${r.title}`,
          subtitle: r.parasha ? `פרשת ${r.parasha}` : undefined,
          image: r.cover_image_url || undefined, type: 'newspaper' as const,
          url: `/newspaper`, date: r.hebrew_date || undefined
        })));
      }

      setResults(allResults.slice(0, 12));
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  };

  return (
    <div data-ev-id="ev_9867231a7f" ref={containerRef} className="relative">
      {/* Search Button */}
      {!isOpen &&
      <button data-ev-id="ev_8290ec623b"
      onClick={openSearch}
      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">

          <Search className="w-4 h-4" />
          <span data-ev-id="ev_7fd2b05ec2" className="text-sm hidden sm:inline">חיפוש</span>
        </button>
      }

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeSearch} />

            
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-[500px]">

              <div data-ev-id="ev_5aa8b09dce" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div data-ev-id="ev_c0226677f8" className="flex items-center gap-3 p-4 border-b border-gray-100">
                  {loading ?
                <Loader2 className="w-5 h-5 text-secondary animate-spin" /> :

                <Search className="w-5 h-5 text-secondary" />
                }
                  <input data-ev-id="ev_8e1ee5bbc1"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="חיפוש..."
                className="flex-1 text-foreground placeholder:text-gray-400 focus:outline-none text-lg"
                dir="rtl" />

                  <button data-ev-id="ev_c206dedb0c" onClick={closeSearch} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Results */}
                {results.length > 0 &&
              <div data-ev-id="ev_fd0e88fc9d" className="max-h-[60vh] overflow-y-auto">
                    {results.map((result, idx) => {
                  const config = TYPE_CONFIG[result.type];
                  const Icon = config.icon;
                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      onClick={closeSearch}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      idx === selectedIndex ? 'bg-secondary/10' : ''}`
                      }>

                          <div data-ev-id="ev_9d23847626" className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            {result.image ?
                        <img data-ev-id="ev_e23c9161de" src={result.image} alt="" className="w-full h-full object-cover" /> :

                        <div data-ev-id="ev_764e03c42d" className={`w-full h-full flex items-center justify-center ${config.color}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                        }
                          </div>
                          <div data-ev-id="ev_deca01500b" className="flex-1 min-w-0">
                            <h4 data-ev-id="ev_f566b5e6a4" className="font-medium text-foreground line-clamp-1">{result.title}</h4>
                            <div data-ev-id="ev_04df8e2347" className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span data-ev-id="ev_38b844b49d" className={`px-1.5 py-0.5 rounded text-white text-[10px] ${config.color}`}>
                                {config.label}
                              </span>
                              {result.date && <span data-ev-id="ev_01277536d7">{result.date}</span>}
                            </div>
                          </div>
                        </Link>);

                })}
                  </div>
              }

                {/* No Results */}
                {query.length >= 2 && !loading && results.length === 0 &&
              <div data-ev-id="ev_8514754927" className="p-8 text-center text-muted-foreground">
                    <p data-ev-id="ev_30fea422ae">לא נמצאו תוצאות</p>
                  </div>
              }
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}