import { useState, useEffect, useCallback } from 'react'

// Универсальный хук для загрузки данных
// fn — async функция, deps — зависимости для повторного запроса
export default function useFetch(fn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setData(result)
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}
