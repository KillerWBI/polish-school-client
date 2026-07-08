// Скелетоны загрузки — вместо спиннера ощущается быстрее (виден каркас контента).
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
}

// Сетка карточек (Группы, Ученики, Инд. курсы)
export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-4 w-2/3 mb-3" />
          <Skeleton className="h-3 w-1/2 mb-2.5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

// Каркас дашборда: KPI-строка + график + две колонки контента
export function SkeletonDashboard() {
  return (
    <div className="p-5 sm:p-8">
      <Skeleton className="h-7 w-56 mb-1" />
      <Skeleton className="h-4 w-72 mb-5" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="w-9 h-9 rounded-lg mb-3" />
            <Skeleton className="h-3 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl mb-4" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <SkeletonList count={4} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// Список строк (Финансы, ДЗ, Инд. уроки)
export function SkeletonList({ count = 6 }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-3.5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}
