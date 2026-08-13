// Service worker Peravenor — оффлайн-оболочка PWA.
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

// ── Push-уведомления ────────────────────────────────────────────────────────
// Событие приходит, даже когда вкладка закрыта — service worker будит push-сервис.
self.addEventListener('push', (event) => {
  // Данных может не быть вовсе: спецификация позволяет push без тела.
  let payload
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {} // не JSON — не повод промолчать, см. ниже
  }

  const title = payload.title || 'Peravenor'
  const options = {
    body: payload.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',           // монохромный значок в статус-баре Android
    data: { link: payload.link || '/' },
    // tag схлопывает уведомления одного типа: пять оценок подряд покажутся одной
    // строкой, а не пятью. Без него экран телефона превращается в ленту.
    tag: payload.type || 'peravenor',
    renotify: true,               // но звук/вибрация всё же срабатывают при замене
  }

  // Показать уведомление ОБЯЗАТЕЛЬНО. Если промолчать, Chrome через несколько тихих
  // push сам покажет «Этот сайт обновлён в фоновом режиме», а затем может отозвать
  // разрешение. Поэтому showNotification вызывается и когда тело не разобралось.
  //
  // waitUntil продлевает жизнь service worker до конца промиса: без него браузер
  // вправе усыпить воркер сразу после обработчика, и уведомление не успеет появиться.
  event.waitUntil(self.registration.showNotification(title, options))
})

// Клик по уведомлению: не открываем новую вкладку, если приложение уже открыто.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/'
  const target = new URL(link, self.location.origin).href

  event.waitUntil(
    // includeUncontrolled: true — важно. Вкладка, открытая до установки этого воркера,
    // им не управляется, и без флага она в список не попадёт: человек увидел бы вторую
    // копию приложения вместо перехода в уже открытой.
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === target && 'focus' in client) return client.focus()
      }
      // Приложение открыто, но на другой странице — переводим её, а не плодим вкладки
      const open = list.find((c) => c.url.startsWith(self.location.origin))
      if (open && 'navigate' in open) return open.navigate(target).then((c) => c && c.focus())
      return self.clients.openWindow(target)
    }),
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
