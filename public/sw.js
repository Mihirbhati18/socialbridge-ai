const CACHE_NAME = 'socialbridge-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/civic-issues',
        '/globals.css',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for static assets
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for offline reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-civic-issues') {
    event.waitUntil(syncIssues());
  }
});

async function syncIssues() {
  // This is a bit tricky as SW doesn't have direct access to IndexedDB easily without a library
  // or re-implementing the opening logic. 
  // In a real PWA, we'd use Workbox. 
  // For this implementation, we'll assume the frontend will also try to sync when it comes back online.
  console.log('Background sync triggered');
}
