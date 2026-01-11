// Piggyback Service Worker - Offline Support
const CACHE_VERSION = 'v2';
const CACHE_NAME = `piggyback-${CACHE_VERSION}`;
const STATIC_CACHE = `piggyback-static-${CACHE_VERSION}`;

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon.svg',
  '/og-image.svg'
];

// File extensions that should always be cached
const CACHEABLE_EXTENSIONS = ['.js', '.css', '.woff', '.woff2', '.png', '.jpg', '.jpeg', '.svg', '.ico'];

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

// Helper: Check if URL should be cached
function shouldCache(url) {
  const pathname = url.pathname;
  // Always cache assets directory (Vite build output)
  if (pathname.startsWith('/assets/')) return true;
  // Cache files with known extensions
  return CACHEABLE_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

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
    // For Google Fonts, try cache first then network (for offline support)
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request)
              .then((response) => {
                if (response.ok) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, responseToCache));
                }
                return response;
              })
              .catch(() => {
                // Return empty response for fonts (app will use fallback fonts)
                return new Response('', { status: 200 });
              });
          })
      );
      return;
    }
    return;
  }

  // For navigation requests (HTML pages), use cache-first for offline, network-first when online
  if (request.mode === 'navigate') {
    event.respondWith(
      // Try cache first for instant loading
      caches.match('/index.html')
        .then((cachedResponse) => {
          // Try to fetch latest version
          const fetchPromise = fetch(request)
            .then((response) => {
              // Cache the response for offline use
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  cache.put('/index.html', responseToCache.clone());
                });
              return response;
            })
            .catch(() => {
              // Network failed, return cached version
              console.log('[SW] Network failed, serving cached index.html');
              return cachedResponse || caches.match('/index.html');
            });

          // Return cached version immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // For Vite assets (/assets/*), use cache-first (they have hashed names)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Not in cache, fetch and cache
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseToCache));
              }
              return response;
            })
            .catch((error) => {
              console.error('[SW] Failed to fetch asset:', url.pathname, error);
              throw error;
            });
        })
    );
    return;
  }

  // For other static assets, use cache-first with background update
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, but also update cache in background if online
          if (navigator.onLine) {
            event.waitUntil(
              fetch(request)
                .then((response) => {
                  if (response.ok) {
                    caches.open(CACHE_NAME)
                      .then((cache) => cache.put(request, response));
                  }
                })
                .catch(() => { /* Ignore network errors in background */ })
            );
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache the response for future use if it's cacheable
            if (response.ok && shouldCache(url)) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseToCache));
            }
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', url.pathname, error);
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
