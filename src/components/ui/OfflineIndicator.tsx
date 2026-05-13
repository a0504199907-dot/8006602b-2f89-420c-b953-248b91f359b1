import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { isOnline, listenForNetworkChanges } from '@/lib/pwa';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setOnline(isOnline());

    const cleanup = listenForNetworkChanges(
      () => {
        setOnline(true);
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      },
      () => setOnline(false)
    );

    return cleanup;
  }, []);

  return (
    <AnimatePresence>
      {!online &&
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-2 px-4 shadow-lg">

          <div data-ev-id="ev_6dd59a604a" className="container mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5" />
            <span data-ev-id="ev_3a0c684514" className="font-medium">אין חיבור לאינטרנט</span>
            <span data-ev-id="ev_a5c1e599a0" className="text-red-200 text-sm">חלק מהתוכן יהיה זמין מה-cache</span>
            <button data-ev-id="ev_bd27147afe"
          onClick={() => window.location.reload()}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">

              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      }
      
      {showReconnected &&
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white py-2 px-4 shadow-lg">

          <div data-ev-id="ev_634d54ae17" className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5" />
            <span data-ev-id="ev_68660c6121" className="font-medium">החיבור חזר!</span>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}