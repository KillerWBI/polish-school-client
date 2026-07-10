import client from './client'

// Личный словарь ученика (SR-тренажёр).
export const getVocab = async (params = {}) => {
  const { data } = await client.get('/vocab', { params })
  return data // { data, meta:{ total, counts, ... } }
}

export const getDueVocab = async (signal) => {
  const { data } = await client.get('/vocab/due', { signal })
  return data.data
}

export const addVocab = async (payload) => {
  const { data } = await client.post('/vocab', payload)
  return data.data
}

export const updateVocab = async (id, payload) => {
  const { data } = await client.put(`/vocab/${id}`, payload)
  return data.data
}

// correct: true/false — обновляет интервал повторения на сервере
export const reviewVocab = async (id, correct) => {
  const { data } = await client.patch(`/vocab/${id}/review`, { correct })
  return data.data
}

export const deleteVocab = async (id) => {
  const { data } = await client.delete(`/vocab/${id}`)
  return data.data
}
