import client from './client'

// GET /push/key — публичный VAPID-ключ. Держим на сервере, а не в сборке фронта:
// перевыпуск пары ключей тогда не требует пересборки и редеплоя.
export const getPushKey = async () => {
  const { data } = await client.get('/push/key')
  return data.data
}

// GET /push/status — включён ли push на сервере и сколько устройств подписано
export const getPushStatus = async () => {
  const { data } = await client.get('/push/status')
  return data.data
}

// POST /push/subscribe — тело это результат PushSubscription.toJSON()
export const savePushSubscription = async (subscription) => {
  const { data } = await client.post('/push/subscribe', subscription)
  return data.data
}

// DELETE /push/subscribe — удаляем по endpoint: фронт знает его от браузера,
// а id строки в БД ему неизвестен.
export const removePushSubscription = async (endpoint) => {
  const { data } = await client.delete('/push/subscribe', { data: { endpoint } })
  return data.data
}
