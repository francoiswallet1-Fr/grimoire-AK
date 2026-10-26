const CACHE_NAME = 'grimoire-ak-v8';
const ASSETS = [
  '/grimoire-AK/',
  '/grimoire-AK/index.html',
  '/grimoire-AK/icon-192x192.png',
  '/grimoire-AK/icon-512x512.png',
  '/grimoire-AK/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
