// Service worker van Waarbenje.
// - De app zelf (HTML, JS, iconen) wordt bewaard, zodat ze ook opent bij slecht bereik.
// - Verzoeken naar Supabase gaan altijd naar het netwerk: locaties moeten vers zijn.
// Verhoog het versienummer bij wijzigingen: oude caches worden dan bij het activeren gewist.
const CACHE = 'waarbenje-v2';
const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

const save = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Bestanden met een versie-hash in de naam (/_expo/static/...) veranderen nooit: eerst de cache.
  if (url.pathname.startsWith('/_expo/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => save(request, res))));
    return;
  }

  // Al de rest (pagina's, manifest...): eerst het netwerk, zodat je altijd de nieuwste versie krijgt.
  // Zonder verbinding valt de app terug op de bewaarde versie.
  event.respondWith(
    fetch(request)
      .then((res) => save(request, res))
      .catch(() =>
        caches.match(request).then((hit) => hit || (request.mode === 'navigate' ? caches.match('/') : Response.error())),
      ),
  );
});
