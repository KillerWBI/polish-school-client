import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import useFetch from '../../hooks/useFetch'
import { getMyStudents } from '../../api/students.api'
import { getLessonRequests, patchLessonRequest } from '../../api/lessonRequests.api'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Tabs from '../profile/components/Tabs'
import { getLanguageName } from '../../constants/languages'

export default function StudentsPage() {
  const [tab, setTab] = useState('mine')

  const { data: students, loading: loadingStudents } = useFetch(getMyStudents)
  const { data: requests, loading: loadingReq, reload: reloadReq } =
    useFetch(() => getLessonRequests('pending'))

  const pendingCount = requests?.length ?? 0

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Ученики</h1>
        <p className="text-sm text-slate-400 mt-0.5">Ваши ученики и входящие заявки на обучение</p>
      </div>

      <Tabs
        items={[
          { id: 'mine',     label: 'Мои ученики' },
          { id: 'requests', label: pendingCount ? `Заявки (${pendingCount})` : 'Заявки' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6">
        {tab === 'mine'
          ? <MyStudents students={students} loading={loadingStudents} />
          : <Requests requests={requests} loading={loadingReq} reload={reloadReq} />}
      </div>
    </div>
  )
}

/* ── Мои ученики ────────────────────────────────────────────── */
function MyStudents({ students, loading }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  if (loading) return <PageSpinner />

  const filtered = (students || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!students?.length) {
    return <EmptyState emoji="🎓" title="Учеников пока нет"
      text="Ученики появляются после принятия заявки на обучение." />
  }

  return (
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
            {filtered.map((s, i) => (
              <tr key={s.id}
                onClick={() => navigate(`/@${s.username}`)}
                className={`border-b border-white/[0.05] last:border-0 hover:bg-white/[0.06] transition-colors cursor-pointer ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar url={s.avatar} name={s.name} />
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{s.name}</div>
                      <div className="text-xs text-slate-500">@{s.username}</div>
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
  )
}

/* ── Заявки ─────────────────────────────────────────────────── */
function Requests({ requests, loading, reload }) {
  const navigate = useNavigate()

  if (loading) return <PageSpinner />
  if (!requests?.length) {
    return <EmptyState emoji="📭" title="Заявок нет" text="Новые заявки на обучение появятся здесь." />
  }

  const handle = async (id, status) => {
    try {
      await patchLessonRequest(id, status)
      toast.success(status === 'accepted' ? 'Заявка принята' : 'Заявка отклонена')
      reload()
      // Сообщаем Sidebar обновить бейдж (паттерн CustomEvent, как auth:logout)
      window.dispatchEvent(new CustomEvent('requests:changed'))
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  return (
    <div className="space-y-3">
      {requests.map(r => (
        <div key={r.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate(`/@${r.student?.username}`)} className="shrink-0">
              <Avatar url={r.student?.avatar} name={r.student?.name} />
            </button>
            <div className="flex-1 min-w-0">
              <button onClick={() => navigate(`/@${r.student?.username}`)}
                className="font-medium text-white hover:text-brand-300 transition-colors">
                {r.student?.name}
              </button>
              <div className="text-xs text-slate-400 mt-0.5">
                Язык: <span className="text-slate-200">{getLanguageName(r.language)}</span>
                {r.level && <span className="text-slate-500"> · уровень {r.level}</span>}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Связь: <span className="text-slate-200">{r.contactMethod} — {r.contactValue}</span>
              </div>
              {r.message && <p className="text-sm text-slate-300 mt-2 whitespace-pre-line">{r.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => handle(r.id, 'declined')}>Отклонить</Button>
            <Button size="sm" onClick={() => handle(r.id, 'accepted')}>Принять</Button>
          </div>
        </div>
      ))}
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
