// This event runs when the service worker is installed for the first time
self.addEventListener('install', event => {
  event.waitUntil(
    // We open (or create) a cache named 'static-v1'
    caches.open('static-v1').then(cache => {
      // We add all the important files that we want to cache for offline use
      return cache.addAll([                     
        '/pages/Menu.html',
        '/pages/Maze.html',
        '/pages/offline.html',     
        '/styles.css',             
        '/assets/TiltingMaze.svg',
        '/main.js',
        '/node_modules/matter-js/build/matter.min.js',
      ]);
    })
  );
});

// This event runs every time a request is made (HTML, CSS, image, etc.)
self.addEventListener('fetch', event => {
  event.respondWith(
    // First, try to find the request in the cache
    caches.match(event.request).then(cached => {
      // If found, return it from the cache
      // If not, try to fetch it from the network
      // If that fails (e.g., offline), show the offline page
      return cached || fetch(event.request)
        .catch(() => caches.match('/pages/offline.html'));
    })
  );
});
