import client from './client'

export const getGroups = async () => {
  const { data } = await client.get('/groups')
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

export const removeStudent = async (groupId, studentId) => {
  const { data } = await client.delete(`/groups/${groupId}/students/${studentId}`)
  return data.data
}

export const generateLessons = async (groupId, from, to) => {
  const { data } = await client.post(`/groups/${groupId}/generate-lessons`, { from, to })
  return data.data
}
