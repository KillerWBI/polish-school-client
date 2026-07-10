import { useState, useEffect, useRef, useCallback } from 'react'

// Универсальный хук для загрузки данных.
// fn(signal?) — async функция; если принимает signal, запрос отменяется при размонтировании.
// deps — зависимости для повторного запроса.
export default function useFetch(fn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // callId защищает от setState после unmount и гонок при быстрых переходах
  const callId = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async (signal) => {
    const id = ++callId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fn(signal)
      if (id === callId.current) setData(result)
    } catch (e) {
      // AbortError при размонтировании — не показываем как ошибку
      if (e?.name === 'CanceledError' || e?.name === 'AbortError' || e?.code === 'ERR_CANCELED') return
      if (id === callId.current) setError(e.response?.data?.error || 'Ошибка загрузки')
    } finally {
      if (id === callId.current) setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => {
      callId.current++ // инвалидируем текущий запрос (для гонок)
      ctrl.abort()     // отменяем HTTP-запрос при размонтировании или смене deps
    }
  }, [load])

  return { data, loading, error, reload: load }
}
