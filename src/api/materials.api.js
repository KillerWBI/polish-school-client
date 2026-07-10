import client from './client'

// Все материалы уроков пользователя (role-switch на сервере).
export const getMaterials = async (signal) => {
  const { data } = await client.get('/materials', { signal })
  return data.data
}
