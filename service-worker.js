// ============================================================
// SERVICE WORKER - ADHIGANA PRAPTI v3 (FCM + Push + iOS)
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const CACHE_NAME = 'adhigana-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/asset/Adhigana prapti.png',
  '/asset/icon-192x192.png',
  '/asset/icon-512x512.png',
  '/asset/icon-180x180.png'
];

// ── Firebase config di SW ────────────────────────────────────
firebase.initializeApp({
  apiKey:            "AIzaSyATh7MiV8xr4vHgF3AjqMhXc87LhCRF7N0",
  authDomain:        "adhiganaprapti-e8f13.firebaseapp.com",
  projectId:         "adhiganaprapti-e8f13",
  storageBucket:     "adhiganaprapti-e8f13.firebasestorage.app",
  messagingSenderId: "1011133018564",
  appId:             "1:1011133018564:web:57e9537b39c85a44593491"
});

const messaging = firebase.messaging();

// ── Background push (tab tertutup / tidak aktif) ─────────────
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message:', payload);

  const { title, body, type } = payload.data || payload.notification || {};
  const notifType = type || 'info';

  const iconMap = {
    kas:     '💰',
    mading:  '📰',
    absensi: '📋',
    info:    '🔔'
  };

  self.registration.showNotification(
    (iconMap[notifType] || '🔔') + ' ' + (title || 'ADHIGANA PRAPTI'),
    {
      body:               body || 'Ada update baru!',
      icon:               '/asset/Adhigana prapti.png',
      badge:              '/asset/Adhigana prapti.png',
      vibrate:            notifType === 'kas' ? [200,100,200,100,200] : [200,100,200],
      requireInteraction: true,
      tag:                'adhigana-' + notifType + '-' + Date.now(),
      data:               { url: '/', type: notifType }
    }
  );
});

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS).catch(() => console.warn('Some assets failed to cache')))
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
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  // Skip Firebase/Google APIs
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

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  
  const url = e.notification.data?.url || '/';
  
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Cari tab yang sudah terbuka
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          return c.focus();
        }
      }
      // Buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── MESSAGE ───────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'CHECK_READY') {
    e.source?.postMessage({ type: 'SW_READY' });
  }
});// ── MESSAGE ───────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'CHECK_READY') {
    e.source?.postMessage({ type: 'SW_READY' });
  }
});
