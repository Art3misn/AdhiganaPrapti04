// service-worker.js
const CACHE_NAME = 'adhigana-cache-v1.0.1'; // ← Ubah versi setiap update

const urlsToCache = [
  '/',
  '/index.html',
  '/Login.html',
  '/portal.html',
  '/style.css',
  '/app.js',
  '/firebase.js',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting(); // Force activate
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim(); // Claim all clients
    })
  );
});

// Fetch dengan network-first untuk data terbaru
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Jika fetch berhasil, update cache
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(function() {
        // Jika offline, ambil dari cache
        return caches.match(event.request);
      })
  );
});
