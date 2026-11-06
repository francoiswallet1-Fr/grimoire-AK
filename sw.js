const CACHE = 'grimoire-ak-v9';
const BASE = '/grimoire-AK/';

// Fichiers mis en cache à l'installation (les absents sont ignorés sans bloquer)
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'favicon.ico',
  BASE + 'icon-192x192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(PRECACHE.map(url => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting(); // la nouvelle version prend la main tout de suite
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  const isPage = req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('/');

  if (isPage) {
    // Pages : réseau d'abord (toujours la dernière version), cache si hors ligne
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match(BASE + 'index.html')))
    );
  } else {
    // Autres fichiers (icônes, manifest) : cache d'abord
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
  }
});
