import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { skipWaiting } from '@/lib/pwa';

export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setShowPrompt(true);
    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleUpdate = () => {
    skipWaiting();
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt &&
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">

          <div data-ev-id="ev_cf7f3a2134" className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
            <div data-ev-id="ev_376a682572" className="flex items-start gap-3">
              <div data-ev-id="ev_8be010587d" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div data-ev-id="ev_c43dafdd8c" className="flex-1">
                <h3 data-ev-id="ev_2e19a5b573" className="font-bold mb-1">גרסה חדשה זמינה!</h3>
                <p data-ev-id="ev_b55f565262" className="text-sm text-white/80 mb-3">רענן לקבלת שיפורים ותיקונים</p>
                <div data-ev-id="ev_020d3e07cb" className="flex gap-2">
                  <button data-ev-id="ev_ca97f04ee0"
                onClick={handleUpdate}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">

                    <RefreshCw className="w-4 h-4" />
                    עדכן
                  </button>
                  <button data-ev-id="ev_07a4ccbbd8"
                onClick={() => setShowPrompt(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors">

                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}