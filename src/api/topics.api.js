import client from './client'

// Самостоятельные темы ученика с адаптивными AI-тестами.
export const getTopics = async (signal) => {
  const { data } = await client.get('/topics', { signal })
  return data.data
}

// Тема с роадмапом + история попыток
export const getTopic = async (id, signal) => {
  const { data } = await client.get(`/topics/${id}`, { signal })
  return data.data // { topic, attempts }
}

export const createTopic = async (payload) => {
  const { data } = await client.post('/topics', payload)
  return data.data
}

export const deleteTopic = async (id) => {
  const { data } = await client.delete(`/topics/${id}`)
  return data.data
}

// Поделиться треком с учителем (или отозвать доступ) → { id, sharedWithTeacher }
export const shareTopic = async (id, shared) => {
  const { data } = await client.patch(`/topics/${id}/share`, { shared })
  return data.data
}

// Сгенерировать следующую практику по шагу (type: 'single' тест | 'open' открытый ответ)
export const nextTopicQuiz = async (id, stepId, type = 'single') => {
  const { data } = await client.post(`/topics/${id}/next`, { stepId, type })
  return data.data // { topic, stepId, type, difficulty, questions }
}

// Оценить открытые ответы (ИИ) → { results:[{score,feedback}], avg, score, total, topic }
export const gradeOpenAnswers = async (id, payload) => {
  const { data } = await client.post(`/topics/${id}/grade-open`, payload)
  return data.data
}

// Сохранённые источники трека (опц. по шагу)
export const getSources = async (id, stepId, signal) => {
  const { data } = await client.get(`/topics/${id}/sources`, { params: stepId ? { stepId } : {}, signal })
  return data.data
}

// Подобрать источники к шагу (ИИ + проверка) → сохранить и вернуть НОВЫЕ.
// loose=true — добавить «менее проверенные» по запросу.
export const suggestSources = async (id, stepId, loose = false) => {
  const { data } = await client.post(`/topics/${id}/sources`, { stepId, ...(loose ? { loose: true } : {}) })
  return data.data // [{ id, type, title, author?, url, verified }]
}

export const deleteSource = async (id, sourceId) => {
  const { data } = await client.delete(`/topics/${id}/sources/${sourceId}`)
  return data.data
}

// Импорт карточек из вставленного текста
export const importCardsFromText = async (id, payload) => {
  const { data } = await client.post(`/topics/${id}/cards/from-text`, payload)
  return data.data
}

// Записать результат практики → сервер пересчитывает % обладания
export const submitTopicAttempt = async (id, payload) => {
  const { data } = await client.post(`/topics/${id}/attempt`, payload)
  return data.data // обновлённая тема
}
