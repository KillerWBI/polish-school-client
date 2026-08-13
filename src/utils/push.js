import { getPushKey, savePushSubscription, removePushSubscription } from '../api/push.api'

/**
 * VAPID-ключ приходит с сервера строкой в base64url, а pushManager.subscribe() требует
 * Uint8Array. Просто передать строку нельзя — браузер бросит InvalidCharacterError.
 *
 * base64url отличается от base64 тремя вещами: '-' вместо '+', '_' вместо '/' и
 * отброшенный хвост '='. atob() понимает только классический base64, поэтому
 * восстанавливаем алфавит и padding, а затем раскладываем байты по массиву.
 *
 * На выходе ровно 65 байт: несжатая точка кривой P-256 — маркер 0x04, затем X и Y по 32.
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

// Поддержка push — это три независимые вещи, и на iPhone до 16.4 не было ни одной.
export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

// Устройство Apple разрешает push только установленному на экран «Домой» приложению.
// В обычной вкладке Safari подписка не выдаётся вовсе, поэтому это нужно уметь отличать,
// чтобы объяснить человеку причину, а не показывать пустую ошибку.
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

/**
 * Подписаться. Вызывать ТОЛЬКО из обработчика клика: браузеры отклоняют
 * requestPermission() без пользовательского жеста, а Safari — молча.
 */
export async function subscribeToPush() {
  if (!pushSupported()) throw new Error('unsupported')

  // Разрешение спрашиваем до всего остального: если откажут, дальше идти незачем.
  // 'denied' навсегда — повторный запрос браузер уже не покажет, снимать блокировку
  // человеку придётся руками в настройках сайта.
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error(permission) // denied | default

  const registration = await navigator.serviceWorker.ready

  // Уже подписаны в этом браузере — переиспользуем. Повторный subscribe() с другим
  // ключом бросил бы ошибку, а с тем же вернул бы ту же подписку.
  let sub = await registration.pushManager.getSubscription()
  if (!sub) {
    const { publicKey } = await getPushKey()
    sub = await registration.pushManager.subscribe({
      // Обязателен и обязан быть true: Chrome не выдаёт подписку для «тихих» push.
      // Обещание браузеру, что каждый push станет видимым уведомлением.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  // toJSON() отдаёт ровно ту форму, которую ждёт бэкенд: { endpoint, keys: { p256dh, auth } }
  await savePushSubscription(sub.toJSON())
  return sub
}

/** Отписаться: снимаем и в браузере, и на сервере — иначе он продолжит слать в никуда. */
export async function unsubscribeFromPush() {
  if (!pushSupported()) return
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  if (!sub) return

  // Сервер первым: если сначала снять подписку в браузере, endpoint будет потерян
  // и удалить строку в БД станет нечем — она осталась бы мусором навсегда.
  await removePushSubscription(sub.endpoint).catch(() => {})
  await sub.unsubscribe()
}

/** Подписан ли этот браузер прямо сейчас (для состояния тумблера). */
export async function currentSubscription() {
  if (!pushSupported() || Notification.permission !== 'granted') return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}
