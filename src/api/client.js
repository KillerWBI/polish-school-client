import axios from 'axios'
import { getToken, removeToken } from '../utils/token'
import { toast } from '../utils/toast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// Подставляем токен в каждый запрос
client.interceptors.request.use((cfg) => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// 401 → выход. 5xx и сетевые ошибки → toast (компоненты могут показать локально, но это безопасный fallback).
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 401) {
      removeToken()
      window.dispatchEvent(new CustomEvent('auth:logout'))
    } else if (!err.response) {
      toast.error('Нет связи с сервером')
    } else if (status >= 500) {
      toast.error(err.response?.data?.error || 'Ошибка сервера')
    }
    return Promise.reject(err)
  }
)

export default client
