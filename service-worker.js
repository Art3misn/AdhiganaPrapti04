/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'adhigana-pwa-v1';

// Cache list sederhana untuk halaman utama + asset penting.
// Tambahkan file lain bila perlu.
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Cache only same-origin GET requests
          const url = new URL(req.url);
          if (url.origin === location.origin) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone).catch(() => {});
            }).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          // Fallback sederhana: kalau gagal fetch, tampilkan index.html (untuk navigasi)
          if (req.mode === 'navigate') return caches.match('./index.html');
          return undefined;
        });
    })
  );
});

// ============================================================
// PUSH NOTIFICATION (FCM)
// ============================================================
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    // ignore parsing errors
  }

  const title = payload.title || 'Pengumuman Mading';
  const body = payload.body || 'Ada pengumuman baru.';
  const clickUrl = payload.clickUrl || './Login.html';

  const options = {
    body,
    tag: payload.tag || 'mading',
    data: { url: clickUrl },
    icon: payload.icon || './asset/Adhigana prapti.png',
    badge: payload.badge || './asset/Adhigana prapti.png',
    // catatan: sound untuk service-worker masih tidak konsisten di semua browser.
    // bunyi akan kita coba lewat client-foreground.
    // (beberapa browser mengabaikan opsi sound, jadi kita tidak mengandalkannya)
    vibrate: [100, 50, 100],
  }; 


  event.waitUntil(self.registration.showNotification(title, options));

});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || './Login.html';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({ type: 'NOTIF_CLICKED', url });
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});


