import { useQuery } from '@tanstack/react-query'

// Обёртка над TanStack Query с интерфейсом старого useFetch (data/loading/error/reload) —
// чтобы не переписывать разметку всех страниц, но получить реальный кэш и stale-while-revalidate:
// при повторном заходе показываются старые данные сразу, обновление идёт в фоне без спиннера
// (loading=true только пока данных ещё вообще нет).
// queryKey — массив, однозначно определяющий запрос (endpoint + все влияющие на результат параметры).
// fn — async функция вида (signal) => data, как и раньше в useFetch.
export default function useApiQuery(queryKey, fn, options = {}) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fn(signal),
    ...options,
  })
  return {
    data: data ?? null,
    loading: isLoading,
    fetching: isFetching,
    error: error ? (error.response?.data?.error || 'Ошибка загрузки') : null,
    reload: refetch,
  }
}
