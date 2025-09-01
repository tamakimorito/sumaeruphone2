const CACHE_NAME = 'sma-phone-cache-v1';

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: network-first, then cache fallback.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // If fetch is successful, cache the response and return it
      return caches.open(CACHE_NAME).then(cache => {
        // Don't cache the Google Sheet data to avoid stale info
        if (!event.request.url.includes('docs.google.com')) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      });
    }).catch(() => {
      // If fetch fails (offline), try to get it from the cache
      return caches.match(event.request);
    })
  );
});
