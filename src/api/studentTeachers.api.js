import client from './client'

// «Мои преподаватели» — карточки, которые ученик заводит сам для тех, кого нет на платформе.
// В списке каждая карточка приходит со сводкой: lessons (сколько занятий) и debt (сколько не оплачено).
export const getStudentTeachers = async (signal) => {
  const { data } = await client.get('/student-teachers', { signal })
  return data.data
}

export const createStudentTeacher = async (payload) => {
  const { data } = await client.post('/student-teachers', payload)
  return data.data
}

export const updateStudentTeacher = async (id, payload) => {
  const { data } = await client.put(`/student-teachers/${id}`, payload)
  return data.data
}

export const deleteStudentTeacher = async (id) => {
  const { data } = await client.delete(`/student-teachers/${id}`)
  return data.data
}
