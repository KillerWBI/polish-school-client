import client from './client'

// PUT /users/me/profile — обновить свой профиль (avatar, bio, socials, languages, username, name)
export const updateMyProfile = async (payload) => {
  const { data } = await client.put('/users/me/profile', payload)
  return data.data
}

// GET /users/@:username/profile — публичный профиль любого пользователя
export const getPublicProfile = async (username) => {
  const { data } = await client.get(`/users/@${username}/profile`)
  return data.data
}
