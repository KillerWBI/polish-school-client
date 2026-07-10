import client from './client'

// Личный журнал внешних/самостоятельных занятий ученика.
export const getMyLessons = async (params = {}) => {
  const { data } = await client.get('/my-lessons', { params })
  return data.data
}

export const getMyLessonsStats = async (signal) => {
  const { data } = await client.get('/my-lessons/stats', { signal })
  return data.data
}

export const createMyLesson = async (payload) => {
  const { data } = await client.post('/my-lessons', payload)
  return data.data
}

export const updateMyLesson = async (id, payload) => {
  const { data } = await client.put(`/my-lessons/${id}`, payload)
  return data.data
}

export const payMyLesson = async (id) => {
  const { data } = await client.patch(`/my-lessons/${id}/pay`)
  return data.data
}

export const deleteMyLesson = async (id) => {
  const { data } = await client.delete(`/my-lessons/${id}`)
  return data.data
}
