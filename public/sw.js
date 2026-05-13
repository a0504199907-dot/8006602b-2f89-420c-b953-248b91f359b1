/**
 * Service Worker - הציבור החרדי
 * מאפשר קריאה אופליין וטעינה מהירה
 */

const CACHE_NAME = 'hatzibur-v1';
const STATIC_CACHE = 'hatzibur-static-v1';
const DYNAMIC_CACHE = 'hatzibur-dynamic-v1';
const IMAGE_CACHE = 'hatzibur-images-v1';

// קבצים סטטיים לשמירה מיידית
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// דפים חשובים לשמירה
const IMPORTANT_PAGES = [
  '/',
  '/news',
  '/gallery',
  '/video',
  '/siah-hatzibur',
  '/newspaper',
];

// התקנת Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// הפעלת Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // מחק caches ישנים
            return name.startsWith('hatzibur-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// טיפול בבקשות
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // התעלם מבקשות שאינן HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // התעלם מבקשות API (Supabase)
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  // התעלם מבקשות chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // אסטרטגיה לתמונות - Cache First
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }
  
  // אסטרטגיה לדפי HTML - Network First with Cache Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // אסטרטגיה לקבצים סטטיים (JS, CSS) - Stale While Revalidate
  if (isStaticAsset(request)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }
  
  // ברירת מחדל - Network First
  event.respondWith(networkFirstStrategy(request));
});

// בדיקה אם הבקשה היא לתמונה
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('drive.google.com')
  );
}

// בדיקה אם הבקשה היא לקובץ סטטי
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Cache First - קודם מהcache, אז מהרשת
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // עדכן ברקע
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // החזר placeholder לתמונות
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" fill="#999">📷</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Network First - קודם מהרשת, אז מהcache
async function networkFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // אם זה ניווט - החזר דף אופליין
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale While Revalidate - החזר מיד מהcache ועדכן ברקע
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// עדכון cache ברקע
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // שגיאת רשת - התעלם
  }
}

// קבלת הודעות מהאפליקציה
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Push Notifications (לעתיד)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'עדכון חדש מהציבור החרדי',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'פתח' },
      { action: 'close', title: 'סגור' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'הציבור החרדי', options)
  );
});

// לחיצה על התראה
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // אם יש חלון פתוח - התמקד בו
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // אחרת פתח חלון חדש
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
