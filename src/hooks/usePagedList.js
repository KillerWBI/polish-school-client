import { useState, useEffect, useCallback } from 'react'

// Пагинация «показать ещё» для списков.
// fetchPage(page, limit) → массив строк. hasMore = вернулось ровно limit (значит есть ещё).
// fetchPage нужно мемоизировать (useCallback) у вызывающего, иначе перезагрузка на каждый рендер.
export default function usePagedList(fetchPage, limit = 20) {
  const [items, setItems]             = useState([])
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)   // первая загрузка
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]         = useState(false)

  const run = useCallback(async (p) => {
    const rows = await fetchPage(p, limit)
    setItems(prev => (p === 1 ? rows : [...prev, ...rows]))
    setHasMore(rows.length === limit)
  }, [fetchPage, limit])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    run(1).catch(() => {}).finally(() => setLoading(false))
  }, [run])

  const loadMore = async () => {
    const np = page + 1
    setLoadingMore(true)
    try { await run(np); setPage(np) } finally { setLoadingMore(false) }
  }

  const reload = () => {
    setLoading(true)
    setPage(1)
    run(1).catch(() => {}).finally(() => setLoading(false))
  }

  return { items, loading, loadingMore, hasMore, loadMore, reload }
}
