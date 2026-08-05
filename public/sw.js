const CACHE_NAME = "quotakeeper-v4";
const RUNTIME_CACHE = "quotakeeper-runtime-v4";

// Install event - pre-cache critical pages for offline access
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then(async (cache) => {
        console.log("[ServiceWorker] Pre-caching critical pages");
        // Cache the main pages so the app works offline immediately.
        // Using individual try/catch so one failure doesn't block others.
        const urls = ["/", "/login", "/offline.html"];
        for (const url of urls) {
          try {
            await cache.add(url);
          } catch (e) {
            console.warn("[ServiceWorker] Failed to pre-cache:", url);
          }
        }
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("[ServiceWorker] Removing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network only (no caching, they need live data)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests (HTML pages)
  // Strategy: Network first → serve cached page if offline → offline.html last resort
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/offline.html");
          });
        }),
    );
    return;
  }

  // JS, CSS, images, fonts — Cache first (fast), update in background
  // This is critical for offline: Next.js hashed chunks must be served from cache
  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached immediately if available
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }),
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
