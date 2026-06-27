import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { getMyStudents } from '../../api/students.api'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function StudentsPage() {
  const { data: students, loading } = useFetch(getMyStudents)
  const [search, setSearch] = useState('')

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Ученики</h1>
        <p className="text-sm text-slate-400 mt-0.5">Ваши ученики</p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : !students?.length ? (
        <EmptyState emoji="🎓" title="Учеников пока нет"
          text="Ученики появляются после добавления в группу." />
      ) : (
        <>
          <input
            placeholder="Поиск по имени или email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm h-10 px-4 mb-5 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm placeholder:text-slate-500 outline-none focus:border-brand-400"
          />
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Ученик</th>
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:table-cell">Email</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter(s =>
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    (s.email || '').toLowerCase().includes(search.toLowerCase())
                  )
                  .map((s, i) => (
                    <tr key={s.id}
                      className={`border-b border-white/[0.05] last:border-0 ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar url={s.avatar} name={s.name} />
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">{s.name}</div>
                            {s.username && <div className="text-xs text-slate-500">@{s.username}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">{s.email}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">Всего: {students.length}</p>
        </>
      )}
    </div>
  )
}

function Avatar({ url, name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  )
}
