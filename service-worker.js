const CACHE_NAME = 'harbin-kitchen-v46';
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

// Fetch – network-first, fallback to cache (With Safety Guards)
self.addEventListener('fetch', (e) => {
    // 1. Guard: Only intercept standard HTTP/HTTPS GET requests
    if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
        return; // Let the browser handle POST, HEAD, and extensions normally
    }

    // 2. Guard: Explicitly bypass Google Tag Manager & Facebook Pixel
    if (e.request.url.includes('googletagmanager.com') || e.request.url.includes('connect.facebook.net')) {
        return; // Bypass service worker completely for tracking scripts
    }

    e.respondWith(
        fetch(e.request)
        .then((response) => {
            // 3. Guard: Only cache successful, standard web responses
            if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, clone).catch(err => {
                        console.warn('Cache put skipped for:', e.request.url, err.message);
                    });
                });
            }
            return response;
        })
        .catch(() => caches.match(e.request))
    );
});
