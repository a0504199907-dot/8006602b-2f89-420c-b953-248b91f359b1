import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { canInstall, showInstallPrompt, isAppInstalled } from '@/lib/pwa';

interface InstallPWAProps {
  variant?: 'banner' | 'button' | 'floating';
  className?: string;
}

export default function InstallPWA({ variant = 'floating', className = '' }: InstallPWAProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (isAppInstalled()) return;
    if (localStorage.getItem('pwa-install-dismissed')) {
      const dismissedAt = parseInt(localStorage.getItem('pwa-install-dismissed') || '0');
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setIsInstallable(true);
      // Delay showing prompt by 30 seconds
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Check immediately
    if (canInstall()) {
      setIsInstallable(true);
      setTimeout(() => setShowPrompt(true), 30000);
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Simple button variant
  if (variant === 'button') {
    if (!isInstallable || isAppInstalled()) return null;

    return (
      <button data-ev-id="ev_14bc54f828"
      onClick={handleInstall}
      className={`flex items-center gap-2 px-4 py-2 bg-secondary text-black font-medium rounded-xl hover:bg-secondary-light transition-colors ${className}`}>

        <Download className="w-4 h-4" />
        <span data-ev-id="ev_275d0425c3">התקן אפליקציה</span>
      </button>);

  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showPrompt && !dismissed &&
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-gray-900 text-white p-4 shadow-lg ${className}`}>

            <div data-ev-id="ev_7cb5f92492" className="container mx-auto flex items-center justify-between gap-4">
              <div data-ev-id="ev_d51feb566e" className="flex items-center gap-3">
                <div data-ev-id="ev_7237e67f7f" className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-secondary" />
                </div>
                <div data-ev-id="ev_fbf471c418">
                  <h3 data-ev-id="ev_f30558389b" className="font-bold">התקן את האפליקציה!</h3>
                  <p data-ev-id="ev_2a593e6ee6" className="text-sm text-gray-300">גישה מהירה ותמיכה באופליין</p>
                </div>
              </div>
              <div data-ev-id="ev_dd6f985681" className="flex items-center gap-2">
                <button data-ev-id="ev_345b70d7a3"
              onClick={handleInstall}
              className="px-4 py-2 bg-secondary text-black font-bold rounded-lg hover:bg-secondary-light transition-colors">

                  התקן
                </button>
                <button data-ev-id="ev_66ffef46a1"
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>);

  }

  // Floating variant (default)
  return (
    <AnimatePresence>
      {showPrompt && !dismissed &&
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 ${className}`}>

          <div data-ev-id="ev_e25b2f7801" className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with gradient */}
            <div data-ev-id="ev_c35a00b5ac" className="bg-gradient-to-r from-primary to-gray-800 p-4 text-white">
              <div data-ev-id="ev_549763252a" className="flex items-center justify-between">
                <div data-ev-id="ev_d785e09871" className="flex items-center gap-3">
                  <div data-ev-id="ev_75288c81a8" className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-secondary" />
                  </div>
                  <div data-ev-id="ev_6952d67b05">
                    <h3 data-ev-id="ev_303e5229a0" className="font-bold text-lg">הציבור החרדי</h3>
                    <p data-ev-id="ev_4c9822792b" className="text-sm text-gray-300">התקן את האפליקציה</p>
                  </div>
                </div>
                <button data-ev-id="ev_ad52ab4648"
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Features */}
            <div data-ev-id="ev_ed9c6307c9" className="p-4">
              <div data-ev-id="ev_3e4401a4a8" className="grid grid-cols-3 gap-3 mb-4">
                <div data-ev-id="ev_67deb3bea2" className="text-center p-2">
                  <div data-ev-id="ev_d8b232beae" className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span data-ev-id="ev_2d91c2b87d" className="text-xs text-gray-600">טעינה מהירה</span>
                </div>
                <div data-ev-id="ev_1b5422ea0d" className="text-center p-2">
                  <div data-ev-id="ev_b1fff871e0" className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wifi className="w-5 h-5 text-green-600" />
                  </div>
                  <span data-ev-id="ev_a00a241260" className="text-xs text-gray-600">עובד אופליין</span>
                </div>
                <div data-ev-id="ev_5a1182ac86" className="text-center p-2">
                  <div data-ev-id="ev_7884d229c9" className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <span data-ev-id="ev_e75b07fb74" className="text-xs text-gray-600">התראות</span>
                </div>
              </div>
              
              {/* Install Button */}
              <button data-ev-id="ev_e2547d2102"
            onClick={handleInstall}
            className="w-full py-3 bg-gradient-to-r from-secondary to-secondary-dark text-black font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">

                <Download className="w-5 h-5" />
                התקן עכשיו
              </button>
              
              <p data-ev-id="ev_f1c126f315" className="text-center text-xs text-gray-400 mt-3">
                ללא חנות אפליקציות • ללא עדכונים
              </p>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}