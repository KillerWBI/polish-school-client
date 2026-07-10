import client from './client'

// Публичная форма обращения в поддержку (auth не обязателен).
// payload: { name, email, subject, category?, message }
export const submitSupportTicket = async (payload) => {
  const { data } = await client.post('/support/ticket', payload)
  return data.data
}
