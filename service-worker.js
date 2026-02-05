const CACHE_NAME = 'static-v1';
const urlsToCache = [
  '/index.html',
  '/pages/Maze.html',
  '/pages/offline.html',
  '/styles/global.css',
  '/styles/menu.css',
  '/styles/maze.css',
  '/assets/TiltingMaze.svg',
  '/libs/matter.min.js',
  '/main.js',
  '/static/manifest.json'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Ignore non-http(s) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ignore POST requests and other non-GET methods
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Only cache same-origin requests
          const responseUrl = new URL(response.url);
          if (responseUrl.origin !== location.origin) {
            return response;
          }

          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Only show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/pages/offline.html');
          }
        });
    })
  );
});
