// ============================================================
// SERVICE WORKER - ADHIGANA PRAPTI
// ============================================================

const CACHE_NAME = 'adhigana-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/asset/Adhigana prapti.png'
];

// ============================================================
// INSTALL
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
// ACTIVATE
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
// FETCH
// ============================================================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cloned);
              });
            }
            return response;
          })
          .catch(() => {
            return new Response('Offline - Silakan coba lagi nanti', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ============================================================
// PUSH NOTIFICATION
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
    } catch (e) {
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
        url: data.url || '/'
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
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
