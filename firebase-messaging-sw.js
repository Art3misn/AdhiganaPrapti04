// ============================================================
// FIREBASE MESSAGING SERVICE WORKER - ADHIGANA PRAPTI
// NOTIFIKASI TEMBUS KE SEMUA DEVICE (TERMASUK HP DIMATIKAN)
// ============================================================

// ═══════════════════════════════════════════════════════════════
// IMPORTS - FIREBASE SDK
// ═══════════════════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ═══════════════════════════════════════════════════════════════
// FIREBASE CONFIG
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "AIzaSyATh7MiV8xr4vHgF3AjqMhXc87LhCRF7N0",
  authDomain:        "adhiganaprapti-e8f13.firebaseapp.com",
  projectId:         "adhiganaprapti-e8f13",
  storageBucket:     "adhiganaprapti-e8f13.firebasestorage.app",
  messagingSenderId: "1011133018564",
  appId:             "1:1011133018564:web:57e9537b39c85a44593491"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ═══════════════════════════════════════════════════════════════
// VERSI & CACHE
// ═══════════════════════════════════════════════════════════════
const VERSION = 'v5.0';
const CACHE_NAME = `adhigana-${VERSION}`;
const ASSETS = [
  '/',
  '/index.html',
  '/Login.html',
  '/manifest.json',
  '/asset/Adhigana prapti.png',
  '/asset/Avatar.png',
  '/notif-sound.mp3'
];

