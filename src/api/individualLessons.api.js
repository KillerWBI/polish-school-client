import client from './client'

export const getIndividualLessons = async (params = {}) => {
  const { data } = await client.get('/individual-lessons', { params })
  return data.data
}

export const getIndividualLesson = async (id) => {
  const { data } = await client.get(`/individual-lessons/${id}`)
  return data.data
}

export const createIndividualLesson = async (body) => {
  const { data } = await client.post('/individual-lessons', body)
  return data.data
}

export const updateIndividualLesson = async (id, body) => {
  const { data } = await client.put(`/individual-lessons/${id}`, body)
  return data.data
}

export const deleteIndividualLesson = async (id) => {
  const { data } = await client.delete(`/individual-lessons/${id}`)
  return data.data
}
