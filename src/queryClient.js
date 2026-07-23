import { QueryClient } from '@tanstack/react-query'

// Общий кэш запросов: 20с данные считаются свежими (без рефетча при повторном заходе на страницу),
// после этого — тихое фоновое обновление (stale-while-revalidate), без спиннера поверх старых данных.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})
