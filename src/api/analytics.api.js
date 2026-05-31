import client from './client'

// GET /analytics/teacher/:userId?period=day|week|month
export const getTeacherAnalytics = async (userId, period = 'month') => {
  const { data } = await client.get(`/analytics/teacher/${userId}`, { params: { period } })
  return data.data
}

// GET /analytics/student/:id
export const getStudentAnalytics = async (studentId) => {
  const { data } = await client.get(`/analytics/student/${studentId}`)
  return data.data
}
