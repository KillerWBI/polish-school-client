import client from './client'

// GET /billing/status — тариф, статус подписки, дата следующего списания, запланированная отмена
export const getBillingStatus = async (signal) => {
  const { data } = await client.get('/billing/status', { signal })
  return data.data
}

// POST /billing/cancel — отмена в конце оплаченного периода (доступ сохраняется до неё)
export const cancelSubscription = async () => {
  const { data } = await client.post('/billing/cancel')
  return data.data
}

// POST /billing/resume — снять запланированную отмену
export const resumeSubscription = async () => {
  const { data } = await client.post('/billing/resume')
  return data.data
}
