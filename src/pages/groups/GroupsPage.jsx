import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getGroups, createGroup, generateLessons } from '../../api/groups.api'
import { dayLabel } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const DAYS = [
  { value: 1, label: 'Пн' }, { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' }, { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' }, { value: 6, label: 'Сб' },
  { value: 0, label: 'Вс' },
]

export default function GroupsPage() {
  const navigate = useNavigate()
  const { isTeacher } = useAuth()
  const { data: groups, loading, reload } = useFetch(getGroups)
  const [modal, setModal] = useState(false)

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {isTeacher ? 'Группы' : 'Мои группы'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isTeacher ? 'Управление учебными группами' : 'Группы, в которых я учусь'}
          </p>
        </div>
        {isTeacher && (
          <Button size="sm" onClick={() => setModal(true)}>+ Создать группу</Button>
        )}
      </div>

      {loading ? <PageSpinner /> : (
        !groups?.length ? (
          <EmptyState
            emoji="👥"
            title={isTeacher ? 'Групп пока нет' : 'Вы пока не в группах'}
            text={isTeacher
              ? 'Создайте первую группу, чтобы начать добавлять студентов и генерировать уроки.'
              : 'Преподаватель добавит вас в группу — она появится здесь.'}
            action={isTeacher
              ? <Button size="sm" onClick={() => setModal(true)}>Создать группу</Button>
              : null}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => (
              <GroupCard key={g.id} group={g} onClick={() => navigate(`/groups/${g.id}`)} />
            ))}
          </div>
        )
      )}

      {isTeacher && (
        <CreateGroupModal open={modal} onClose={() => setModal(false)} onCreated={reload} />
      )}
    </div>
  )
}

function GroupCard({ group, onClick }) {
  const schedule = (group.schedule || [])
    .map(s => `${dayLabel(s.day)} ${s.time}`)
    .join(', ')

  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-2xl border border-white/[0.09] bg-white/[0.05] hover:bg-white/[0.09] hover:border-brand-500/40 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
          {group.name}
        </h3>
        <svg className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {schedule && <p className="text-xs text-slate-400 mb-2">📅 {schedule}</p>}
      <p className="text-xs text-slate-400">
        💰 {group.pricePerLesson} / урок
      </p>
    </button>
  )
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const [form, setForm]       = useState({ name: '', pricePerLesson: '', lessonLink: '' })
  const [schedule, setSchedule] = useState([]) // [{day, time}]
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSlot = () => setSchedule(s => [...s, { day: 1, time: '18:00' }])
  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) =>
    setSchedule(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: key === 'day' ? Number(val) : val } : sl))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Введите название')
    setSaving(true)
    setError('')
    try {
      const newGroup = await createGroup({
        name: form.name.trim(),
        schedule,
        lessonLink: form.lessonLink.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || 0,
      })

      // Если задано расписание — автоматически генерируем уроки на 3 месяца вперёд
      if (schedule.length > 0 && newGroup?.id) {
        const today = new Date().toISOString().slice(0, 10)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 3)
        const to = endDate.toISOString().slice(0, 10)
        await generateLessons(newGroup.id, today, to)
      }

      onCreated()
      onClose()
      setForm({ name: '', pricePerLesson: '', lessonLink: '' })
      setSchedule([])
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-white mb-5">Новая группа</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Название группы" value={form.name}
            onChange={e => set('name', e.target.value)} />
          <Input label="Цена за урок" type="number" value={form.pricePerLesson}
            onChange={e => set('pricePerLesson', e.target.value)} />
          <Input label="Ссылка Zoom/Meet (необязательно)" value={form.lessonLink}
            onChange={e => set('lessonLink', e.target.value)} />

          {/* Расписание */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Расписание</span>
              <button type="button" onClick={addSlot}
                className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer">
                + Добавить слот
              </button>
            </div>
            <div className="space-y-2">
              {schedule.map((sl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={sl.day}
                    onChange={e => updateSlot(i, 'day', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-[#131c35] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <input
                    type="time"
                    value={sl.time}
                    onChange={e => updateSlot(i, 'time', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
                  />
                  <button type="button" onClick={() => removeSlot(i)}
                    className="text-slate-500 hover:text-red-400 cursor-pointer p-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Button>
            <Button type="submit" loading={saving} className="flex-1">Создать</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
