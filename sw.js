// Service worker: guarda la app en caché para que funcione sin internet.
// Al cambiar cualquier archivo, sube CACHE_VERSION para que los iPhones descarguen la nueva versión.
const CACHE_VERSION = 'eto-toolkit-v3.1.1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/ui.js',
  './js/speech.js',
  './js/themes.js',
  './js/lookup.js',
  './js/game-state.js',
  './js/components.js',
  './js/modules/interviews.js',
  './js/modules/glossary.js',
  './js/modules/game.js',
  './js/modules/faults.js',
  './js/modules/guide.js',
  './js/modules/mock.js',
  './js/modules/english.js',
  './js/data/questions.js',
  './js/data/questions-extra.js',
  './js/data/questions-cv.js',
  './js/data/glossary.js',
  './js/data/glossary-extra.js',
  './js/data/faults.js',
  './js/data/diagrams.js',
  './js/data/english.js',
  './js/data/dictionary.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // cache: 'reload' evita copiar archivos viejos de la caché HTTP del navegador.
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: responde desde caché y, si no está, va a la red y lo guarda.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
