import client from './client'

export const getIndividualCourses = async () => {
  const { data } = await client.get('/individual-courses')
  return data.data
}

export const getIndividualCourse = async (id) => {
  const { data } = await client.get(`/individual-courses/${id}`)
  return data.data
}

export const createIndividualCourse = async (body) => {
  const { data } = await client.post('/individual-courses', body)
  return data.data
}

export const updateIndividualCourse = async (id, body) => {
  const { data } = await client.put(`/individual-courses/${id}`, body)
  return data.data
}

export const deleteIndividualCourse = async (id) => {
  const { data } = await client.delete(`/individual-courses/${id}`)
  return data.data
}

// Генерирует уроки на основе schedule курса в диапазоне [from, to] (YYYY-MM-DD).
export const generateIndividualLessons = async (id, from, to) => {
  const { data } = await client.post(`/individual-courses/${id}/generate-lessons`, { from, to })
  return data.data
}
