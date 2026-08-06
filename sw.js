// WM Weekly Inventory - service worker
//
// IMPORTANT: bump CACHE every time you upload a changed index.html,
// or phones will keep serving the old build from cache.
const CACHE = "wm-inv-v2.4";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install: pre-cache everything the app needs to run with no signal.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: throw away caches from older versions.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first so the app opens instantly and offline.
// Fall back to the network, and refresh the cached copy when online.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((hit) => {
      const live = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => hit);

      return hit || live;
    })
  );
});
