import client from './client'

// Долг студента по каждому учителю: [{ teacher, charged, paid, balance }]
// studentId сервер берёт из токена — тело/аргументы не нужны.
export const getDebt = async (signal) => {
  const { data } = await client.get('/payments/debt', { signal })
  return data.data
}

// Долг учителя по каждому его ученику: [{ student, charged, paid, balance }]
// teacherId сервер берёт из токена — аргументы не нужны.
export const getDebtsForTeacher = async (signal) => {
  const { data } = await client.get('/payments/debts', { signal })
  return data.data
}

// Учитель вносит оплату от ученика. teacherId и дату ставит сервер.
// method: 'cash' | 'card' | 'transfer' (по умолчанию наличные).
export const recordPayment = async (studentId, amount, method) => {
  const { data } = await client.post('/payments/record', { studentId, amount, method })
  return data.data
}

// Оплаты учеников на проверке (учитель): [{ id, amount, method, screenshotUrl, paidAt, student }]
export const getPendingPayments = async (signal) => {
  const { data } = await client.get('/payments/pending', { signal })
  return data.data
}

// Учитель подтверждает / отклоняет оплату ученика
export const approvePayment = async (id) => {
  const { data } = await client.patch(`/payments/${id}/approve`)
  return data.data
}
export const rejectPayment = async (id, reason) => {
  const { data } = await client.patch(`/payments/${id}/reject`, { reason })
  return data.data
}

// Ученик отменяет свою заявку (пока на проверке)
export const cancelMyPayment = async (id) => {
  const { data } = await client.delete(`/payments/${id}`)
  return data.data
}

// История оплат учителя: { data: [...], summary: { total, byMethod } }.
// params: { studentId?, method?, from?, to? }
export const getPaymentHistory = async (params = {}) => {
  const { data } = await client.get('/payments/history', { params })
  return data // отдаём весь ответ — нужны и записи, и сводка
}

// История оплат ученика: { data: [...], summary: { total, byMethod } }.
// studentId сервер берёт из токена. params: { method?, from?, to? }
export const getMyPaymentHistory = async (params = {}) => {
  const { data } = await client.get('/payments/my-history', { params })
  return data // весь ответ — записи + сводка
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
