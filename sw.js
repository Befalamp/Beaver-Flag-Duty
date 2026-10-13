const CACHE_NAME = 'flag-duty-v4';
const CACHE_FILES = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests (leave Firebase, sign-in and
  // font requests entirely alone).
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never let the service worker handle the page itself — always let the
  // browser fetch it fresh, so code updates show up immediately with no
  // waiting on the service worker's own update cycle.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    return;
  }

  // Network-first for everything else (manifest, icons); fall back to
  // cache only when offline.
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
