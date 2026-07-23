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

// POST /students/:id/merge — перенести заглушку (sourceId) на реального ученика (targetStudentId)
export const mergeStudent = async (sourceId, targetStudentId) => {
  const { data } = await client.post(`/students/${sourceId}/merge`, { targetStudentId })
  return data.data
}

// DELETE /students/:id — полностью удалить заглушку из ростера (вместе с историей)
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
