// ============================================================
// SERVICE WORKER - ADHIGANA PRAPTI
// ============================================================

const CACHE_NAME = 'adhigana-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/firebase.js',
  '/manifest.json',
  '/asset/Adhigana prapti.png'
];

// ============================================================
// INSTALL - CACHE ASSETS
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE - CLEAN OLD CACHES
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH - SERVE FROM CACHE OR NETWORK
// ============================================================
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request)
          .then((response) => {
            // Cache new responses
            if (response && response.status === 200) {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cloned);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback if offline
            return new Response('Offline - Silakan coba lagi nanti', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ============================================================
// PUSH NOTIFICATION - 🔥 INI PENTING UNTUK NOTIFIKASI!
// ============================================================
self.addEventListener('push', (event) => {
  console.log('📨 Service Worker: Push event received', event);

  let data = {
    title: 'ADHIGANA PRAPTI',
    body: 'Ada notifikasi baru!',
    icon: '/asset/Adhigana prapti.png',
    badge: '/asset/Adhigana prapti.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'adhigana-notif'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      data.tag = payload.tag || data.tag;
      data.url = payload.url || '/';
      data.icon = payload.icon || data.icon;
      data.badge = payload.badge || data.badge;
      data.vibrate = payload.vibrate || data.vibrate;
      data.requireInteraction = payload.requireInteraction !== undefined ? payload.requireInteraction : data.requireInteraction;
    } catch (e) {
      // Jika bukan JSON, gunakan teks biasa
      data.body = event.data.text() || data.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      requireInteraction: data.requireInteraction,
      tag: data.tag,
      data: {
        url: data.url,
        timestamp: Date.now()
      }
    })
  );
});

// ============================================================
// NOTIFICATION CLICK
// ============================================================
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked', event);

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada tab yang sudah terbuka
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Jika tidak ada, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================================
// MESSAGE - HANDLE MESSAGES FROM CLIENT
// ============================================================
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_READY') {
    event.ports[0].postMessage({ status: 'READY' });
  }
});
