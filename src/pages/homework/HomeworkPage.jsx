import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import useApiQuery from '../../hooks/useApiQuery'
import usePagedList from '../../hooks/usePagedList'
import useAuth from '../../hooks/useAuth'
import { getHomework, createHomework, deleteHomework, submitHomework, getSubmissions, gradeSubmission, submitHomeworkQuizAttempt, getHomeworkQuizAttempts } from '../../api/homework.api'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { getQuizzes } from '../../api/quizzes.api'
import QuizRunner from '../quiz/QuizRunner'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { PageSpinner } from '../../components/ui/Spinner'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function HomeworkPage() {
  const { t } = useTranslation('teacher')
  const { isTeacher } = useAuth()
  const fetchHw = useCallback((page, limit) => getHomework({ page, limit }), [])
  const { items: homework, loading, loadingMore, hasMore, loadMore, reload } = usePagedList(fetchHw)
  const [createModal, setCreateModal] = useState(false)
  const [selected,    setSelected]    = useState(null)

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('homework.title')}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isTeacher ? t('homework.subtitleTeacher') : t('homework.subtitleStudent')}
          </p>
        </div>
        {isTeacher && (
          <Button size="sm" onClick={() => setCreateModal(true)}>{t('homework.createBtn')}</Button>
        )}
      </div>

      {loading ? <SkeletonList /> : !homework?.length ? (
        <EmptyState
          emoji="✏️"
          title={t('homework.emptyTitle')}
          text={isTeacher ? t('homework.emptyTeacher') : t('homework.emptyStudent')}
          action={isTeacher
            ? <Button size="sm" onClick={() => setCreateModal(true)}>{t('homework.createShort')}</Button>
            : null}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 items-start">
          {homework.map(hw =>
            isTeacher
              ? <TeacherHWCard key={hw.id} hw={hw} onView={() => setSelected(hw)} onDelete={reload} />
              : <StudentHWCard key={hw.id} hw={hw} onSubmitted={reload} />
          )}
          {hasMore && (
            <div className="pt-2 flex justify-center">
              <Button variant="secondary" size="sm" loading={loadingMore} onClick={loadMore}>
                {t('homework.loadMore')}
              </Button>
            </div>
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
  const { t } = useTranslation('teacher')
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
      className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{hw.description}</p>
        {hw.deadline && (
          <p className="text-xs text-slate-400 mt-1">📅 {t('homework.due')} {formatDate(hw.deadline?.slice(0, 10))}</p>
        )}
        {hw.quiz && <p className="text-xs text-blue-600 mt-1">🧪 {t('homework.quizAttached')}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 hidden sm:block">{t('homework.viewSubs')}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-600 transition-all cursor-pointer p-1 disabled:opacity-50"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" strokeLinecap="round"/>
          </svg>
        </button>
        <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
        </svg>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('homework.confirmTitle')}
        message={t('homework.confirmMsg')}
        busy={deleting}
      />
    </div>
  )
}

/* ── Карточка ДЗ для студента со сдачей ────────────────────── */
function StudentHWCard({ hw, onSubmitted }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  // Бэкенд включает HomeworkSubmissions[] (отфильтрованные по studentId)
  const submission = hw.HomeworkSubmissions?.[0] ?? null

  const [open,       setOpen]       = useState(false)
  const [file,       setFile]       = useState(null)   // File object
  const [comment,    setComment]    = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [quizOpen,   setQuizOpen]   = useState(false)
  const [quizDone,   setQuizDone]   = useState(false)

  // Прохождение прикреплённого теста: «Проверить» в QuizRunner шлёт ответы+результат учителю.
  const takeAttempt = async (answers, score, total) => {
    try {
      await submitHomeworkQuizAttempt(hw.id, { answers, score, total })
      toast.success(t('homework.quizSent'))
      setQuizDone(true)
    } catch (e) {
      toast.error(e.response?.data?.error || t('homework.quizSendFail'))
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Максимум 10 МБ
    if (f.size > 10 * 1024 * 1024) {
      setError(t('homework.fileTooBig'))
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
      setError(e.response?.data?.error || e.message || t('homework.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = hw.deadline && new Date(hw.deadline) < new Date()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Шапка */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900 leading-snug">{hw.description}</p>
          <StatusBadge submission={submission} isOverdue={isOverdue} />
        </div>

        {hw.deadline && (
          <p className={`text-xs mt-1 ${isOverdue && !submission ? 'text-red-600' : 'text-slate-400'}`}>
            📅 {t('homework.due')} {formatDate(hw.deadline.slice(0, 10))}
            {isOverdue && !submission && ` — ${t('homework.overdueWord')}`}
          </p>
        )}

        {/* Прикреплённый тест */}
        {hw.quiz && (
          <div className="mt-3">
            {quizDone ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">✓ {t('homework.quizDone')}</span>
            ) : (
              <button onClick={() => setQuizOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                📝 {t('homework.takeQuiz')}
              </button>
            )}
          </div>
        )}

        {/* Если уже сдано — показываем детали */}
        {submission && (
          <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
            {submission.fileUrl && (
              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.17a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round"/>
                </svg>
                {t('homework.openAttached')}
              </a>
            )}
            {submission.comment && (
              <p className="text-xs text-slate-600">💬 {submission.comment}</p>
            )}
            {submission.status === 'graded' && (
              <p className="text-xs font-semibold text-blue-600">🏆 {t('homework.grade', { grade: submission.grade })}</p>
            )}
          </div>
        )}

        {/* Кнопка сдать */}
        {!submission && (
          <button onClick={() => setOpen(o => !o)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer font-medium">
            {open ? t('homework.hideForm') : t('homework.submitAssignment')}
          </button>
        )}
      </div>

      {/* Форма сдачи — разворачивается */}
      {open && !submission && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-200 pt-4">
          {/* Прикрепить файл */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              {t('homework.attachLabel')}
            </label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
              file
                ? 'border-blue-200 bg-blue-50'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-slate-400">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.17a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round"/>
              </svg>
              <span className="text-sm text-slate-600 truncate flex-1">
                {file ? file.name : t('homework.chooseFile')}
              </span>
              {file && (
                <button type="button" onClick={(e) => { e.preventDefault(); setFile(null) }}
                  className="text-slate-500 hover:text-red-600 text-xs shrink-0">✕</button>
              )}
              <input type="file" accept="application/pdf,image/*"
                className="sr-only" onChange={handleFileChange} />
            </label>
          </div>

          {/* Комментарий */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">{t('homework.commentLabel')}</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={2} placeholder={t('homework.commentPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500 resize-none" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1"
              onClick={() => { setOpen(false); setFile(null); setComment(''); setError('') }}>
              {tc('cancel')}
            </Button>
            <Button size="sm" className="flex-1"
              loading={submitting || uploading}
              onClick={handleSubmit}>
              {uploading ? t('homework.uploading') : t('homework.submit')}
            </Button>
          </div>
        </div>
      )}

      {/* Прохождение прикреплённого теста */}
      <Modal open={quizOpen} onClose={() => setQuizOpen(false)} maxWidth="max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{hw.quiz?.topic}</h3>
          <p className="text-sm text-slate-400 mb-4">{t('homework.quizModalHint')}</p>
          {hw.quiz && <QuizRunner quiz={hw.quiz} onCheck={takeAttempt} />}
        </div>
      </Modal>
    </div>
  )
}

function StatusBadge({ submission, isOverdue }) {
  const { t } = useTranslation('teacher')
  if (!submission) {
    return (
      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
        isOverdue
          ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-slate-50 text-slate-400 border-slate-200'
      }`}>
        {isOverdue ? t('homework.overdueBadge') : t('homework.notSubmitted')}
      </span>
    )
  }
  if (submission.status === 'graded') {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        ✓ {t('homework.gradedBadge', { grade: submission.grade })}
      </span>
    )
  }
  return (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      ✓ {t('homework.reviewing')}
    </span>
  )
}

/* ── Создание ДЗ (только teacher) ───────────────────────────── */
function CreateHWModal({ open, onClose, onCreated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: lessons }    = useApiQuery(['lessons'], getLessons)
  const { data: indLessons } = useApiQuery(['individual-lessons'], getIndividualLessons)
  const { data: quizzes }    = useApiQuery(['quizzes'], getQuizzes)
  const [form, setForm] = useState({ description: '', deadline: '', lessonType: 'group', lessonId: '', individualLessonId: '', quizId: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Прикреплять можно только сохранённые в библиотеку тесты (не пройденные)
  const libraryQuizzes = (quizzes || []).filter(q => !q.taken)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return setError(t('homework.validDesc'))
    const isGroup = form.lessonType === 'group'
    if (isGroup && !form.lessonId)               return setError(t('homework.chooseGroupLesson'))
    if (!isGroup && !form.individualLessonId)     return setError(t('homework.chooseLesson'))
    setSaving(true); setError('')
    try {
      await createHomework({
        description:        form.description.trim(),
        deadline:           form.deadline || null,
        lessonId:           isGroup ? form.lessonId : null,
        individualLessonId: isGroup ? null : form.individualLessonId,
        quizId:             form.quizId || null,
      })
      onCreated(); onClose()
      setForm({ description: '', deadline: '', lessonType: 'group', lessonId: '', individualLessonId: '', quizId: '' })
    } catch (e) {
      setError(e.response?.data?.error || t('homework.createError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{t('homework.newTitle')}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">{t('homework.descLabel')}</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder={t('homework.descPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Тип урока */}
          <div className="flex gap-2">
            {['group', 'individual'].map(t => (
              <button key={t} type="button"
                onClick={() => set('lessonType', t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.lessonType === t
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'
                }`}>
                {t === 'group' ? t('homework.typeGroup') : t('homework.typeIndividual')}
              </button>
            ))}
          </div>

          {form.lessonType === 'group' ? (
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t('homework.lessonLabel')}</label>
              <select
                value={form.lessonId}
                onChange={e => set('lessonId', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
              >
                <option value="">{t('homework.chooseGroupLesson')}</option>
                {(lessons || []).map(l => (
                  <option key={l.id} value={l.id}>
                    {formatDate(l.date)} {l.time} — {l.topic || l.Group?.name || t('homework.lessonFallback')}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t('homework.indLessonLabel')}</label>
              <select
                value={form.individualLessonId}
                onChange={e => set('individualLessonId', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
              >
                <option value="">{t('homework.chooseLesson')}</option>
                {(indLessons || []).map(l => (
                  <option key={l.id} value={l.id}>
                    {formatDate(l.date)} {l.time} — {l.topic || l.student?.name || t('homework.lessonFallback')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1">{t('homework.deadlineLabel')}</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
          </div>

          {/* Прикрепить тест (необязательно) */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">{t('homework.attachQuiz')}</label>
            <select value={form.quizId} onChange={e => set('quizId', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
              <option value="">{t('homework.noQuiz')}</option>
              {libraryQuizzes.map(q => (
                <option key={q.id} value={q.id}>{q.topic} · {t('homework.questionsShort', { n: q.count })}</option>
              ))}
            </select>
            {!libraryQuizzes.length && (
              <p className="text-[11px] text-slate-400 mt-1">{t('homework.noLibraryQuizzes')}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{tc('create')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

/* ── Результаты прикреплённого теста (учитель видит ответы учеников) ── */
function QuizAttempts({ hw }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: attempts, loading } = useApiQuery(['hw-quiz-attempts', hw.id], () => getHomeworkQuizAttempts(hw.id))
  const [openId, setOpenId] = useState(null)

  return (
    <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="text-sm font-semibold text-slate-900 mb-2">🧪 {t('homework.resultsTitle', { topic: hw.quiz.topic })}</div>
      {loading ? (
        <div className="text-sm text-slate-400">{tc('loading')}</div>
      ) : !attempts?.length ? (
        <div className="text-sm text-slate-400">{t('homework.noAttempts')}</div>
      ) : (
        <div className="space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button onClick={() => setOpenId(openId === a.id ? null : a.id)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-900 flex-1 truncate">{a.student?.name ?? '—'}</span>
                {a.total != null && a.total > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    a.score === a.total ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                  }`}>{a.score}/{a.total}</span>
                )}
                <span className="text-xs text-blue-600 shrink-0">{openId === a.id ? t('homework.hide') : t('homework.answers')}</span>
              </button>
              {openId === a.id && (
                <div className="px-3.5 pb-3.5 border-t border-slate-100 pt-3">
                  <QuizRunner quiz={{ topic: a.topic, type: a.type, questions: a.questions }} savedAnswers={a.answers} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Просмотр сдач (только teacher) ─────────────────────────── */
function SubmissionsModal({ hw, onClose }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: subs, loading, reload } = useApiQuery(
    ['hw-submissions', hw?.id], () => getSubmissions(hw.id), { enabled: !!hw }
  )
  const [grades, setGrades]   = useState({})
  const [saving, setSaving]   = useState(null)
  const [editing, setEditing] = useState({}) // subId → правка уже выставленной оценки

  const handleGrade = async (subId) => {
    const grade = parseInt(grades[subId])
    if (isNaN(grade) || grade < 0 || grade > 100) return
    setSaving(subId)
    try {
      await gradeSubmission(hw.id, subId, grade)
      setEditing(e => ({ ...e, [subId]: false }))
      reload()
    } catch (e) { console.error(e) }
    finally { setSaving(null) }
  }

  return (
    <Modal open={!!hw} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('homework.subsTitle')}</h3>
        {hw && <p className="text-sm text-slate-400 mb-5 truncate">{hw.description}</p>}

        {/* Результаты прикреплённого теста (с ответами учеников) */}
        {hw?.quiz && <QuizAttempts hw={hw} />}

        {loading ? <PageSpinner /> : !subs?.length ? (
          <EmptyState emoji="📭" title={t('homework.noSubs')} />
        ) : (
          <div className="space-y-3">
            {subs.map(s => {
              const isGraded  = s.status === 'graded'
              const isEditing = !isGraded || editing[s.id] // ввод виден: не оценено ИЛИ режим правки
              return (
                <div key={s.id} className="p-4 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{s.student?.name ?? s.studentId}</span>
                    {isGraded ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-blue-600">{s.grade}/100</span>
                        {!editing[s.id] && (
                          <button
                            onClick={() => {
                              setEditing(e => ({ ...e, [s.id]: true }))
                              setGrades(g => ({ ...g, [s.id]: String(s.grade) })) // префилл текущей
                            }}
                            className="text-xs text-slate-400 hover:text-slate-900 underline cursor-pointer">
                            {t('homework.change')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-50">{t('homework.notChecked')}</span>
                    )}
                  </div>
                  {s.comment && <p className="text-xs text-slate-400 mb-2">{s.comment}</p>}
                  <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline break-all">
                    {t('homework.openFile')}
                  </a>
                  {isEditing && (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="number" min="0" max="100" placeholder={t('homework.gradePlaceholder')}
                        value={grades[s.id] || ''}
                        onChange={e => setGrades(g => ({ ...g, [s.id]: e.target.value }))}
                        className="w-28 h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
                      />
                      <Button size="sm" loading={saving === s.id} onClick={() => handleGrade(s.id)}>
                        {isGraded ? tc('save') : t('homework.setGrade')}
                      </Button>
                      {isGraded && (
                        <button
                          onClick={() => setEditing(e => ({ ...e, [s.id]: false }))}
                          className="text-xs text-slate-400 hover:text-slate-900 cursor-pointer">
                          {tc('cancel')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
