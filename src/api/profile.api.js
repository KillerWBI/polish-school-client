import client from './client'

// PUT /users/me/profile — обновить свой профиль (avatar, bio, socials, languages, username, name)
export const updateMyProfile = async (payload) => {
  const { data } = await client.put('/users/me/profile', payload)
  return data.data
}
