import { useState, useCallback } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getHomework, createHomework, deleteHomework, submitHomework, getSubmissions, gradeSubmission } from '../../api/homework.api'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function HomeworkPage() {
  const { isTeacher } = useAuth()
  const { data: homework, loading, reload } = useFetch(getHomework)
  const [createModal, setCreateModal] = useState(false)
  const [selected,    setSelected]    = useState(null)

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Домашние задания</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isTeacher ? 'Создание и проверка работ' : 'Мои задания и оценки'}
          </p>
        </div>
        {isTeacher && (
          <Button size="sm" onClick={() => setCreateModal(true)}>+ Создать ДЗ</Button>
        )}
      </div>

      {loading ? <PageSpinner /> : !homework?.length ? (
        <EmptyState
          emoji="✏️"
          title="Заданий пока нет"
          text={isTeacher
            ? 'Создайте домашнее задание, привязав его к уроку.'
            : 'Преподаватель ещё не задал домашних работ.'}
          action={isTeacher
            ? <Button size="sm" onClick={() => setCreateModal(true)}>Создать ДЗ</Button>
            : null}
        />
      ) : (
        <div className="space-y-3">
          {homework.map(hw =>
            isTeacher
              ? <TeacherHWCard key={hw.id} hw={hw} onView={() => setSelected(hw)} onDelete={reload} />
              : <StudentHWCard key={hw.id} hw={hw} onSubmitted={reload} />
          )}
        </div>
      )}

      {isTeacher && (
        <>
          <CreateHWModal      open={createModal} onClose={() => setCreateModal(false)} onCreated={reload} />
          <SubmissionsModal   hw={selected}      onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}

/* ── Карточка ДЗ для учителя ────────────────────────────────── */
function TeacherHWCard({ hw, onView, onDelete }) {
  const [deleting,     setDeleting]     = useState(false)
  const [confirmOpen,  setConfirmOpen]  = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteHomework(hw.id); onDelete() }
    catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  return (
    <div
      onClick={onView}
      className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] hover:border-brand-500/30 transition-all cursor-pointer group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{hw.description}</p>
        {hw.deadline && (
          <p className="text-xs text-slate-400 mt-1">📅 До {formatDate(hw.deadline?.slice(0, 10))}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 hidden sm:block">Просмотр сдач</span>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all cursor-pointer p-1 disabled:opacity-50"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" strokeLinecap="round"/>
          </svg>
        </button>
        <svg className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
        </svg>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Удалить задание?"
        message="Это удалит задание и все сданные работы студентов."
        busy={deleting}
      />
    </div>
  )
}

/* ── Карточка ДЗ для студента со сдачей ────────────────────── */
function StudentHWCard({ hw, onSubmitted }) {
  // Бэкенд включает HomeworkSubmissions[] (отфильтрованные по studentId)
  const submission = hw.HomeworkSubmissions?.[0] ?? null

  const [open,       setOpen]       = useState(false)
  const [file,       setFile]       = useState(null)   // File object
  const [comment,    setComment]    = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Максимум 10 МБ
    if (f.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 10 МБ)')
      return
    }
    setError('')
    setFile(f)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      let fileUrl = null
      if (file) {
        setUploading(true)
        fileUrl = await uploadToCloudinary(file)
        setUploading(false)
      }
      await submitHomework(hw.id, { fileUrl, comment: comment.trim() || null })
      onSubmitted()
      setOpen(false)
    } catch (e) {
      setUploading(false)
      setError(e.response?.data?.error || e.message || 'Ошибка сдачи')
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = hw.deadline && new Date(hw.deadline) < new Date()

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      {/* Шапка */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-white leading-snug">{hw.description}</p>
          <StatusBadge submission={submission} isOverdue={isOverdue} />
        </div>

        {hw.deadline && (
          <p className={`text-xs mt-1 ${isOverdue && !submission ? 'text-red-400' : 'text-slate-400'}`}>
            📅 До {formatDate(hw.deadline.slice(0, 10))}
            {isOverdue && !submission && ' — просрочено'}
          </p>
        )}

        {/* Если уже сдано — показываем детали */}
        {submission && (
          <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-1.5">
            {submission.fileUrl && (
              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.17a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round"/>
                </svg>
                Открыть прикреплённый файл
              </a>
            )}
            {submission.comment && (
              <p className="text-xs text-slate-300">💬 {submission.comment}</p>
            )}
            {submission.status === 'graded' && (
              <p className="text-xs font-semibold text-brand-300">🏆 Оценка: {submission.grade}/100</p>
            )}
          </div>
        )}

        {/* Кнопка сдать */}
        {!submission && (
          <button onClick={() => setOpen(o => !o)}
            className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors cursor-pointer font-medium">
            {open ? '↑ Скрыть' : '📤 Сдать задание'}
          </button>
        )}
      </div>

      {/* Форма сдачи — разворачивается */}
      {open && !submission && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
          {/* Прикрепить файл */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              Прикрепить файл (PDF или фото, необязательно, макс. 10 МБ)
            </label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
              file
                ? 'border-brand-500/50 bg-brand-600/10'
                : 'border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.07]'
            }`}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-slate-400">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.17a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round"/>
              </svg>
              <span className="text-sm text-slate-300 truncate flex-1">
                {file ? file.name : 'Выбрать файл…'}
              </span>
              {file && (
                <button type="button" onClick={(e) => { e.preventDefault(); setFile(null) }}
                  className="text-slate-500 hover:text-red-400 text-xs shrink-0">✕</button>
              )}
              <input type="file" accept="application/pdf,image/*"
                className="sr-only" onChange={handleFileChange} />
            </label>
          </div>

          {/* Комментарий */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Комментарий (необязательно)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={2} placeholder="Напишите что-нибудь учителю…"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white text-sm placeholder:text-slate-500 outline-none focus:border-brand-400 resize-none" />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1"
              onClick={() => { setOpen(false); setFile(null); setComment(''); setError('') }}>
              Отмена
            </Button>
            <Button size="sm" className="flex-1"
              loading={submitting || uploading}
              onClick={handleSubmit}>
              {uploading ? 'Загрузка файла…' : 'Сдать'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ submission, isOverdue }) {
  if (!submission) {
    return (
      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
        isOverdue
          ? 'bg-red-500/10 text-red-400 border-red-500/20'
          : 'bg-white/[0.06] text-slate-400 border-white/[0.08]'
      }`}>
        {isOverdue ? 'Просрочено' : 'Не сдано'}
      </span>
    )
  }
  if (submission.status === 'graded') {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-300 border border-brand-600/30">
        ✓ Оценено: {submission.grade}/100
      </span>
    )
  }
  return (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
      ✓ На проверке
    </span>
  )
}

