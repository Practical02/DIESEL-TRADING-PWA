const CACHE_NAME = 'sigma-accounts-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/sales',
  '/invoices',
  '/payments',
  '/clients',
  '/projects',
  '/stock',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
}); 