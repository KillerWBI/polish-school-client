import { useState, useMemo } from 'react'
import useFetch from '../../hooks/useFetch'
import { getMyStudents } from '../../api/students.api'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function StudentsPage() {
  const { data: students, loading } = useFetch(getMyStudents)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students || []
    return (students || []).filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [students, search])

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Ученики</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ваш ростер — все ученики, привязанные к вам</p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : !students?.length ? (
        <EmptyState emoji="🎓" title="Учеников пока нет"
          text="Ученики появляются после добавления в группу или принятия приглашения." />
      ) : (
        <div>
          {/* Поиск + счётчик */}
          <div className="flex items-center gap-3 mb-4 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Поиск по имени, нику или email"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow"
              />
            </div>
            <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
              {filtered.length}{filtered.length !== students.length && ` / ${students.length}`}
            </span>
          </div>

          {/* Ростер — сетка карточек */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              Ничего не найдено
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(s => <StudentCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StudentCard({ s }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
      <Avatar url={s.avatar} name={s.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 truncate">{s.name}</span>
          {s.isPlaceholder && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              заглушка
            </span>
          )}
        </div>
        {s.username && <div className="text-xs text-slate-400 truncate">@{s.username}</div>}
        {(s.email || s.contact) && (
          <div className="text-xs text-slate-500 truncate mt-0.5">{s.email || s.contact}</div>
        )}
      </div>
    </div>
  )
}

function Avatar({ url, name }) {
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  )
}
