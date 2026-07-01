import { createContext, useEffect, useState, useCallback } from 'react'
import { fetchMe, logoutServer } from '../api/auth.api'
import { getToken, setToken, removeToken } from '../utils/token'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // При запуске — если есть токен, подгружаем профиль
  useEffect(() => {
    const init = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await fetchMe()
        setUser(me)
      } catch {
        removeToken()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback((token, userData) => {
    setToken(token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    logoutServer()   // гасим refresh-cookie на сервере (best-effort)
    removeToken()
    setUser(null)
  }, [])

  // Локальное обновление user после изменения профиля
  const updateUser = useCallback((patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev)
  }, [])

  // Слушаем событие от axios-интерцептора (401 → сброс сессии)
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
