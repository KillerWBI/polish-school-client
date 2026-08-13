import client from './client'

// Счета на оплату. Модель денег прежняя (постоплата) — счёт лишь оформляет
// уже начисленное за период, чтобы ученику было понятно, за что платить.

// GET /invoices — учитель видит выставленные им, ученик — свои.
export const getInvoices = async (signal) => {
  const { data } = await client.get('/invoices', { signal })
  return data.data
}

// GET /invoices/preview — что попадёт в счёт, до его выпуска (только учитель).
export const previewInvoice = async (params) => {
  const { data } = await client.get('/invoices/preview', { params })
  return data.data
}

// GET /invoices/:id — документ целиком, для печати.
export const getInvoice = async (id) => {
  const { data } = await client.get(`/invoices/${id}`)
  return data.data
}

export const createInvoice = async (payload) => {
  const { data } = await client.post('/invoices', payload)
  return data.data
}

// PATCH /invoices/:id — пометить оплаченным или отозвать.
export const patchInvoice = async (id, status) => {
  const { data } = await client.patch(`/invoices/${id}`, { status })
  return data.data
}

export const deleteInvoice = async (id) => {
  const { data } = await client.delete(`/invoices/${id}`)
  return data.data
}
