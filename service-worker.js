// ============================================================
// SERVICE WORKER - ADHIGANA PRAPTI v4 (FCM + Push + Cloud Function)
// ============================================================

// ═══════════════════════════════════════════════════════════════
// FIREBASE IMPORT (untuk push notification)
// ═══════════════════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const CACHE_NAME = 'adhigana-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/asset/Adhigana prapti.png'
];

// ── Firebase config ──────────────────────────────────────────
firebase.initializeApp({
  apiKey:            "AIzaSyATh7MiV8xr4vHgF3AjqMhXc87LhCRF7N0",
  authDomain:        "adhiganaprapti-e8f13.firebaseapp.com",
  projectId:         "adhiganaprapti-e8f13",
  storageBucket:     "adhiganaprapti-e8f13.firebasestorage.app",
  messagingSenderId: "1011133018564",
  appId:             "1:1011133018564:web:57e9537b39c85a44593491"
});

const messaging = firebase.messaging();

// ── Background push (tab tertutup / tidak aktif) ────────────
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message:', payload);

  const data = payload.data || payload.notification || {};
  const title = data.title || 'ADHIGANA PRAPTI';
  const body = data.body || 'Ada notifikasi baru!';
  const type = data.type || 'info';

  const iconMap = {
    kas:     '💰',
    mading:  '📰',
    absensi: '📋',
    info:    '🔔'
  };

  self.registration.showNotification(
    (iconMap[type] || '🔔') + ' ' + title,
    {
      body: body,
      icon: '/asset/Adhigana prapti.png',
      badge: '/asset/Adhigana prapti.png',
      vibrate: type === 'kas' ? [200,100,200,100,200] : [200,100,200],
      requireInteraction: true,
      tag: 'adhigana-' + type + '-' + Date.now(),
      data: { url: '/', type: type }
    }
  );
});

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firestore') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('fonts')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});

// ── NOTIFICATION CLICK ──────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── MESSAGE ──────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'CHECK_READY') {
    e.source?.postMessage({ type: 'SW_READY' });
  }
});
