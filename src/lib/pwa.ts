/**
 * PWA Utilities - הציבור החרדי
 * ניהול Service Worker והתקנת אפליקציה
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    
    swRegistration = registration;
    console.log('[PWA] Service Worker registered:', registration.scope);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            dispatchUpdateEvent();
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('[PWA] Service Worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('[PWA] Service Worker unregister failed:', error);
    return false;
  }
}

/**
 * Listen for install prompt
 */
export function listenForInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    dispatchInstallAvailableEvent();
  });
  
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    dispatchAppInstalledEvent();
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }
  
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install prompt outcome:', outcome);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
}

/**
 * Check if app is installed (standalone mode)
 */
export function isAppInstalled(): boolean {
  // iOS
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    return true;
  }
  
  // Android/Desktop
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  return false;
}

/**
 * Check if install prompt is available
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Skip waiting for new service worker
 */
export function skipWaiting(): void {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Cache specific URLs
 */
export function cacheUrls(urls: string[]): void {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls,
    });
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('[PWA] All caches cleared');
  }
}

/**
 * Get cache storage estimate
 */
export async function getCacheStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persisted = await navigator.storage.persist();
      console.log('[PWA] Persistent storage:', persisted);
      return persisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function listenForNetworkChanges(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Custom events
function dispatchInstallAvailableEvent(): void {
  window.dispatchEvent(new CustomEvent('pwa-install-available'));
}

function dispatchAppInstalledEvent(): void {
  window.dispatchEvent(new CustomEvent('pwa-app-installed'));
}

function dispatchUpdateEvent(): void {
  window.dispatchEvent(new CustomEvent('pwa-update-available'));
}

// Initialize
export function initPWA(): void {
  if (typeof window === 'undefined') return;
  
  registerServiceWorker();
  listenForInstallPrompt();
  
  // Listen for controller change (new SW activated)
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  showInstallPrompt,
  isAppInstalled,
  canInstall,
  skipWaiting,
  cacheUrls,
  clearAllCaches,
  getCacheStorageEstimate,
  requestPersistentStorage,
  isOnline,
  listenForNetworkChanges,
  initPWA,
};
