import { useEffect, useState, useCallback, useMemo } from 'react'
import { fetchMe, logoutServer } from '../api/auth.api'
import { getToken, setToken, removeToken, getCachedUser, setCachedUser } from '../utils/token'
import { getActAs } from '../utils/actAs'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  // Есть токен и сохранённый профиль — кабинет рисуется сразу, а /auth/me сверяет его в фоне.
  // Без этого первый вход показывал кружок, пока просыпается бэкенд (Railway засыпает).
  const [user, setUser] = useState(() => (getToken() ? getCachedUser() : null))
  const [loading, setLoading] = useState(() => !!getToken() && !getCachedUser())

  useEffect(() => {
    if (!getToken()) return
    fetchMe()
      .then((me) => { setUser(me); setCachedUser(me) })
      .catch((e) => {
        // Сессию снимаем только на отказ сервера. Сетевая ошибка или таймаут (бэкенд просыпается)
        // раньше тоже выкидывали из аккаунта — теперь остаёмся с сохранённым профилем.
        if (e.response?.status === 401 || !getCachedUser()) { removeToken(); setUser(null) }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token, userData) => {
    setToken(token)
    setUser(userData)
    setCachedUser(userData)
  }, [])

  const logout = useCallback(() => {
    logoutServer()   // гасим refresh-cookie на сервере (best-effort)
    removeToken()
    setUser(null)
  }, [])

  // Локальное обновление user после изменения профиля
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...patch } : prev
      setCachedUser(next)
      return next
    })
  }, [])

  // Слушаем событие от axios-интерцептора (401 → сброс сессии)
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  // Админ видит кабинет выбранного режима: роль подменяется здесь, и весь интерфейс
  // (меню, маршруты, isTeacher/isStudent) работает как у учителя или ученика. isAdmin — что это админ.
  const viewUser = useMemo(
    () => (user?.role === 'admin' ? { ...user, role: getActAs(), isAdmin: true } : user),
    [user],
  )

  return (
    <AuthContext.Provider value={{ user: viewUser, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
