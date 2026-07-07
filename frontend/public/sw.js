const CACHE = 'zenith-v1';
const STATIC_ASSETS = [
  '/offline',
  '/favicon.svg',
  '/apple-touch-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Don't cache Next.js internal routes or API
  if (url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/')) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) return;
  if (url.pathname.match(/\.(map|json)$/)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful non-API responses
        if (response.ok || response.status === 304) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.headers.get('Accept')?.includes('text/html')) {
            return caches.match('/offline');
          }
          return new Response('', { status: 503 });
        });
      }),
  );
});
