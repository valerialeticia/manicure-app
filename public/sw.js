// Service worker do Agenda Manicure.
// Troque a versão sempre que mudar a lista de arquivos pré-carregados.
const CACHE_NAME = 'agenda-manicure-v1';
const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function saveInCache(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Páginas: tenta a rede primeiro (conteúdo atualizado) e usa o cache quando estiver offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => saveInCache(request, response))
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  // Arquivos estáticos (JS, CSS, ícones): usa o cache primeiro, pois têm nomes versionados.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => saveInCache(request, response))),
  );
});
