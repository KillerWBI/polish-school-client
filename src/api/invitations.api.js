import client from './client'

// GET /users/search?username= — учитель ищет студента по точному нику (для приглашения).
// Возвращает { id, name, username, avatar, alreadyMine } или кидает 404.
export const searchStudent = async (username) => {
  const { data } = await client.get('/users/search', { params: { username } })
  return data.data
}

// POST /groups/:id/invitations — пригласить студента (по User.id) в группу.
// Если ученик уже свой — бэк добавит напрямую и вернёт { directAdd: true }.
export const inviteToGroup = async (groupId, inviteeUserId) => {
  const { data } = await client.post(`/groups/${groupId}/invitations`, { inviteeUserId })
  return data.data
}

// GET /invitations — список приглашений (роль-свитч на бэке); опциональный фильтр по статусу.
export const getInvitations = async (status) => {
  const { data } = await client.get('/invitations', { params: status ? { status } : {} })
  return data.data
}

// PATCH /invitations/:id — студент принимает (accepted) или отклоняет (declined).
export const respondInvitation = async (id, status) => {
  const { data } = await client.patch(`/invitations/${id}`, { status })
  return data.data
}
