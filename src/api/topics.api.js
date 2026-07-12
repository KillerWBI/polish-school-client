import client from './client'

// Самостоятельные темы ученика с адаптивными AI-тестами.
export const getTopics = async (signal) => {
  const { data } = await client.get('/topics', { signal })
  return data.data
}

export const createTopic = async (payload) => {
  const { data } = await client.post('/topics', payload)
  return data.data
}

export const deleteTopic = async (id) => {
  const { data } = await client.delete(`/topics/${id}`)
  return data.data
}

// Сгенерировать следующий тест по теме (сложность и анти-повтор — на сервере)
export const nextTopicQuiz = async (id) => {
  const { data } = await client.post(`/topics/${id}/next`)
  return data.data // { topic, type, difficulty, questions }
}

// Записать результат практики → сервер пересчитывает % обладания
export const submitTopicAttempt = async (id, payload) => {
  const { data } = await client.post(`/topics/${id}/attempt`, payload)
  return data.data // обновлённая тема
}
