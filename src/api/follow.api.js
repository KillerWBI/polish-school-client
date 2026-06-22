import client from './client'

// POST /users/:id/follow — подписаться
export const followUser = async (id) => {
  const { data } = await client.post(`/users/${id}/follow`)
  return data.data
}

// DELETE /users/:id/follow — отписаться
export const unfollowUser = async (id) => {
  const { data } = await client.delete(`/users/${id}/follow`)
  return data.data
}
