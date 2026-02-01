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
        '/styles/global.css',
        '/styles/menu.css',
        '/styles/maze.css',             
        '/assets/TiltingMaze.svg',
        '/libs/matter.min.js',
        '/main.js'
      ]);
    })
  );
});

// This event runs every time a request is made (HTML, CSS, image, etc.)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open('static-v1').then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match('/pages/offline.html'));
    })
  );
});

