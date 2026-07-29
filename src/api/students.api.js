import client from './client'

export const getStudents = async () => {
  const { data } = await client.get('/users')
  return data.data
}

export const getStudent = async (id) => {
  const { data } = await client.get(`/users/${id}`)
  return data.data
}

// GET /users/me/students — «мои ученики» (принятые через заявку), для StudentsPage/picker
export const getMyStudents = async (signal) => {
  const { data } = await client.get('/users/me/students', { signal })
  return data.data
}

// POST /students — завести ученика без аккаунта вне группы (страница «Ученики»)
export const createStudent = async ({ name, contact }) => {
  const { data } = await client.post('/students', { name, ...(contact ? { contact } : {}) })
  return data.data
}

// GET /students/:id/overview — карточка ученика: группы, курсы, посещаемость,
// задания и долг. Только то, что связано с текущим учителем.
export const getStudentOverview = async (id, signal) => {
  const { data } = await client.get(`/students/${id}/overview`, { signal })
  return data.data
}

// POST /students/:id/merge — перенести ученика без аккаунта (sourceId) на аккаунт реального (targetStudentId)
export const mergeStudent = async (sourceId, targetStudentId) => {
  const { data } = await client.post(`/students/${sourceId}/merge`, { targetStudentId })
  return data.data
}

// DELETE /students/:id — полностью удалить ученика без аккаунта из списка (вместе с историей)
export const deletePlaceholder = async (id) => {
  const { data } = await client.delete(`/students/${id}`)
  return data.data
}

// GET /students/:id/track-insights — слабые места ученика из расшаренных им треков
// → { spots:[{topicId,topicTitle,stepId,stepTitle,mastery,attempts}], meta:{hasAccount,sharing,sharedCount,totalTracks} }
export const getTrackInsights = async (id, signal) => {
  const { data } = await client.get(`/students/${id}/track-insights`, { signal })
  return data.data
}

// POST /students/:id/targeted-quiz — сгенерировать адресный тест по выбранным слабым подтемам → Quiz
export const generateTargetedQuiz = async (id, spots, count) => {
  const { data } = await client.post(`/students/${id}/targeted-quiz`, { spots, ...(count ? { count } : {}) })
  return data.data
}
