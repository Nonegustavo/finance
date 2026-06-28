/* Service Worker — Controle Financeiro
   Opcional. Coloque este arquivo na MESMA pasta do financas.html (ex.: no GitHub Pages).
   Ele guarda o app em cache para abrir mesmo sem internet, igual ao app de treino.
   Os recursos do Google Drive não funcionam offline (precisam de rede), o que é esperado. */
const CACHE = "financas-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Não intercepta chamadas ao Google (Drive/login): deixa ir direto à rede.
  const url = new URL(req.url);
  if (url.hostname.indexOf("google") !== -1 || url.hostname.indexOf("gstatic") !== -1) return;

  // Estratégia: cache primeiro, atualiza em segundo plano (stale-while-revalidate).
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
