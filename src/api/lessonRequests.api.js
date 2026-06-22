import client from './client'

// POST /lesson-requests — студент создаёт заявку на обучение
export const createLessonRequest = async (body) => {
  const { data } = await client.post('/lesson-requests', body)
  return data.data
}

// GET /lesson-requests — роль-свитч на бэке (учитель: входящие, студент: свои)
export const getLessonRequests = async (status) => {
  const { data } = await client.get('/lesson-requests', { params: status ? { status } : {} })
  return data.data
}

// PATCH /lesson-requests/:id — учитель принимает/отклоняет
export const patchLessonRequest = async (id, status) => {
  const { data } = await client.patch(`/lesson-requests/${id}`, { status })
  return data.data
}
