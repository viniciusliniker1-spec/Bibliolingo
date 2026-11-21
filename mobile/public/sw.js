// A versão anterior do site (Vite/PWA) registrou um service worker neste mesmo endereço.
// Este arquivo o substitui por um que só limpa os caches antigos e se remove, para quem já
// visitou o site abrir o app novo sem ficar preso ao antigo. A versão antiga continua em /legacy/.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (error) { /* sem cache para limpar */ }
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: "window" });
    windows.forEach((client) => { try { client.navigate(client.url); } catch (error) { /* aba fechada */ } });
  })());
});
