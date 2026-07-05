import { useState, useEffect, useRef, useCallback } from 'react'

// Универсальный хук для загрузки данных
// fn — async функция, deps — зависимости для повторного запроса
export default function useFetch(fn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // «Id вызова»: результат применяем только если он от последнего запроса.
  // При размонтировании/смене deps cleanup инкрементит id → устаревший ответ игнорируется
  // (нет setState после unmount и гонок при быстрых переходах).
  const callId = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    const id = ++callId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (id === callId.current) setData(result)
    } catch (e) {
      if (id === callId.current) setError(e.response?.data?.error || 'Ошибка загрузки')
    } finally {
      if (id === callId.current) setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => {
    load()
    return () => { callId.current++ } // инвалидируем текущий запрос
  }, [load])

  return { data, loading, error, reload: load }
}
