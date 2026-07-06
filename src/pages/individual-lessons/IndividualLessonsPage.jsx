import { useState, useMemo, useEffect } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import {
  getIndividualLessons,
  createIndividualLesson,
  updateIndividualLesson,
  deleteIndividualLesson,
} from '../../api/individualLessons.api'
import { getMyStudents } from '../../api/students.api'
import { formatDate } from '../../utils/formatDate'
import { toast, errMsg } from '../../utils/toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function IndividualLessonsPage() {
  const { isTeacher } = useAuth()
  const { data: lessons, loading, reload } = useFetch(getIndividualLessons)
  const { data: students } = useFetch(
    () => isTeacher ? getMyStudents() : Promise.resolve([]),
    [isTeacher]
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null) // урок для редактирования
  const [toDelete, setToDelete] = useState(null)
  const [delBusy, setDelBusy]   = useState(false)

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit   = (l) => { setEditing(l);   setFormOpen(true) }

  const handleDelete = async () => {
    setDelBusy(true)
    try {
      await deleteIndividualLesson(toDelete.id)
      toast.success('Урок удалён')
      setToDelete(null)
      reload()
    } catch (e) { toast.error(errMsg(e, 'Ошибка удаления')) }
    finally { setDelBusy(false) }
  }

  // Группировка по месяцу (свежие сверху)
  const groups = useMemo(() => {
    const byMonth = new Map()
    ;[...(lessons || [])]
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''))
      .forEach(l => {
        const key = (l.date || '').slice(0, 7)
        if (!byMonth.has(key)) byMonth.set(key, [])
        byMonth.get(key).push(l)
      })
    return [...byMonth.entries()]
  }, [lessons])

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Индивидуальные уроки</h1>
          <p className="text-sm text-slate-500 mt-0.5">Разовые занятия и уроки из серий — создавайте вручную или по расписанию курса</p>
        </div>
        {isTeacher && <Button onClick={openCreate}>+ Создать урок</Button>}
      </div>

      {loading ? <SkeletonList /> : !lessons?.length ? (
        <EmptyState
          emoji="📅"
          title="Уроков пока нет"
          text={isTeacher
            ? 'Создайте разовый урок кнопкой выше — или сгенерируйте серию в разделе «Инд. курсы».'
            : 'Здесь появятся ваши индивидуальные занятия.'}
          action={isTeacher ? <Button onClick={openCreate}>Создать урок</Button> : null}
        />
      ) : (
        <div className="max-w-4xl space-y-6">
          {groups.map(([month, items]) => (
            <div key={month}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 capitalize">
                {monthTitle(month)} · {items.length}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map(l => (
                  <LessonCard key={l.id} l={l} isTeacher={isTeacher}
                    onEdit={() => openEdit(l)} onDelete={() => setToDelete(l)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <LessonFormModal
          open={formOpen}
          editing={editing}
          students={students || []}
          onClose={() => setFormOpen(false)}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить урок?"
        message="Урок и связанные с ним данные (посещаемость, ДЗ) будут удалены."
        busy={delBusy}
      />
    </div>
  )
}

function LessonCard({ l, isTeacher, onEdit, onDelete }) {
  const isPast = l.date && new Date(`${l.date}T${l.time || '00:00'}`) < new Date()
  return (
    <div className="group flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 leading-none ${
        isPast ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'}`}>
        <span className="text-lg font-bold">{l.date?.slice(8)}</span>
        <span className="text-[10px] mt-0.5">{l.date?.slice(5, 7)}.{l.date?.slice(2, 4)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${l.topic ? 'text-slate-900' : 'text-slate-400 italic'}`}>
          {l.topic || 'Без темы'}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">
          {l.time}{l.student?.name && ` · ${l.student.name}`}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {l.pricePerLesson > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{l.pricePerLesson} zł</span>
          )}
          {l.individualCourseId && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">серия</span>
          )}
          {l.lessonLink && (
            <a href={l.lessonLink} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-blue-600 hover:text-blue-700">ссылка →</a>
          )}
        </div>
      </div>
      {isTeacher && (
        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} title="Редактировать"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 cursor-pointer">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onDelete} title="Удалить"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

/* Создание разового урока или редактирование существующего */
function LessonFormModal({ open, editing, students, onClose, onSaved }) {
  const isEdit = !!editing
  const blank = { studentId: '', mode: 'existing', phName: '', phContact: '', date: '', time: '18:00', topic: '', pricePerLesson: '', lessonLink: '' }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Инициализация при открытии
  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        studentId: '', mode: 'existing', phName: '', phContact: '',
        date: editing.date || '', time: editing.time || '18:00',
        topic: editing.topic || '', pricePerLesson: editing.pricePerLesson ?? '',
        lessonLink: editing.lessonLink || '',
      })
    } else {
      setForm(blank)
    }
    setError('')
  }, [open, editing])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time) return setError('Укажите дату и время')

    setSaving(true); setError('')
    try {
      if (isEdit) {
        await updateIndividualLesson(editing.id, {
          date: form.date, time: form.time,
          topic: form.topic.trim() || null,
          pricePerLesson: parseFloat(form.pricePerLesson) || 0,
          lessonLink: form.lessonLink.trim() || null,
        })
        toast.success('Урок обновлён')
      } else {
        const body = {
          date: form.date, time: form.time,
          topic: form.topic.trim() || null,
          pricePerLesson: parseFloat(form.pricePerLesson) || 0,
          lessonLink: form.lessonLink.trim() || null,
        }
        if (form.mode === 'placeholder') {
          if (!form.phName.trim()) { setSaving(false); return setError('Введите имя ученика') }
          body.placeholder = { name: form.phName.trim(), contact: form.phContact.trim() || null }
        } else {
          if (!form.studentId) { setSaving(false); return setError('Выберите ученика') }
          body.studentId = form.studentId
        }
        await createIndividualLesson(body)
        toast.success('Урок создан')
      }
      onSaved()
      onClose()
    } catch (e2) {
      setError(errMsg(e2, 'Ошибка сохранения'))
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{isEdit ? 'Редактировать урок' : 'Новый индивидуальный урок'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {isEdit ? (
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              Ученик: <span className="font-medium text-slate-900">{editing.student?.name || '—'}</span>
            </div>
          ) : (
            <>
              {/* Кто ученик */}
              <div className="flex gap-2">
                {[['existing', 'Мой ученик'], ['placeholder', 'Заглушка']].map(([m, label]) => (
                  <button key={m} type="button" onClick={() => set('mode', m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.mode === m ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {form.mode === 'existing' ? (
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Ученик</label>
                  <select value={form.studentId} onChange={e => set('studentId', e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
                    <option value="">— выбрать —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.username ? ` (@${s.username})` : ''}</option>
                    ))}
                  </select>
                  {!students.length && (
                    <p className="text-xs text-slate-400 mt-1">Учеников пока нет — используйте «Заглушка».</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Имя ученика" value={form.phName} onChange={e => set('phName', e.target.value)} />
                  <Input label="Контакт (необяз.)" value={form.phContact} onChange={e => set('phContact', e.target.value)} />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Дата</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Время</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <Input label="Тема (необязательно)" value={form.topic} onChange={e => set('topic', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Цена, zł" type="number" value={form.pricePerLesson} onChange={e => set('pricePerLesson', e.target.value)} />
            <Input label="Ссылка (необяз.)" value={form.lessonLink} onChange={e => set('lessonLink', e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Button>
            <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'Сохранить' : 'Создать'}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function monthTitle(ym) {
  if (!ym) return '—'
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}
