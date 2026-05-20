import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { getStudents } from '../../api/students.api'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function StudentsPage() {
  const { data: students, loading } = useFetch(getStudents)
  const [search, setSearch] = useState('')

  const filtered = (students || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Студенты</h1>
        <p className="text-sm text-slate-400 mt-0.5">Все зарегистрированные ученики</p>
      </div>

      {/* Поиск */}
      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm placeholder:text-slate-500 outline-none focus:border-brand-400"
        />
      </div>

      {loading ? <PageSpinner /> : !filtered.length ? (
        <EmptyState emoji="🎓" title="Студентов не найдено"
          text={search ? 'Попробуйте другой запрос' : 'Студенты появятся после регистрации.'} />
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Студент</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:table-cell">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}
                  className={`border-b border-white/[0.05] last:border-0 hover:bg-white/[0.04] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {s.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && students?.length > 0 && (
        <p className="text-xs text-slate-500 mt-3">Всего: {students.length}</p>
      )}
    </div>
  )
}
