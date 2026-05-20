import axios from 'axios'
import { getToken, removeToken } from '../utils/token'

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

// При 401 — выкидываем токен и уведомляем AuthContext через событие
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(err)
  }
)

export default client
