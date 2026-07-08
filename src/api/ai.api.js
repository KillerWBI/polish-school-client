import client from './client'

// Генерация теста: { topic, count, difficulty, type, language } → { topic, type, ..., questions: [...] }
export const generateQuiz = async (params) => {
  const { data } = await client.post('/ai/quiz', params)
  return data.data
}
