import client from './client'

// Сохранить сгенерированный тест
export const saveQuiz = async (quiz) => {
  const { data } = await client.post('/quizzes', quiz)
  return data.data
}

// Список моих тестов (мета)
export const getQuizzes = async (signal) => {
  const { data } = await client.get('/quizzes', { signal })
  return data.data
}

// Полный тест по id
export const getQuiz = async (id) => {
  const { data } = await client.get(`/quizzes/${id}`)
  return data.data
}

// Удалить тест
export const deleteQuiz = async (id) => {
  const { data } = await client.delete(`/quizzes/${id}`)
  return data.data
}
