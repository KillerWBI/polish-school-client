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
