import client from './client'

// Долг студента по каждому учителю: [{ teacher, charged, paid, balance }]
// studentId сервер берёт из токена — тело/аргументы не нужны.
export const getDebt = async () => {
  const { data } = await client.get('/payments/debt')
  return data.data
}

// Долг учителя по каждому его ученику: [{ student, charged, paid, balance }]
// teacherId сервер берёт из токена — аргументы не нужны.
export const getDebtsForTeacher = async () => {
  const { data } = await client.get('/payments/debts')
  return data.data
}

// Учитель вносит оплату от ученика. teacherId и дату ставит сервер.
export const recordPayment = async (studentId, amount) => {
  const { data } = await client.post('/payments/record', { studentId, amount })
  return data.data
}
