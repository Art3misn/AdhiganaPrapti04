// ============================================================
// SERVICE WORKER — ADHIGANA PRAPTI
// ============================================================

const VERSION = "1.0.1";
const CACHE_NAME = `adhigana-cache-v${VERSION}`;

// ============================================================
// FILE YANG DI-CACHE (minimal untuk offline)
// ============================================================
const FILES = [
  "./",
  "./index.html",
  "./Login.html",
  "./manifest.json",
  "./style.css",
  "./service-worker.js",
  "./firebase.js",
  "./asset/Adhigana prapti.png",
];

// ============================================================
// INSTALL — simpan file ke cache
// ============================================================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching files...");
        return cache.addAll(FILES);
      })
      .then(() => {
        console.log("[SW] All files cached!");
      })
      .catch((err) => {
        console.error("[SW] Cache failed:", err);
      })
  );
});

// ============================================================
// ACTIVATE — bersihkan cache lama
// ============================================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  return self.clients.claim();
});

// ============================================================
// FETCH — Network First, fallback ke cache
// ============================================================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, blob, data, etc.
  if (!request.url.startsWith("http")) return;

  // Skip Firebase endpoints (biar selalu fresh)
  if (request.url.includes("firebase") || 
      request.url.includes("googleapis") ||
      request.url.includes("gstatic.com")) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Try network first
        console.log("[SW] Fetching:", request.url);
        const response = await fetch(request);

        // Cache successful responses
        if (response && response.status === 200) {
          const cloned = response.clone();
          cache.put(request, cloned).catch(() => {});
          console.log("[SW] Cached:", request.url);
        }

        return response;
      } catch (error) {
        // Network failed — try cache
        console.log("[SW] Network failed, trying cache:", request.url);
        const cached = await cache.match(request);

        if (cached) {
          console.log("[SW] Serving from cache:", request.url);
          return cached;
        }

        // If request is HTML and not in cache, return index.html
        if (request.headers.get("accept")?.includes("text/html")) {
          console.log("[SW] Serving fallback index.html");
          return cache.match("/index.html") || cache.match("./index.html");
        }

        // If request is image and not in cache, return placeholder
        if (request.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          console.log("[SW] Serving fallback image");
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1a1e28" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="#8899aa" font-size="16" dy=".3em">🔵</text></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        }

        // Jika semua gagal, return error
        return new Response("Offline - content unavailable", { 
          status: 503, 
          statusText: "Service Unavailable" 
        });
      }
    })()
  );
});

// ============================================================
// PUSH NOTIFICATION (untuk FCM)
// ============================================================
self.addEventListener("push", function(event) {
  console.log("[SW] Push notification received", event);

  let data = {
    title: "ADHIGANA PRAPTI",
    body: "Ada pengumuman baru!",
    icon: "./asset/Adhigana prapti.png",
    badge: "./asset/Adhigana prapti.png",
    tag: "mading-update",
    data: {
      url: "./Login.html"
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.notification?.title || payload.title || data.title,
        body: payload.notification?.body || payload.body || data.body,
        icon: payload.notification?.icon || payload.icon || data.icon,
        badge: payload.notification?.badge || payload.badge || data.badge,
        tag: payload.notification?.tag || payload.tag || data.tag,
        data: payload.data || data.data,
      };
    } catch (e) {
      console.log("[SW] Push payload not JSON, using text:", event.data.text());
      data.body = event.data.text() || data.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: "open",
          title: "Buka Aplikasi"
        }
      ]
    })
  );
});

// ============================================================
// NOTIFICATION CLICK — navigasi ke halaman
// ============================================================
self.addEventListener("notificationclick", function(event) {
  console.log("[SW] Notification clicked", event);

  event.notification.close();

  const url = event.notification.data?.url || "./Login.html";
  const action = event.action;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      // Cek apakah sudah ada tab yang terbuka
      for (const client of clients) {
        if (client.url === url && "focus" in client) {
          await client.focus();
          return;
        }
      }

      // Buka tab baru
      if (self.clients.openWindow) {
        await self.clients.openWindow(url);
      }
    })()
  );
});

// ============================================================
// MESSAGE — untuk komunikasi dari halaman utama
// ============================================================
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      console.log("[SW] Cache cleared");
      event.ports[0]?.postMessage({ success: true });
    });
  }
});

// ============================================================
// LOG - Service Worker siap
// ============================================================
console.log(`[SW] Service Worker v${VERSION} loaded`);
