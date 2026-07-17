import client from './client'

// Флеш-карточки учебного трека (генерация ИИ + интервальное повторение).

// Сгенерировать карточки по шагу трека
export const generateCards = async (topicId, stepId, count) => {
  const { data } = await client.post(`/topics/${topicId}/cards/generate`, { stepId, ...(count ? { count } : {}) })
  return data.data // массив созданных карточек
}

// Все карточки трека (опц. по шагу) + meta.dueCount
export const getCards = async (topicId, stepId, signal) => {
  const { data } = await client.get(`/topics/${topicId}/cards`, { params: stepId ? { stepId } : {}, signal })
  return data // { data: [...], meta: { dueCount } }
}

// Карточки к повторению сейчас (по всему треку)
export const getDueCards = async (topicId, signal) => {
  const { data } = await client.get(`/topics/${topicId}/cards/due`, { signal })
  return data.data
}

// Результат повторения карточки (SR-обновление на сервере)
export const reviewCard = async (topicId, cardId, correct) => {
  const { data } = await client.patch(`/topics/${topicId}/cards/${cardId}/review`, { correct })
  return data.data
}

export const deleteCard = async (topicId, cardId) => {
  const { data } = await client.delete(`/topics/${topicId}/cards/${cardId}`)
  return data.data
}
