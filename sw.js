const CACHE = 'ptg-games-v4';
const ASSETS = [
  './',
  './index.html',
  './sw.js',
  './manifest.json',
  './Clutch_Mot_Logo.png',
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Active immédiatement sans attendre la fermeture des onglets
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prend le contrôle de tous les onglets ouverts
  );
});

// Notifier tous les onglets qu'une nouvelle version est disponible
self.addEventListener('activate', () => {
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
  });
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && res.status !== 206) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
