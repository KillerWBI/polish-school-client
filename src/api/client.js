import axios from 'axios'
import { getToken, setToken, removeToken } from '../utils/token'
import { toast } from '../utils/toast'

const baseURL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // чтобы браузер слал httpOnly refresh-cookie на /auth/refresh
})

// Подставляем access-токен в каждый запрос
client.interceptors.request.use((cfg) => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Один общий промис refresh — чтобы параллельные 401 не дёргали /refresh пачкой.
let refreshing = null
const doRefresh = () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((r) => { setToken(r.data.data.token); return r.data.data.token })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

// Ответы: access истёк (401) → пробуем refresh → повторяем запрос. Не вышло → logout.
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    // Отменённый запрос (AbortController при переходе между страницами / размонтировании)
    // — это НЕ ошибка сети. Тихо пробрасываем, без тоста «Нет связи с сервером».
    if (axios.isCancel(err) || err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
      return Promise.reject(err)
    }

    const status = err.response?.status
    const original = err.config
    const isAuthCall = original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        const token = await doRefresh()          // refresh-cookie → новый access
        original.headers.Authorization = `Bearer ${token}`
        return client(original)                  // повторяем исходный запрос
      } catch {
        removeToken()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(err)
      }
    }

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
