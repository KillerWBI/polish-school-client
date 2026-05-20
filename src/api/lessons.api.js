import client from './client'

export const getLessons = async (params = {}) => {
  const { data } = await client.get('/lessons', { params })
  return data.data
}

export const getLesson = async (id) => {
  const { data } = await client.get(`/lessons/${id}`)
  return data.data
}

export const createLesson = async (body) => {
  const { data } = await client.post('/lessons', body)
  return data.data
}

export const updateLesson = async (id, body) => {
  const { data } = await client.put(`/lessons/${id}`, body)
  return data.data
}

export const deleteLesson = async (id) => {
  const { data } = await client.delete(`/lessons/${id}`)
  return data.data
}
