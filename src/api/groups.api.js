import client from './client'

export const getGroups = async (signal) => {
  const { data } = await client.get('/groups', { signal })
  return data.data
}

export const getGroup = async (id) => {
  const { data } = await client.get(`/groups/${id}`)
  return data.data
}

export const createGroup = async (body) => {
  const { data } = await client.post('/groups', body)
  return data.data
}

export const updateGroup = async (id, body) => {
  const { data } = await client.put(`/groups/${id}`, body)
  return data.data
}

export const deleteGroup = async (id) => {
  const { data } = await client.delete(`/groups/${id}`)
  return data.data
}

export const addStudent = async (groupId, studentId) => {
  const { data } = await client.post(`/groups/${groupId}/students`, { studentId })
  return data.data
}

// Добавить заглушку — ученика без аккаунта (только для учителя)
export const addPlaceholder = async (groupId, { name, contact }) => {
  const { data } = await client.post(`/groups/${groupId}/placeholder`, { name, contact })
  return data.data
}

export const removeStudent = async (groupId, studentId) => {
  const { data } = await client.delete(`/groups/${groupId}/students/${studentId}`)
  return data.data
}

export const generateLessons = async (groupId, from, to) => {
  const { data } = await client.post(`/groups/${groupId}/generate-lessons`, { from, to })
  return data.data
}
