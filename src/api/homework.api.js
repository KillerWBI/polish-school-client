import client from './client'

export const getHomework = async (params = {}) => {
  const { data } = await client.get('/homework', { params })
  return data.data
}

export const getHomeworkById = async (id) => {
  const { data } = await client.get(`/homework/${id}`)
  return data.data
}

export const createHomework = async (body) => {
  const { data } = await client.post('/homework', body)
  return data.data
}

export const updateHomework = async (id, body) => {
  const { data } = await client.put(`/homework/${id}`, body)
  return data.data
}

export const deleteHomework = async (id) => {
  const { data } = await client.delete(`/homework/${id}`)
  return data.data
}

// Студент сдаёт ДЗ. fileUrl — URL из Cloudinary (или null для пустой сдачи).
export const submitHomework = async (id, { fileUrl, comment }) => {
  const { data } = await client.post(`/homework/${id}/submit`, { fileUrl, comment })
  return data.data
}

export const getSubmissions = async (homeworkId) => {
  const { data } = await client.get(`/homework/${homeworkId}/submissions`)
  return data.data
}

export const gradeSubmission = async (homeworkId, subId, grade) => {
  const { data } = await client.put(`/homework/${homeworkId}/submissions/${subId}`, { grade })
  return data.data
}
