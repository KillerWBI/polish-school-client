import client from './client'

// In-app уведомления пользователя.
export const getNotifications = async (params = {}) => {
  const { data } = await client.get('/notifications', { params })
  return data // { data:[...], meta:{ unreadCount } }
}

// История событий — всё, включая давно прочитанное (колокольчик отдаёт только свежее)
export const getNotificationHistory = async ({ page = 1, limit = 30 } = {}, signal) => {
  const { data } = await client.get('/notifications/history', { params: { page, limit }, signal })
  return data // { data:[...], meta:{ page, pages, total } }
}

export const markNotificationRead = async (id) => {
  const { data } = await client.patch(`/notifications/${id}/read`)
  return data.data
}

export const markAllNotificationsRead = async () => {
  const { data } = await client.patch('/notifications/read-all')
  return data.data
}
