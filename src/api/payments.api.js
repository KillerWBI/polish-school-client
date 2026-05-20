import client from './client'

export const getPayments = async () => {
  const { data } = await client.get('/payments')
  return data.data
}

export const calculatePayments = async (month) => {
  const { data } = await client.post('/payments/calculate', { month })
  return data.data
}

export const updatePayment = async (id, paid) => {
  const { data } = await client.put(`/payments/${id}`, { paid })
  return data.data
}
