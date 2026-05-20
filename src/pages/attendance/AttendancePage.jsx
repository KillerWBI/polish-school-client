import { useState, useEffect, useCallback } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getLessons } from '../../api/lessons.api'
import { getGroup } from '../../api/groups.api'
import { getAttendance, saveAttendance } from '../../api/attendance.api'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AttendancePage() {
  const { isTeacher } = useAuth()
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Посещаемость</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isTeacher ? 'Выберите урок и отметьте присутствие' : 'История моих посещений'}
        </p>
      </div>
      {isTeacher ? <TeacherView /> : <StudentView />}
    </div>
  )
}

/* ── Учитель: отметка посещаемости ──────────────────────────── */
function TeacherView() {
  const { data: lessons, loading } = useFetch(getLessons)
  const [selected, setSelected] = useState(null)

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Выберите урок</p>
        {loading ? <PageSpinner /> : !lessons?.length ? (
          <EmptyState emoji="📅" title="Уроков нет" text="Сначала создайте уроки." />
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {lessons.map(l => (
              <button key={l.id} onClick={() => setSelected(l)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  selected?.id === l.id
                    ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                    : 'bg-white/[0.04] border-white/[0.07] text-white hover:bg-white/[0.07] hover:border-white/[0.14]'
                }`}>
                <div className="text-sm font-medium">{l.topic || l.Group?.name || 'Урок'}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDate(l.date)} · {l.time} · {l.Group?.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {selected
          ? <AttendanceForm lesson={selected} />
          : <EmptyState emoji="👈" title="Выберите урок" text="Нажмите на урок слева, чтобы отметить посещаемость." />
        }
      </div>
    </div>
  )
}

function AttendanceForm({ lesson }) {
  const { data: group, loading: groupLoading } = useFetch(
    useCallback(() => getGroup(lesson.groupId), [lesson.groupId])
  )
  const { data: existing } = useFetch(
    useCallback(() => getAttendance({ lessonId: lesson.id }), [lesson.id])
  )

  const [present, setPresent] = useState({})
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState(false)

  useEffect(() => {
    if (!existing) return
    const init = {}
    existing.forEach(r => { init[r.studentId] = r.present })
    setPresent(init)
  }, [existing])

  const toggle = (id)  => setPresent(p => ({ ...p, [id]: !p[id] }))
  const setAll = (val) => {
    const all = {}
    group?.students?.forEach(s => { all[s.id] = val })
    setPresent(all)
  }

  const handleSave = async () => {
    if (!group?.students?.length) return
    setSaving(true); setOk(false)
    try {
      const records = group.students.map(s => ({ studentId: s.id, present: !!present[s.id] }))
      await saveAttendance(lesson.id, records)
      setOk(true)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (groupLoading) return <PageSpinner />
  if (!group?.students?.length) return (
    <EmptyState emoji="👤" title="Студентов нет" text="Сначала добавьте студентов в группу." />
  )

  const total   = group.students.length
  const checked = Object.values(present).filter(Boolean).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider">
          {group.name} · {checked}/{total}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setAll(true)}
            className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer">Все</button>
          <span className="text-slate-600">·</span>
          <button onClick={() => setAll(false)}
            className="text-xs text-slate-400 hover:text-white cursor-pointer">Никого</button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {group.students.map(s => (
          <label key={s.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              present[s.id] ? 'bg-brand-600 border-brand-600' : 'border-white/30 bg-transparent'
            }`}>
              {present[s.id] && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <input type="checkbox" className="sr-only"
              checked={!!present[s.id]} onChange={() => toggle(s.id)} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{s.name}</div>
              <div className="text-xs text-slate-400 truncate">{s.email}</div>
            </div>
            {present[s.id]
              ? <span className="text-xs text-green-400 shrink-0">Присутствует</span>
              : <span className="text-xs text-slate-600 shrink-0">Отсутствует</span>
            }
          </label>
        ))}
      </div>

      {ok && <p className="text-sm text-green-400 mb-3">✓ Посещаемость сохранена</p>}
      <Button onClick={handleSave} loading={saving} className="w-full">
        Сохранить посещаемость
      </Button>
    </div>
  )
}

/* ── Студент: только просмотр своей посещаемости ─────────────── */
function StudentView() {
  const { data: records, loading } = useFetch(getAttendance)

  if (loading) return <PageSpinner />
  if (!records?.length) {
    return (
      <EmptyState emoji="📋" title="Записей пока нет"
        text="Здесь появится история ваших посещений после того, как преподаватель отметит первый урок." />
    )
  }

  // Сортируем по дате урока (вшита через include в backend)
  const sorted = [...records].sort((a, b) => {
    const da = a.Lesson?.date || ''
    const db = b.Lesson?.date || ''
    return db.localeCompare(da)
  })

  const total    = sorted.length
  const attended = sorted.filter(r => r.present).length
  const percent  = total > 0 ? Math.round((attended / total) * 100) : 0

  return (
    <div>
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Всего" value={total} />
        <Stat label="Посещено" value={attended} color="text-green-400" />
        <Stat label="Процент" value={`${percent}%`} color="text-brand-300" />
      </div>

      {/* Таблица */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Дата</th>
              <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:table-cell">Время</th>
              <th className="text-center px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.id} className={`border-b border-white/[0.05] last:border-0 ${i%2===0?'':'bg-white/[0.02]'}`}>
                <td className="px-5 py-3.5 text-white">
                  {r.Lesson?.date ? formatDate(r.Lesson.date) : '—'}
                </td>
                <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">
                  {r.Lesson?.time || '—'}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {r.present
                    ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">✓ Присутствовал</span>
                    : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">✕ Отсутствовал</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
