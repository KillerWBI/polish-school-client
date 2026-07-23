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

// Массовое добавление: { items:[{word,translation,example?}], language?, nativeLanguage? }
// → { data:[созданные], meta:{ added, skipped } }
export const bulkAddVocab = async (payload) => {
  const { data } = await client.post('/vocab/bulk', payload)
  return data // возвращаем целиком ради meta (сколько добавлено/не влезло)
}

// AI-генерация набора: { language, nativeLanguage, topic, count, level }
// → { data:[созданные], meta:{ generated, added, skipped } }
export const generateVocab = async (payload) => {
  const { data } = await client.post('/vocab/generate', payload)
  return data
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
