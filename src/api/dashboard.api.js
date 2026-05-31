import client from './client'

export const getDashboard = async () => {
  const { data } = await client.get('/dashboard')
  return data.data
}

export const getActivity = async () => {
  const { data } = await client.get('/dashboard/activity')
  return data.data
}
