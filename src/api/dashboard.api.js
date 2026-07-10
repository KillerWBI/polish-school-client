import client from './client'

export const getDashboard = async (signal) => {
  const { data } = await client.get('/dashboard', { signal })
  return data.data
}

export const getActivity = async (signal) => {
  const { data } = await client.get('/dashboard/activity', { signal })
  return data.data
}
