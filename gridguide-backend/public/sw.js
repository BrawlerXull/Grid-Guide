/* GridGuide / Brightvale Electric service worker.
 * - Pages: network first, fall back to the last saved copy, then the offline page.
 * - Static build assets and icons: cache first (they are content-hashed).
 * - /api/* and anything cross-origin: never cached (live data and the eGain chat).
 */
const VERSION = "gg-v2";
const SHELL_CACHE = `gridguide-shell-${VERSION}`;
const PAGE_CACHE = `gridguide-pages-${VERSION}`;
const ASSET_CACHE = `gridguide-assets-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/brightvale", "/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const assets = await caches.open(ASSET_CACHE);
      // Cache each page AND the JS/CSS it needs, so it can start without a connection.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const res = await fetch(new Request(url, { cache: "reload" }));
            if (!res.ok) return;
            await cache.put(url, res.clone());
            if ((res.headers.get("content-type") || "").includes("text/html")) {
              const html = await res.text();
              const deps = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]))];
              await Promise.all(deps.map((d) => assets.add(d).catch(() => undefined)));
            }
          } catch {
            /* ignore: one failure must not block installation */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, PAGE_CACHE, ASSET_CACHE]);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("gridguide-") && !keep.has(n)).map((n) => caches.delete(n)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(?:png|svg|ico|webp|woff2?)$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // eGain chat, fonts CDN, etc.
  if (url.pathname.startsWith("/api/")) return; // live data: always network
  if (url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          const res = preload || (await fetch(req));
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        } catch {
          const cached = (await caches.match(url.pathname, { ignoreSearch: true })) || (await caches.match(req, { ignoreSearch: true }));
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const copy = res.clone();
          caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })(),
    );
  }
});
