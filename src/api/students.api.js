import client from './client'

export const getStudents = async () => {
  const { data } = await client.get('/users')
  return data.data
}

export const getStudent = async (id) => {
  const { data } = await client.get(`/users/${id}`)
  return data.data
}
