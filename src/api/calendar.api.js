import client from './client'

// GET /calendar/subscription — ссылка подписки (создаётся при первом обращении)
export const getCalendarSubscription = async (signal) => {
  const { data } = await client.get('/calendar/subscription', { signal })
  return data.data
}

// POST /calendar/subscription/reset — выпустить новую ссылку, старая перестаёт работать
export const resetCalendarSubscription = async () => {
  const { data } = await client.post('/calendar/subscription/reset')
  return data.data
}
