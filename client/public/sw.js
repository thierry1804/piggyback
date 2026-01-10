// Piggyback Service Worker - Offline Support
const CACHE_NAME = 'piggyback-v1';
const STATIC_CACHE = 'piggyback-static-v1';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches that don't match current version
              return cacheName.startsWith('piggyback-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== STATIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip external requests (fonts, analytics, etc.)
  if (url.origin !== self.location.origin) {
    // For Google Fonts, try network first, then cache
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.open(CACHE_NAME)
          .then((cache) => {
            return fetch(request)
              .then((response) => {
                if (response.ok) {
                  cache.put(request, response.clone());
                }
                return response;
              })
              .catch(() => {
                return cache.match(request);
              });
          })
      );
    }
    return;
  }

  // For navigation requests (HTML pages), use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the response for offline use
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cache, return the offline page (index.html for SPA)
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images), use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, but also update cache in background
          event.waitUntil(
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, response);
                    });
                }
              })
              .catch(() => {
                // Network failed, but we already have cached version
              })
          );
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache the response for future use
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // Return a fallback for images if needed
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            throw error;
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

console.log('[SW] Service worker script loaded');
