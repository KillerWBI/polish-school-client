// Service worker LinguaFlow — оффлайн-оболочка PWA.
// Стратегии:
//   навигация (страницы SPA) — network-first: всегда тянем свежий HTML (деплой не залипает),
//     оффлайн → отдаём кэшированный index.html;
//   статик same-origin (js/css/иконки, хэшируются Vite) — cache-first;
//   API и всё кросс-доменное (бэкенд, шрифты, Cloudinary) — не трогаем.
const CACHE = 'lf-v1'
const APP_SHELL = '/index.html'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((c) => c.add(APP_SHELL)).catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return   // чужой домен (API/шрифты/Cloudinary)
  if (url.pathname.startsWith('/api')) return        // API не кэшируем

  // Навигация — network-first
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(APP_SHELL)))
    return
  }

  // Статик — cache-first с дозаписью
  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((resp) => {
        if (resp.ok && resp.type === 'basic') {
          const copy = resp.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
        }
        return resp
      }).catch(() => cached),
    ),
  )
})
