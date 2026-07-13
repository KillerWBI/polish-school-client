import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import {
  getIndividualCourse, updateIndividualCourse,
  deleteIndividualCourse, generateIndividualLessons,
} from '../../api/individualCourses.api'
import { getIndividualLessons, createIndividualLesson } from '../../api/individualLessons.api'
import { formatDate } from '../../utils/formatDate'
import { toast, errMsg } from '../../utils/toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

// value = номер дня (0=Вс..6=Сб); порядок отображения Пн→Вс
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]

export default function IndividualCourseDetailPage() {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { id } = useParams()
  const navigate = useNavigate()
  const { isTeacher } = useAuth()
  const weekdays = t('groups.weekdays', { returnObjects: true })

  const { data: course,   loading,   reload }      = useFetch(() => getIndividualCourse(id), [id])
  const student = course?.student // приходит из include курса (Student.id → name)
  const { data: lessons,  reload: reloadLessons }  = useFetch(
    () => getIndividualLessons({ individualCourseId: id }),
    [id]
  )

  const [editOpen,    setEditOpen]    = useState(false)
  const [genOpen,     setGenOpen]     = useState(false)
  const [addOpen,     setAddOpen]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [delBusy,     setDelBusy]     = useState(false)

  if (loading) return <div className="p-5 sm:p-8 max-w-3xl"><SkeletonList count={4} /></div>
  if (!course) {
    return (
      <div className="p-5 sm:p-8">
        <EmptyState emoji="🔍" title={t('indCourseDetail.notFoundTitle')} text={t('indCourseDetail.notFoundText')} />
      </div>
    )
  }

  const handleDelete = async () => {
    setDelBusy(true)
    try {
      await deleteIndividualCourse(id)
      toast.success(t('indCourseDetail.deletedToast'))
      navigate('/individual-courses')
    } catch (e) {
      toast.error(errMsg(e, t('indCourseDetail.deleteError')))
    } finally {
      setDelBusy(false)
    }
  }

  const schedule = (course.schedule || [])
    .map(s => `${weekdays[s.day] ?? ''} ${s.time}`).join(', ')

  return (
    <div className="p-5 sm:p-8 max-w-4xl">
      {/* Заголовок */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/individual-courses" className="text-xs text-slate-400 hover:text-slate-900 transition-colors">
            {t('indCourseDetail.backAll')}
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            {course.name || (student?.name ? `${t('indCourses.cardPrefix')}${student.name}` : t('indCourses.noName'))}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {student?.name ? t('indCourseDetail.studentLabel', { name: student.name }) : t('indCourseDetail.indCourse')}
          </p>
        </div>
        {isTeacher && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setAddOpen(true)}>{t('indCourseDetail.addLesson')}</Button>
            <Button size="sm" variant="secondary" onClick={() => setGenOpen(true)}>
              {t('indCourseDetail.genSeries')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
              {t('indCourseDetail.edit')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(true)}>
              <span className="text-red-600">{tc('delete')}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Информация о курсе */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <InfoCard label={t('indCourseDetail.infoSchedule')} value={schedule || '—'} />
        <InfoCard label={t('indCourseDetail.infoPrice')} value={`${course.pricePerLesson || 0}`} />
        <InfoCard
          label={t('indCourseDetail.infoLink')}
          value={course.lessonLink
            ? <a href={course.lessonLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{course.lessonLink}</a>
            : '—'}
        />
      </div>

      {/* Уроки курса */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('indCourseDetail.lessonsHeading')}</h2>
        {!lessons?.length ? (
          <EmptyState
            emoji="📅"
            title={t('indCourseDetail.noLessonsTitle')}
            text={isTeacher ? t('indCourseDetail.noLessonsTeacher') : t('indCourseDetail.noLessonsStudent')}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">{t('indCourseDetail.colDate')}</th>
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:table-cell">{t('indCourseDetail.colTime')}</th>
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">{t('indCourseDetail.colTopic')}</th>
                </tr>
              </thead>
              <tbody>
                {[...lessons].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((l, i) => (
                  <tr key={l.id} className={`border-b border-slate-200 last:border-0 ${i % 2 === 0 ? '' : 'bg-white'}`}>
                    <td className="px-5 py-3 text-slate-900">{formatDate(l.date)}</td>
                    <td className="px-5 py-3 text-slate-400 hidden sm:table-cell">{l.time || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{l.topic || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isTeacher && (
        <>
          <AddLessonModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            course={course}
            onCreated={reloadLessons}
          />
          <EditCourseModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            course={course}
            onUpdated={reload}
          />
          <GenerateLessonsModal
            open={genOpen}
            onClose={() => setGenOpen(false)}
            courseId={id}
            onGenerated={reloadLessons}
          />
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            title={t('indCourseDetail.confirmDeleteTitle')}
            message={t('indCourseDetail.confirmDeleteMsg')}
            busy={delBusy}
          />
        </>
      )}
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  )
}

// Добавить один урок в курс (ученик берётся из курса на бэкенде по individualCourseId)
function AddLessonModal({ open, onClose, course, onCreated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [form, setForm] = useState({ date: '', time: '18:00', topic: '', pricePerLesson: '', lessonLink: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time) return setError(t('indCourseDetail.validDateTime'))
    setSaving(true); setError('')
    try {
      await createIndividualLesson({
        individualCourseId: course.id,
        date: form.date,
        time: form.time,
        topic: form.topic.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || course.pricePerLesson || 0,
        lessonLink: form.lessonLink.trim() || course.lessonLink || null,
      })
      toast.success(t('indCourseDetail.lessonAdded'))
      setForm({ date: '', time: '18:00', topic: '', pricePerLesson: '', lessonLink: '' })
      onCreated()
      onClose()
    } catch (e2) {
      setError(errMsg(e2, t('indCourseDetail.createError')))
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">{t('indCourseDetail.newLessonTitle')}</h2>
        <p className="text-sm text-slate-400 mb-5">{t('indCourseDetail.newLessonSub')}</p>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indCourseDetail.dateLabel')}</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indCourseDetail.timeLabel')}</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <Input label={t('indCourseDetail.topicLabel')} value={form.topic} onChange={e => set('topic', e.target.value)} />
          <Input label={t('indCourseDetail.priceDefault', { price: course.pricePerLesson || 0 })} type="number"
            value={form.pricePerLesson} onChange={e => set('pricePerLesson', e.target.value)} />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{t('indCourseDetail.addLessonBtn')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function EditCourseModal({ open, onClose, course, onUpdated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const weekdays = t('groups.weekdays', { returnObjects: true })
  const [form, setForm] = useState({
    name:           course.name || '',
    pricePerLesson: course.pricePerLesson || '',
    lessonLink:     course.lessonLink || '',
  })
  const [schedule, setSchedule] = useState(course.schedule || [])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addSlot    = () => setSchedule(s => [...s, { day: 1, time: '18:00' }])
  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) =>
    setSchedule(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: key === 'day' ? Number(val) : val } : sl))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await updateIndividualCourse(course.id, {
        name: form.name.trim() || null,
        schedule,
        lessonLink: form.lessonLink.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || 0,
      })
      toast.success(t('indCourseDetail.updated'))
      onUpdated()
      onClose()
    } catch (e) {
      const msg = errMsg(e, t('indCourseDetail.updateError'))
      setError(msg); toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{t('indCourseDetail.editTitle')}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label={t('indCourseDetail.nameLabel')} value={form.name} onChange={e => set('name', e.target.value)} />
          <Input label={t('indCourseDetail.priceLabel')} type="number" value={form.pricePerLesson}
            onChange={e => set('pricePerLesson', e.target.value)} />
          <Input label={t('indCourseDetail.linkLabel')} value={form.lessonLink}
            onChange={e => set('lessonLink', e.target.value)} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">{t('indCourseDetail.scheduleLabel')}</span>
              <button type="button" onClick={addSlot}
                className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                {t('indCourseDetail.addSlot')}
              </button>
            </div>
            <div className="space-y-2">
              {schedule.map((sl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={sl.day}
                    onChange={e => updateSlot(i, 'day', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
                    {DAY_VALUES.map(v => <option key={v} value={v}>{weekdays[v]}</option>)}
                  </select>
                  <input
                    type="time"
                    value={sl.time}
                    onChange={e => updateSlot(i, 'time', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
                  />
                  <button type="button" onClick={() => removeSlot(i)}
                    className="text-slate-500 hover:text-red-600 cursor-pointer p-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{tc('save')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function GenerateLessonsModal({ open, onClose, courseId, onGenerated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const today = new Date().toISOString().slice(0, 10)
  const monthLater = (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1)
    return d.toISOString().slice(0, 10)
  })()

  const [from, setFrom] = useState(today)
  const [to,   setTo]   = useState(monthLater)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await generateIndividualLessons(courseId, from, to)
      toast.success(t('indCourseDetail.genCreated', { n: result?.created ?? 0 }))
      onGenerated()
      onClose()
    } catch (e) {
      toast.error(errMsg(e, t('indCourseDetail.genError')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">{t('indCourseDetail.genTitle')}</h2>
        <p className="text-xs text-slate-400 mb-5">
          {t('indCourseDetail.genSub')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indCourseDetail.dateFrom')}</label>
            <input
              type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">{t('indCourseDetail.dateTo')}</label>
            <input
              type="date" value={to} onChange={e => setTo(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{t('indCourseDetail.generate')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
