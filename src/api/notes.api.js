import client from './client'

// Личные заметки ученика.
export const getNotes = async (params = {}) => {
  const { data } = await client.get('/notes', { params })
  return data.data
}

export const createNote = async (payload) => {
  const { data } = await client.post('/notes', payload)
  return data.data
}

export const updateNote = async (id, payload) => {
  const { data } = await client.put(`/notes/${id}`, payload)
  return data.data
}

export const deleteNote = async (id) => {
  const { data } = await client.delete(`/notes/${id}`)
  return data.data
}
