// ============================================================
// SERVICE WORKER - ADHIGANA PRAPTI v2
// ============================================================

const CACHE_NAME = 'adhigana-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/asset/Adhigana prapti.png'
];

// ── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Jangan cache request Firebase / Google APIs
  if (event.request.url.includes('firestore') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic') ||
      event.request.url.includes('fonts')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});

// ── PUSH NOTIFICATION ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {
    title: 'ADHIGANA PRAPTI',
    body: 'Ada notifikasi baru!',
    type: 'info',
    url: '/'
  };

  if (event.data) {
    try { Object.assign(payload, event.data.json()); }
    catch { payload.body = event.data.text(); }
  }

  const iconMap = {
    kas:    '/asset/Adhigana prapti.png',
    mading: '/asset/Adhigana prapti.png',
    absensi:'/asset/Adhigana prapti.png',
    info:   '/asset/Adhigana prapti.png',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: iconMap[payload.type] || '/asset/Adhigana prapti.png',
      badge: '/asset/Adhigana prapti.png',
      vibrate: payload.type === 'kas' ? [200,100,200,100,200] : [200,100,200],
      requireInteraction: true,
      tag: 'adhigana-' + payload.type,
      data: { url: payload.url || '/' },
      actions: [
        { action: 'open', title: '📖 Buka' },
        { action: 'dismiss', title: '✖ Tutup' }
      ]
    })
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── MESSAGE FROM PAGE ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CHECK_READY') {
    event.source?.postMessage({ type: 'SW_READY' });
  }
  if (event.data?.type === 'SHOW_NOTIF') {
    const d = event.data;
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: '/asset/Adhigana prapti.png',
      badge: '/asset/Adhigana prapti.png',
      vibrate: d.vibrate || [200, 100, 200],
      requireInteraction: false,
      tag: 'adhigana-msg-' + Date.now(),
      data: { url: '/' }
    });
  }
});
