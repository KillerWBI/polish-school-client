import client from './client'

export const getAttendance = async (params = {}) => {
  const { data } = await client.get('/attendance', { params })
  return data.data
}

// Записи, ожидающие действия (pending + disputed) для текущего пользователя
export const getPendingAttendance = async (signal) => {
  const { data } = await client.get('/attendance/pending', { signal })
  return data.data
}

// Учитель отмечает посещаемость (bulk)
export const saveAttendance = async (lessonId, records, individualLessonId = null) => {
  const body = { records }
  if (lessonId)           body.lessonId           = lessonId
  if (individualLessonId) body.individualLessonId = individualLessonId
  const { data } = await client.post('/attendance', body)
  return data.data
}

// Студент подтверждает или оспаривает посещение
export const confirmAttendance = async (id, present) => {
  const { data } = await client.post(`/attendance/${id}/confirm`, { present })
  return data.data
}

// Учитель разрешает спор: accept=true → принять версию студента
export const resolveAttendanceDispute = async (id, accept) => {
  const { data } = await client.put(`/attendance/${id}`, { accept })
  return data.data
}
