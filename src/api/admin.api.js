import client from './client'

export const getAdminStats  = async ()       => { const { data } = await client.get('/admin/stats');  return data.data }
export const getAdminUsers  = async (params, signal) => { const { data } = await client.get('/admin/users', { params, signal }); return data }
export const deactivateUser = async (id)     => { const { data } = await client.patch(`/admin/users/${id}/deactivate`); return data.data }
export const activateUser   = async (id)     => { const { data } = await client.patch(`/admin/users/${id}/activate`);   return data.data }
export const setUserRole    = async (id, role) => { const { data } = await client.patch(`/admin/users/${id}/role`, { role }); return data.data }
export const setUserPlan    = async (id, plan) => { const { data } = await client.patch(`/admin/users/${id}/plan`, { plan }); return data.data }

// Поддержка (админ)
export const getSupportTickets = async (params, signal) => { const { data } = await client.get('/admin/support', { params, signal }); return data } // { data, meta:{counts} }
export const replySupportTicket = async (id, payload) => { const { data } = await client.patch(`/admin/support/${id}`, payload); return data.data }
