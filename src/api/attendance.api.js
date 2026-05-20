import client from './client'

export const getAttendance = async (params = {}) => {
  const { data } = await client.get('/attendance', { params })
  return data.data
}

export const saveAttendance = async (lessonId, records, individualLessonId = null) => {
  const body = { records }
  if (lessonId)           body.lessonId           = lessonId
  if (individualLessonId) body.individualLessonId = individualLessonId
  const { data } = await client.post('/attendance', body)
  return data.data
}

export const updateAttendance = async (id, present) => {
  const { data } = await client.put(`/attendance/${id}`, { present })
  return data.data
}
