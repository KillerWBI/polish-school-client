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
// method: 'cash' | 'card' | 'transfer' (по умолчанию наличные).
export const recordPayment = async (studentId, amount, method) => {
  const { data } = await client.post('/payments/record', { studentId, amount, method })
  return data.data
}

// История оплат учителя: { data: [...], summary: { total, byMethod } }.
// params: { studentId?, method?, from?, to? }
export const getPaymentHistory = async (params = {}) => {
  const { data } = await client.get('/payments/history', { params })
  return data // отдаём весь ответ — нужны и записи, и сводка
}

// Реквизиты учителя для страницы оплаты (вызывает ученик)
export const getTeacherPaymentInfo = async (teacherId) => {
  const { data } = await client.get(`/payments/teacher-info/${teacherId}`)
  return data.data
}

// Ученик подаёт запись об оплате (со скриншотом или без)
export const studentPay = async (payload) => {
  const { data } = await client.post('/payments/student-pay', payload)
  return data.data
}
