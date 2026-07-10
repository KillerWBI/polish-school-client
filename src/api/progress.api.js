import client from './client'

// Прогресс-центр ученика: streak, активность по дням, словарь, внешние занятия.
export const getMyProgress = async (signal) => {
  const { data } = await client.get('/students/me/progress', { signal })
  return data.data
}
