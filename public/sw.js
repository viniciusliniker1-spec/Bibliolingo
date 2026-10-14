const CACHE = "bibliolingo-shell-v20";
const APP_SHELL = ["./","./index.html","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-512-maskable.png","./apple-touch-icon.png","./data/bible/Gen.json","./data/bible/Exod.json","./data/bible/Lev.json","./data/bible/Num.json","./data/bible/Deut.json","./data/bible/Josh.json","./data/bible/Judg.json","./data/bible/Ruth.json","./data/bible/1Sam.json","./data/bible/2Sam.json","./data/bible/1Kgs.json","./data/bible/2Kgs.json","./data/bible/1Chr.json","./data/bible/2Chr.json","./data/bible/Ezra.json","./data/bible/Neh.json","./data/bible/Esth.json","./data/bible/Job.json","./data/bible/Ps.json","./data/bible/Prov.json","./data/bible/Eccl.json","./data/bible/Song.json","./data/bible/Isa.json","./data/bible/Jer.json","./data/bible/Lam.json","./data/bible/Ezek.json","./data/bible/Dan.json","./data/bible/Hos.json","./data/bible/Joel.json","./data/bible/Amos.json","./data/bible/Obad.json","./data/bible/Jonah.json","./data/bible/Mic.json","./data/bible/Nah.json","./data/bible/Hab.json","./data/bible/Zeph.json","./data/bible/Hag.json","./data/bible/Zech.json","./data/bible/Mal.json","./data/bible/Matt.json","./data/bible/Mark.json","./data/bible/Luke.json","./data/bible/John.json","./data/bible/Acts.json","./data/bible/Rom.json","./data/bible/1Cor.json","./data/bible/2Cor.json","./data/bible/Gal.json","./data/bible/Eph.json","./data/bible/Phil.json","./data/bible/Col.json","./data/bible/1Thess.json","./data/bible/2Thess.json","./data/bible/1Tim.json","./data/bible/2Tim.json","./data/bible/Titus.json","./data/bible/Phlm.json","./data/bible/Heb.json","./data/bible/Jas.json","./data/bible/1Pet.json","./data/bible/2Pet.json","./data/bible/1John.json","./data/bible/2John.json","./data/bible/3John.json","./data/bible/Jude.json","./data/bible/Rev.json","./data/greek/MT.UTR","./data/greek/MR.UTR","./data/greek/LU.UTR","./data/greek/JOH.UTR","./data/greek/AC.UTR","./data/greek/RO.UTR","./data/greek/1CO.UTR","./data/greek/2CO.UTR","./data/greek/GA.UTR","./data/greek/EPH.UTR","./data/greek/PHP.UTR","./data/greek/COL.UTR","./data/greek/1TH.UTR","./data/greek/2TH.UTR","./data/greek/1TI.UTR","./data/greek/2TI.UTR","./data/greek/TIT.UTR","./data/greek/PHM.UTR","./data/greek/HEB.UTR","./data/greek/JAS.UTR","./data/greek/1PE.UTR","./data/greek/2PE.UTR","./data/greek/1JO.UTR","./data/greek/2JO.UTR","./data/greek/3JO.UTR","./data/greek/JUDE.UTR","./data/greek/RE.UTR"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
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
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const url = new URL(event.request.url);
        const trustedLexiconSource =
          url.hostname === "raw.githubusercontent.com" &&
          url.pathname.includes("/biblicalhumanities/Dodson-Greek-Lexicon/");
        if (response.ok && (url.origin === self.location.origin || trustedLexiconSource)) {
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
