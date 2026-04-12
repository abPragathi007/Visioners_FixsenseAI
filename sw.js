/* ═══════════════════════════════════════════════════════════
   SERVICE WORKER — Bike Health AI
   Offline support for emergency screen
   ═══════════════════════════════════════════════════════════ */
const CACHE_NAME = 'bike-health-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/screens.css',
  '/styles/animations.css',
  '/js/state.js',
  '/js/data.js',
  '/js/ai.js',
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

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