// ═══════════════════════════════════════════════════════════════
// INSTALL - PRE-CACHE ASSETS
// ═══════════════════════════════════════════════════════════════
self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching assets...');
        return cache.addAll(ASSETS).catch(function(err) {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      })
      .then(function() {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// ACTIVATE - CLEAN OLD CACHES
// ═══════════════════════════════════════════════════════════════
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('adhigana-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// FETCH - NETWORK FIRST, CACHE FALLBACK
// ═══════════════════════════════════════════════════════════════
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Skip Firebase & Google APIs
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') || 
      url.hostname.includes('gstatic') ||
      url.hostname.includes('fonts.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, clone);
            });
        }
        return response;
      })
      .catch(function() {
        // Fallback to cache
        return caches.match(event.request)
          .then(function(cached) {
            if (cached) return cached;
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// BACKGROUND MESSAGE - PUSH NOTIFICATION (DARI FCM)
// ═══════════════════════════════════════════════════════════════
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] 📨 Background message received:', payload);
  
  // Ekstrak data dari payload
  const data = payload.data || payload.notification || {};
  const title = data.title || '📢 Adhigana Prapti';
  const body = data.body || 'Ada notifikasi baru';
  const type = data.type || 'info';
  const sound = data.sound !== 'false';
  
  // Map icon berdasarkan type
  const iconMap = {
    kas:     '💰',
    mading:  '📰', 
    absensi: '📋',
    aspirasi: '💬',
    info:    '🔔'
  };
  const icon = iconMap[type] || '🔔';
  
  // Notifikasi options
  const options = {
    body: body,
    icon: '/asset/Adhigana prapti.png',
    badge: '/asset/Adhigana prapti.png',
    vibrate: type === 'kas' ? [200, 100, 200, 100, 300] : [200, 100, 200],
    requireInteraction: true,
    silent: !sound,
    tag: `adhigana-${type}-${Date.now()}`,
    data: {
      url: data.url || '/',
      type: type,
      title: title,
      body: body
    },
    actions: [
      {
        action: 'open',
        title: '📖 Buka',
        icon: '/asset/Adhigana prapti.png'
      },
      {
        action: 'dismiss',
        title: '❌ Tutup'
      }
    ]
  };
  
  // Tampilkan notifikasi
  return self.registration.showNotification(`${icon} ${title}`, options)
    .then(function() {
      console.log('[SW] ✅ Notification shown:', title);
    })
    .catch(function(err) {
      console.warn('[SW] Notification failed:', err);
    });
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION CLICK - HANDLE USER ACTION
// ═══════════════════════════════════════════════════════════════
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const urlToOpen = data.url || '/';
  
  // Close notification
  notification.close();
  
  // Handle action
  if (action === 'dismiss') {
    return;
  }
  
  // Open or focus window
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(windowClients) {
      // Cari tab yang sudah terbuka
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Buka tab baru jika tidak ada
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
    .then(function(client) {
      // Kirim data notifikasi ke client
      if (client) {
        client.postMessage({
          type: 'NOTIFICATION_OPENED',
          data: data
        });
      }
    })
  );
});

// ═══════════════════════════════════════════════════════════════
// PUSH EVENT - LANGSUNG DARI PUSH SERVER (tanpa FCM payload)
// ═══════════════════════════════════════════════════════════════
self.addEventListener('push', function(event) {
  console.log('[SW] 📨 Push event received');
  
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.warn('[SW] Push data parse error:', err);
    data = {
      title: '📢 Adhigana Prapti',
      body: 'Ada notifikasi baru',
      type: 'info'
    };
  }
  
  const title = data.title || '📢 Adhigana Prapti';
  const body = data.body || 'Ada notifikasi baru';
  const type = data.type || 'info';
  
  const options = {
    body: body,
    icon: '/asset/Adhigana prapti.png',
    badge: '/asset/Adhigana prapti.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: `adhigana-${type}-${Date.now()}`,
    data: {
      url: data.url || '/',
      type: type
    },
    actions: [
      {
        action: 'open',
        title: '📖 Buka'
      },
      {
        action: 'dismiss', 
        title: '❌ Tutup'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE FROM CLIENT - FOREGROUND COMMUNICATION
// ═══════════════════════════════════════════════════════════════
self.addEventListener('message', function(event) {
  console.log('[SW] Message from client:', event.data);
  
  const data = event.data || {};
  
  // Handle berbagai tipe pesan
  switch (data.type) {
    case 'CHECK_READY':
      event.source?.postMessage({
        type: 'SW_READY',
        version: VERSION,
        timestamp: Date.now()
      });
      break;
      
    case 'SHOW_NOTIFICATION':
      if (data.title && data.body) {
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: '/asset/Adhigana prapti.png',
          badge: '/asset/Adhigana prapti.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: 'adhigana-client-' + Date.now(),
          data: {
            url: data.url || '/',
            type: data.type || 'info'
          }
        });
      }
      break;
      
    case 'GET_VERSION':
      event.source?.postMessage({
        type: 'VERSION_INFO',
        version: VERSION,
        timestamp: Date.now()
      });
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    default:
      console.log('[SW] Unknown message type:', data.type);
  }
});

// ═══════════════════════════════════════════════════════════════
// PERIODIC SYNC - UPDATE CACHE (jika didukung)
// ═══════════════════════════════════════════════════════════════
self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'update-cache') {
    console.log('[SW] Periodic sync triggered');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(ASSETS).catch(function(err) {
            console.warn('[SW] Periodic sync failed:', err);
          });
        })
    );
  }
});

// ═══════════════════════════════════════════════════════════════
// ONLINE/OFFLINE STATUS
// ═══════════════════════════════════════════════════════════════
self.addEventListener('online', function() {
  console.log('[SW] Online');
  // Broadcast ke semua client
  clients.matchAll().then(function(clientList) {
    clientList.forEach(function(client) {
      client.postMessage({
        type: 'ONLINE_STATUS',
        status: 'online',
        timestamp: Date.now()
      });
    });
  });
});

self.addEventListener('offline', function() {
  console.log('[SW] Offline');
  clients.matchAll().then(function(clientList) {
    clientList.forEach(function(client) {
      client.postMessage({
        type: 'ONLINE_STATUS',
        status: 'offline',
        timestamp: Date.now()
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════
self.addEventListener('error', function(event) {
  console.error('[SW] Error:', event.error || event.message);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] Unhandled rejection:', event.reason);
});

// ═══════════════════════════════════════════════════════════════
// LOG READY
// ═══════════════════════════════════════════════════════════════
console.log(`[SW] ✅ Adhigana Prapti Service Worker ${VERSION} active`);
console.log('[SW] 🔔 Push notifications ready!');