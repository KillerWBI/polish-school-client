import client from './client'

// In-app уведомления пользователя.
export const getNotifications = async (params = {}) => {
  const { data } = await client.get('/notifications', { params })
  return data // { data:[...], meta:{ unreadCount } }
}

export const markNotificationRead = async (id) => {
  const { data } = await client.patch(`/notifications/${id}/read`)
  return data.data
}

export const markAllNotificationsRead = async () => {
  const { data } = await client.patch('/notifications/read-all')
  return data.data
}
