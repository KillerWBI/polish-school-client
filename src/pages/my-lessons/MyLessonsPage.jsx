import { useState } from 'react'
import { toast } from 'sonner'
import { NotebookPen, Plus, Check, Trash2, Wallet, Clock, CalendarDays, GraduationCap } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { getMyLessons, getMyLessonsStats, createMyLesson, payMyLesson, deleteMyLesson } from '../../api/myLessons.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`
const TYPE_LABEL = { external: 'С репетитором', self_study: 'Сам' }

export default function MyLessonsPage() {
  const [tab, setTab] = useState('schedule')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: lessons, loading, reload } = useFetch(getMyLessons)
  const { data: stats, reload: reloadStats } = useFetch(getMyLessonsStats)

  const refresh = () => { reload(); reloadStats() }

  return (
    <div className="p-5 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Мои занятия</h1>
            <p className="text-sm text-slate-500">Учёт уроков вне платформы и самостоятельных</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> Занятие</Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi Icon={CalendarDays} label="Занятий"  value={stats?.lessons ?? 0} color="bg-blue-50 text-blue-600" />
        <Kpi Icon={Clock}        label="Часов"    value={stats?.hours ?? 0}   color="bg-violet-50 text-violet-600" />
        <Kpi Icon={Wallet}       label="Долг"     value={fmt(stats?.debt)}    color="bg-amber-50 text-amber-600" />
        <Kpi Icon={Check}        label="Оплачено" value={fmt(stats?.paid)}    color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Табы */}
      <div className="inline-flex p-0.5 mb-5 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'schedule'} onClick={() => setTab('schedule')}>Занятия</TabBtn>
        <TabBtn active={tab === 'teachers'} onClick={() => setTab('teachers')}>Учителя</TabBtn>
        <TabBtn active={tab === 'subjects'} onClick={() => setTab('subjects')}>Предметы</TabBtn>
        <TabBtn active={tab === 'debt'}     onClick={() => setTab('debt')}>Долг</TabBtn>
      </div>

      {tab === 'schedule' && <ScheduleTab lessons={lessons} loading={loading} onRefresh={refresh} onAdd={() => setCreateOpen(true)} />}
      {tab === 'debt'     && <ScheduleTab lessons={(lessons || []).filter(l => !l.isPaid && Number(l.pricePerLesson) > 0)} loading={loading} onRefresh={refresh} debtMode />}
      {tab === 'teachers' && <BreakdownTab map={stats?.byTeacher} kind="teacher" />}
      {tab === 'subjects' && <BreakdownTab map={stats?.bySubject} kind="subject" />}

      {createOpen && (
        <CreateModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); refresh() }} />
      )}
    </div>
  )
}

function Kpi({ Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}><Icon className="w-4.5 h-4.5" /></div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {children}
    </button>
  )
}

