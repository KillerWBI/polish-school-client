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
export const getMyStudents = async () => {
  const { data } = await client.get('/users/me/students')
  return data.data
}
