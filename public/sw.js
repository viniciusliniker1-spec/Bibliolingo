// Os dois marcadores abaixo são substituídos no build (vite.config.ts).
const BUILD_ID = "dev";
const PRECACHE_ASSETS = [];

const CACHE_PREFIX = "bibliolingo-shell-";
const CACHE = CACHE_PREFIX + BUILD_ID;
// Livros bíblicos e léxico grego visitados não mudam entre deploys:
// ficam em um cache próprio para sobreviver às atualizações do app.
const DATA_CACHE = "bibliolingo-data-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

function isTrustedExternalData(url) {
  if (url.hostname !== "raw.githubusercontent.com") return false;
  return (
    url.pathname.includes("/midvash/bible-data/") ||
    url.pathname.includes("/biblicalhumanities/Dodson-Greek-Lexicon/") ||
    url.pathname.includes("/byztxt/greektext-textus-receptus/")
  );
}

async function moveExternalDataFrom(cacheName) {
  const oldCache = await caches.open(cacheName);
  const dataCache = await caches.open(DATA_CACHE);
  const requests = await oldCache.keys();
  await Promise.all(
    requests
      .filter((request) => isTrustedExternalData(new URL(request.url)))
      .map(async (request) => {
        const response = await oldCache.match(request);
        if (response) await dataCache.put(request, response);
      })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...APP_SHELL, ...PRECACHE_ASSETS])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map(async (key) => {
            await moveExternalDataFrom(key);
            await caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    // ignoreVary: requisições de módulos enviam Origin; os arquivos têm hash no nome,
    // então a resposta em cache é válida independentemente desse cabeçalho.
    caches.match(event.request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const url = new URL(event.request.url);
        if (response.ok && isTrustedExternalData(url)) {
          const copy = response.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(event.request, copy));
        } else if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL("./#/", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          if ("navigate" in client) await client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
