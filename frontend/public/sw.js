/*
 * India Verified — app-shell service worker.
 *
 * Registration is guarded in app/layout.tsx: it never installs inside a
 * Lovable preview host, an iframe, a non-secure origin, or when ?sw=off is
 * present. Bump CACHE whenever the caching rules change so old shells are
 * evicted on activate.
 *
 * Strategy
 *   HTML navigations   → network-first, cached copy then /offline as fallback
 *   /_next/static/*    → cache-first (content-hashed, immutable)
 *   other static GETs  → network-first with cache fallback
 *   API / admin / maps → never touched
 */

const CACHE = 'iv-shell-v2';

// Precache is best-effort: one missing entry must not fail the whole install.
const STATIC_ASSETS = [
  '/offline',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.allSettled(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Allow the page to force an immediate takeover after a deploy.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Never intercept: dynamic Next internals, API traffic, the admin console,
  // sourcemaps, or data payloads.
  if (url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/')) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/admin')) return;
  if (/\.(map|json)$/.test(url.pathname)) return;

  const accept = request.headers.get('Accept') || '';

  // HTML navigations: always try the network so readers get fresh news.
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match('/offline')) ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          );
        }
      })(),
    );
    return;
  }

  // Content-hashed build output is immutable — serve it from cache instantly.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })(),
    );
    return;
  }

  // Everything else (images, fonts, background plates): network-first.
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.status === 304)) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        return cached || new Response('', { status: 503 });
      }
    })(),
  );
});
