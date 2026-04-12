/* ═══════════════════════════════════════════════════════════
   SERVICE WORKER — Bike Health AI
   Offline support for emergency screen
   ═══════════════════════════════════════════════════════════ */
const CACHE_NAME = 'bike-health-ai-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/screens.css',
  '/styles/animations.css',
  '/styles/responsive.css',
  '/js/state.js',
  '/js/data.js',
  '/js/ai.js',
  '/js/components/aiChat.js',
  '/js/app.js',
  '/js/screens/splash.js',
  '/js/screens/home.js',
  '/js/screens/addVehicle.js',
  '/js/screens/diagnose.js',
  '/js/screens/loading.js',
  '/js/screens/results.js',
  '/js/screens/history.js',
  '/js/screens/tips.js',
  '/js/screens/profile.js',
  '/js/screens/emergency.js',
  '/js/screens/pretrip.js',
  '/js/screens/fleet.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppAsset = isSameOrigin && (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  );

  if (isAppAsset) {
    // Network first keeps app shell fresh while still supporting offline fallback.
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for non-critical/static requests.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
