const CACHE_NAME = 'grimoire-ak-v2';
const ASSETS = [
  '/grimoire-AK/',
  '/grimoire-AK/index.html',
  '/grimoire-AK/icon-192x192.png',
  '/grimoire-AK/icon-512x512.png',
  '/grimoire-AK/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