/* ── Список занятий ── */
function ScheduleTab({ lessons, loading, onRefresh, onAdd, debtMode }) {
  const [busy, setBusy] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const pay = async (id) => {
    setBusy(id)
    try { await payMyLesson(id); toast.success('Отмечено оплаченным'); onRefresh() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(null) }
  }

  const doDelete = async () => {
    setBusy(confirmDel.id)
    try { await deleteMyLesson(confirmDel.id); setConfirmDel(null); onRefresh() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(null) }
  }

  if (loading) return <SkeletonList />
  if (!lessons?.length) {
    return debtMode
      ? <EmptyState emoji="✅" title="Долгов нет" text="Все занятия оплачены." />
      : <EmptyState emoji="📝" title="Записей пока нет" text="Добавьте первое занятие для учёта."
          action={onAdd && <Button size="sm" onClick={onAdd}>Добавить занятие</Button>} />
  }

  return (
    <div className="space-y-2">
      {lessons.map(l => (
        <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900">{l.subject}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{TYPE_LABEL[l.type]}</span>
              {Number(l.pricePerLesson) > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${l.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {l.isPaid ? 'Оплачено' : `Долг ${fmt(l.pricePerLesson)}`}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {new Date(l.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
              {l.time && ` · ${l.time}`}
              {l.durationMin && ` · ${l.durationMin} мин`}
              {l.teacherLabel && ` · ${l.teacherLabel}`}
            </div>
            {l.topic && <div className="text-sm text-slate-600 mt-1">{l.topic}</div>}
            {l.notes && <div className="text-xs text-slate-400 mt-1">{l.notes}</div>}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {!l.isPaid && Number(l.pricePerLesson) > 0 && (
              <Button size="sm" variant="secondary" onClick={() => pay(l.id)} loading={busy === l.id}>
                <Check className="w-3.5 h-3.5 mr-1" /> Оплатил
              </Button>
            )}
            <button onClick={() => setConfirmDel(l)} className="text-slate-300 hover:text-red-500 transition-colors self-end p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title="Удалить занятие?"
        message="Запись будет удалена из журнала."
        confirmLabel="Удалить"
        busy={busy === confirmDel?.id}
      />
    </div>
  )
}

/* ── Разбивка по учителям / предметам ── */
function BreakdownTab({ map, kind }) {
  const entries = Object.entries(map || {})
  if (!entries.length) return <EmptyState emoji="📊" title="Нет данных" text="Добавьте занятия, чтобы увидеть разбивку." />

  return (
    <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
      {entries.map(([name, v]) => (
        <div key={name} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
            {kind === 'teacher' ? <GraduationCap className="w-5 h-5" /> : <span className="text-sm font-semibold">{name[0]?.toUpperCase()}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
            <div className="text-xs text-slate-400">
              {v.lessons} занятий{kind === 'subject' && v.minutes ? ` · ${Math.round(v.minutes / 6) / 10} ч` : ''}
            </div>
          </div>
          {kind === 'teacher' && (
            <div className={`text-sm font-semibold shrink-0 ${v.debt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {v.debt > 0 ? `Долг ${fmt(v.debt)}` : 'Оплачено'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Модалка создания ── */
function CreateModal({ onClose, onCreated }) {
  const [f, setF] = useState({ subject: '', teacherLabel: '', date: '', time: '', durationMin: '', topic: '', notes: '', pricePerLesson: '', type: 'external', isPaid: false })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }))

  const submit = async () => {
    if (!f.subject.trim() || !f.date) { toast.error('Укажите предмет и дату'); return }
    setBusy(true)
    try {
      await createMyLesson({
        subject: f.subject,
        teacherLabel: f.teacherLabel || null,
        date: f.date,
        time: f.time || null,
        durationMin: f.durationMin ? Number(f.durationMin) : null,
        topic: f.topic || null,
        notes: f.notes || null,
        pricePerLesson: f.pricePerLesson ? Number(f.pricePerLesson) : 0,
        isPaid: f.isPaid,
        type: f.type,
      })
      toast.success('Занятие добавлено')
      onCreated()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Новое занятие</h3>

        <div className="flex gap-2 mb-4">
          {[['external', 'С репетитором'], ['self_study', 'Самостоятельно']].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setF(s => ({ ...s, type: k }))}
              className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${f.type === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Input label="Предмет" value={f.subject} onChange={set('subject')} placeholder="математика, английский, музыка…" />
          {f.type === 'external' && (
            <Input label="Преподаватель / источник" value={f.teacherLabel} onChange={set('teacherLabel')} placeholder="Пан Войтек" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата" type="date" value={f.date} onChange={set('date')} />
            <Input label="Время" type="time" value={f.time} onChange={set('time')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Длительность (мин)" type="number" value={f.durationMin} onChange={set('durationMin')} placeholder="60" />
            <Input label="Цена (zł)" type="number" value={f.pricePerLesson} onChange={set('pricePerLesson')} placeholder="0" />
          </div>
          <Input label="Тема" value={f.topic} onChange={set('topic')} placeholder="Прошедшее время" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Заметки</label>
            <textarea value={f.notes} onChange={set('notes')} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
          </div>
          {Number(f.pricePerLesson) > 0 && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={f.isPaid} onChange={e => setF(s => ({ ...s, isPaid: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Уже оплачено
            </label>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>Отмена</Button>
          <Button className="flex-1" onClick={submit} loading={busy}>Добавить</Button>
        </div>
      </div>
    </Modal>
  )
}
