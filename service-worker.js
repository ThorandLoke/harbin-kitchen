const CACHE_NAME = 'harbin-kitchen-v36';
const ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/css/theme.css',
  '/css/app.css',
  '/js/menu-data.js',
  '/js/menu.js',
  '/js/discount.js',
  '/js/prep-time.js',
  '/js/cart.js',
  '/js/app.js',
  '/js/admin.js',
  '/data/menu.json',
  '/data/shopbox-mapping.json',
  '/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first, fallback to cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
