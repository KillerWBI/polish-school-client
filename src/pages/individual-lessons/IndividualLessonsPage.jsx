import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useApiQuery from '../../hooks/useApiQuery'
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
  const { t, i18n } = useTranslation('teacher')
  const { isTeacher } = useAuth()
  const { data: lessons, loading, reload } = useApiQuery(['individual-lessons'], getIndividualLessons)
  const { data: students } = useApiQuery(['my-students'], getMyStudents, { enabled: isTeacher })

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
      toast.success(t('indLessons.deleted'))
      setToDelete(null)
      reload()
    } catch (e) { toast.error(errMsg(e, t('indLessons.deleteError'))) }
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
          <h1 className="text-2xl font-semibold text-slate-900">{t('indLessons.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('indLessons.subtitle')}</p>
        </div>
        {isTeacher && <Button onClick={openCreate}>{t('indLessons.createBtn')}</Button>}
      </div>

      {loading ? <SkeletonList /> : !lessons?.length ? (
        <EmptyState
          emoji="📅"
          title={t('indLessons.emptyTitle')}
          text={isTeacher ? t('indLessons.emptyTeacher') : t('indLessons.emptyStudent')}
          action={isTeacher ? <Button onClick={openCreate}>{t('indLessons.createShort')}</Button> : null}
        />
      ) : (
        <div className="max-w-[1240px] space-y-6">
          {groups.map(([month, items]) => (
            <div key={month}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 capitalize">
                {monthTitle(month, i18n.language)} · {items.length}
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
        title={t('indLessons.confirmTitle')}
        message={t('indLessons.confirmMsg')}
        busy={delBusy}
      />
    </div>
  )
}

function LessonCard({ l, isTeacher, onEdit, onDelete }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
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
          {l.topic || t('indLessons.noTopic')}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">
          {l.time}{l.student?.name && ` · ${l.student.name}`}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {l.pricePerLesson > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{l.pricePerLesson} zł</span>
          )}
          {l.individualCourseId && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{t('indLessons.series')}</span>
          )}
          {l.lessonLink && (
            <a href={l.lessonLink} target="_blank" rel="noopener noreferrer"
              className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
              {t('indLessons.enterLesson')}
            </a>
          )}
          {l.lessonLink && isTeacher && (
            <span className="text-[10px] text-slate-400">{t('indLessons.moderatorHint')}</span>
          )}
        </div>
      </div>
      {isTeacher && (
        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} title={tc('edit')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 cursor-pointer">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onDelete} title={tc('delete')}
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
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const isEdit = !!editing
  const blank = { studentId: '', mode: 'existing', phName: '', phContact: '', date: '', time: '18:00', topic: '', pricePerLesson: '', lessonLink: '' }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [linkMode, setLinkMode] = useState('auto') // 'auto' | 'custom' — только для создания
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Инициализация при открытии
  useEffect(() => {
    if (!open) return
    if (editing) {
      setLinkMode('custom')
      setForm({
        studentId: '', mode: 'existing', phName: '', phContact: '',
        date: editing.date || '', time: editing.time || '18:00',
        topic: editing.topic || '', pricePerLesson: editing.pricePerLesson ?? '',
        lessonLink: editing.lessonLink || '',
      })
    } else {
      setLinkMode('auto')
      setForm(blank)
    }
    setError('')
  }, [open, editing])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time) return setError(t('indLessons.validDateTime'))

    setSaving(true); setError('')
    try {
      if (isEdit) {
        await updateIndividualLesson(editing.id, {
          date: form.date, time: form.time,
          topic: form.topic.trim() || null,
          pricePerLesson: parseFloat(form.pricePerLesson) || 0,
          lessonLink: form.lessonLink.trim() || null,
        })
        toast.success(t('indLessons.updated'))
      } else {
        if (linkMode === 'custom' && !form.lessonLink.trim()) {
          setSaving(false)
          return setError(t('indLessons.validLink'))
        }
        const body = {
          date: form.date, time: form.time,
          topic: form.topic.trim() || null,
          pricePerLesson: parseFloat(form.pricePerLesson) || 0,
          lessonLink: linkMode === 'custom' ? form.lessonLink.trim() : undefined,
        }
        if (form.mode === 'placeholder') {
          if (!form.phName.trim()) { setSaving(false); return setError(t('indLessons.validPhName')) }
          body.placeholder = { name: form.phName.trim(), contact: form.phContact.trim() || null }
        } else {
          if (!form.studentId) { setSaving(false); return setError(t('indLessons.validStudent')) }
          body.studentId = form.studentId
        }
        await createIndividualLesson(body)
        toast.success(t('indLessons.created'))
      }
      onSaved()
      onClose()
    } catch (e2) {
      setError(errMsg(e2, t('indLessons.saveError')))
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{isEdit ? t('indLessons.editTitle') : t('indLessons.newTitle')}</h2>
        <form onSubmit={submit} className="space-y-3">
          {isEdit ? (
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              {t('indLessons.studentField')} <span className="font-medium text-slate-900">{editing.student?.name || '—'}</span>
            </div>
          ) : (
            <>
              {/* Кто ученик */}
              <div className="flex gap-2">
                {[['existing', t('indLessons.modeExisting')], ['placeholder', t('indLessons.modePlaceholder')]].map(([m, label]) => (
                  <button key={m} type="button" onClick={() => set('mode', m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.mode === m ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {form.mode === 'existing' ? (
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indLessons.studentLabel')}</label>
                  <select value={form.studentId} onChange={e => set('studentId', e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
                    <option value="">{t('indLessons.choose')}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.username ? ` (@${s.username})` : ''}</option>
                    ))}
                  </select>
                  {!students.length && (
                    <p className="text-xs text-slate-400 mt-1">{t('indLessons.noStudentsHint')}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input label={t('indLessons.phName')} value={form.phName} onChange={e => set('phName', e.target.value)} />
                  <Input label={t('indLessons.phContact')} value={form.phContact} onChange={e => set('phContact', e.target.value)} />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indLessons.dateLabel')}</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indLessons.timeLabel')}</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <Input label={t('indLessons.fTopic')} value={form.topic} onChange={e => set('topic', e.target.value)} />
          <Input label={t('indLessons.fPrice')} type="number" value={form.pricePerLesson} onChange={e => set('pricePerLesson', e.target.value)} />

          {/* Ссылка на урок */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">{t('indLessons.linkLabel')}</label>
            {isEdit ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{t('indLessons.emptyNoLink')}</span>
                  <button type="button"
                    onClick={() => set('lessonLink', `https://meet.jit.si/lf-${crypto.randomUUID()}`)}
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                    {t('indLessons.newJitsi')}
                  </button>
                </div>
                <input type="text" value={form.lessonLink} onChange={e => set('lessonLink', e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500 placeholder:text-slate-400" />
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  {[['auto', t('indLessons.linkAuto')], ['custom', t('indLessons.linkCustom')]].map(([m, label]) => (
                    <button key={m} type="button" onClick={() => setLinkMode(m)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        linkMode === m
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                {linkMode === 'auto' ? (
                  <p className="text-xs text-slate-400 italic">{t('indLessons.autoHint')}</p>
                ) : (
                  <input type="url" value={form.lessonLink} onChange={e => set('lessonLink', e.target.value)}
                    placeholder={t('indLessons.customPlaceholder')}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500 placeholder:text-slate-400" />
                )}
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{isEdit ? tc('save') : tc('create')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function monthTitle(ym, lng = 'ru') {
  if (!ym) return '—'
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(lng, { month: 'long', year: 'numeric' })
}