/* ── Создание ДЗ (только teacher) ───────────────────────────── */
function CreateHWModal({ open, onClose, onCreated }) {
  const { data: lessons }    = useFetch(getLessons, [])
  const { data: indLessons } = useFetch(getIndividualLessons, [])
  const [form, setForm] = useState({ description: '', deadline: '', lessonType: 'group', lessonId: '', individualLessonId: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return setError('Введите описание')
    const isGroup = form.lessonType === 'group'
    if (isGroup && !form.lessonId)               return setError('Выберите групповой урок')
    if (!isGroup && !form.individualLessonId)     return setError('Выберите индивидуальный урок')
    setSaving(true); setError('')
    try {
      await createHomework({
        description:        form.description.trim(),
        deadline:           form.deadline || null,
        lessonId:           isGroup ? form.lessonId : null,
        individualLessonId: isGroup ? null : form.individualLessonId,
      })
      onCreated(); onClose()
      setForm({ description: '', deadline: '', lessonType: 'group', lessonId: '', individualLessonId: '' })
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-white mb-5">Новое ДЗ</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Описание задания</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Что нужно сделать..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm placeholder:text-slate-500 outline-none focus:border-brand-400 resize-none"
            />
          </div>

          {/* Тип урока */}
          <div className="flex gap-2">
            {['group', 'individual'].map(t => (
              <button key={t} type="button"
                onClick={() => set('lessonType', t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.lessonType === t
                    ? 'bg-brand-600/25 border-brand-500/50 text-brand-300'
                    : 'bg-white/[0.04] border-white/[0.10] text-slate-400 hover:text-white'
                }`}>
                {t === 'group' ? 'Групповой урок' : 'Инд. урок'}
              </button>
            ))}
          </div>

          {form.lessonType === 'group' ? (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Урок</label>
              <select
                value={form.lessonId}
                onChange={e => set('lessonId', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#131c35] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
              >
                <option value="">Выберите групповой урок</option>
                {(lessons || []).map(l => (
                  <option key={l.id} value={l.id}>
                    {formatDate(l.date)} {l.time} — {l.topic || l.Group?.name || 'Урок'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Индивидуальный урок</label>
              <select
                value={form.individualLessonId}
                onChange={e => set('individualLessonId', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#131c35] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
              >
                <option value="">Выберите урок</option>
                {(indLessons || []).map(l => (
                  <option key={l.id} value={l.id}>
                    {formatDate(l.date)} {l.time} — {l.topic || l.student?.name || 'Урок'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1">Дедлайн (необязательно)</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400" />
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

/* ── Просмотр сдач (только teacher) ─────────────────────────── */
function SubmissionsModal({ hw, onClose }) {
  const { data: subs, loading, reload } = useFetch(
    useCallback(() => hw ? getSubmissions(hw.id) : Promise.resolve([]), [hw?.id]),
    [hw?.id]
  )
  const [grades, setGrades] = useState({})
  const [saving, setSaving] = useState(null)

  const handleGrade = async (subId) => {
    const grade = parseInt(grades[subId])
    if (isNaN(grade) || grade < 0 || grade > 100) return
    setSaving(subId)
    try { await gradeSubmission(hw.id, subId, grade); reload() }
    catch (e) { console.error(e) }
    finally { setSaving(null) }
  }

  return (
    <Modal open={!!hw} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Сдачи</h3>
        {hw && <p className="text-sm text-slate-400 mb-5 truncate">{hw.description}</p>}

        {loading ? <PageSpinner /> : !subs?.length ? (
          <EmptyState emoji="📭" title="Сдач пока нет" />
        ) : (
          <div className="space-y-3">
            {subs.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm font-medium text-white truncate">{s.student?.name ?? s.studentId}</span>
                  {s.status === 'graded'
                    ? <span className="text-sm font-semibold text-brand-300">{s.grade}/100</span>
                    : <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-white/[0.07]">Не проверено</span>
                  }
                </div>
                {s.comment && <p className="text-xs text-slate-400 mb-2">{s.comment}</p>}
                <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-300 underline break-all">
                  Открыть файл
                </a>
                {s.status !== 'graded' && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="number" min="0" max="100" placeholder="Оценка"
                      value={grades[s.id] || ''}
                      onChange={e => setGrades(g => ({ ...g, [s.id]: e.target.value }))}
                      className="w-28 h-8 px-3 rounded-lg bg-white/[0.07] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
                    />
                    <Button size="sm" loading={saving === s.id} onClick={() => handleGrade(s.id)}>
                      Поставить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
