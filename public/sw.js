// public/sw.js
//
// Service worker for EngineX Mart PWA.
//
// Cache strategy (deliberately conservative — this is a live e-commerce
// site with real-time prices/stock, so we never want a customer to see
// stale data because of overly aggressive caching):
//
//   1. Firebase/Firestore/API calls  → NETWORK ONLY, never cached.
//      Prices, stock counts, and cart totals must always be fresh.
//   2. Static assets (JS/CSS/fonts/images under /_next/static, /icons,
//      /images)                      → CACHE FIRST, falling back to
//      network. These are content-hashed by Next.js, so they're safe
//      to cache aggressively — a new deploy gets new filenames.
//   3. Page navigations              → NETWORK FIRST, falling back to
//      the cached shell (or a minimal offline page) if the network is
//      unavailable. Keeps content fresh when online, still shows
//      *something* when offline.

const CACHE_VERSION = "enginex-mart-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

const OFFLINE_URL = "/offline.html";

// A minimal set of assets to pre-cache on install so the offline
// fallback page itself always works, even on first visit.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("enginex-mart-") && key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Domains/paths that must NEVER be served from cache — anything that
// touches live data (Firebase Auth, Firestore, Storage, or our own
// /api routes).
const NEVER_CACHE_PATTERNS = [
  /firestore\.googleapis\.com/,
  /firebaseinstallations\.googleapis\.com/,
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /firebasestorage\.googleapis\.com/,
  /\/api\//,
];

function shouldBypassCache(url) {
  return NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

function isStaticAsset(url) {
  return (
    url.includes("/_next/static/") ||
    url.includes("/icons/") ||
    url.includes("/images/") ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(new URL(url).pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET — never intercept POST/PUT/DELETE (cart updates,
  // order submissions, etc. must always hit the network directly).
  if (request.method !== "GET") return;

  const url = request.url;

  // 1. Live-data endpoints: always network, no cache involvement at all.
  if (shouldBypassCache(url)) {
    return; // let the browser handle it natively
  }

  // 2. Static, content-hashed assets: cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch (err) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // 3. Page navigations: network-first, falling back to cache, then
  //    to the offline page as a last resort.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(request, response.clone());
          return response;
        } catch (err) {
          const cache = await caches.open(PAGES_CACHE);
          const cachedPage = await cache.match(request);
          return cachedPage || (await caches.match(OFFLINE_URL));
        }
      })()
    );
    return;
  }

  // Everything else: just let the browser fetch normally.
});
