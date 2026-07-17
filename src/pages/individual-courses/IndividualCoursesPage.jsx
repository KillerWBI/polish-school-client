import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getIndividualCourses, createIndividualCourse, generateIndividualLessons } from '../../api/individualCourses.api'
import { getMyStudents } from '../../api/students.api'
import { toast, errMsg } from '../../utils/toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { SkeletonCards } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

// value = номер дня (0=Вс..6=Сб); порядок отображения Пн→Вс
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]

export default function IndividualCoursesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('teacher')
  const { isTeacher } = useAuth()

  const { data: courses,  loading,        reload } = useFetch(getIndividualCourses)
  // students — для пикера в модалке создания (там studentId = User.id → бэк резолвит в Student)
  const { data: students }                          = useFetch(
    () => isTeacher ? getMyStudents() : Promise.resolve([]),
    [isTeacher]
  )

  const [modal, setModal] = useState(false)

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isTeacher ? t('indCourses.titleTeacher') : t('indCourses.titleStudent')}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isTeacher ? t('indCourses.subtitleTeacher') : t('indCourses.subtitleStudent')}
          </p>
        </div>
        {isTeacher && (
          <Button size="sm" onClick={() => setModal(true)}>{t('indCourses.createBtn')}</Button>
        )}
      </div>

      {loading ? <SkeletonCards /> : !courses?.length ? (
        <EmptyState
          emoji="👤"
          title={isTeacher ? t('indCourses.emptyTeacherTitle') : t('indCourses.emptyStudentTitle')}
          text={isTeacher ? t('indCourses.emptyTeacherText') : t('indCourses.emptyStudentText')}
          action={isTeacher
            ? <Button size="sm" onClick={() => setModal(true)}>{t('indCourses.createShort')}</Button>
            : null}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <CourseCard
              key={c.id}
              course={c}
              student={c.student}
              onClick={() => navigate(`/individual-courses/${c.id}`)}
            />
          ))}
        </div>
      )}

      {isTeacher && (
        <CreateCourseModal
          open={modal}
          onClose={() => setModal(false)}
          onCreated={reload}
          students={students || []}
        />
      )}
    </div>
  )
}

function CourseCard({ course, student, onClick }) {
  const { t } = useTranslation('teacher')
  const weekdays = t('groups.weekdays', { returnObjects: true })
  const schedule = (course.schedule || [])
    .map(s => `${weekdays[s.day] ?? ''} ${s.time}`)
    .join(', ')

  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
          {course.name || (student?.name ? `${t('indCourses.cardPrefix')}${student.name}` : t('indCourses.noName'))}
        </h3>
        <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {student?.name && <p className="text-xs text-slate-400 mb-1">👤 {student.name}</p>}
      {schedule && <p className="text-xs text-slate-400 mb-1">📅 {schedule}</p>}
      <p className="text-xs text-slate-400">💰 {course.pricePerLesson || 0} {t('indCourses.perLesson')}</p>
    </button>
  )
}

function CreateCourseModal({ open, onClose, onCreated, students }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const weekdays = t('groups.weekdays', { returnObjects: true })
  const [form, setForm]         = useState({ studentId: '', name: '', pricePerLesson: '', lessonLink: '' })
  const [schedule, setSchedule] = useState([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSlot    = () => setSchedule(s => [...s, { day: 1, time: '18:00' }])
  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) =>
    setSchedule(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: key === 'day' ? Number(val) : val } : sl))

  const reset = () => {
    setForm({ studentId: '', name: '', pricePerLesson: '', lessonLink: '' })
    setSchedule([])
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.studentId) return setError(t('indCourses.chooseStudent'))
    setSaving(true); setError('')
    try {
      const newCourse = await createIndividualCourse({
        studentId: form.studentId,
        name: form.name.trim() || null,
        schedule,
        lessonLink: form.lessonLink.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || 0,
      })

      // Авто-генерация уроков на 3 мес. если есть расписание
      if (schedule.length > 0 && newCourse?.id) {
        const today = new Date().toISOString().slice(0, 10)
        const end   = new Date(); end.setMonth(end.getMonth() + 3)
        const to    = end.toISOString().slice(0, 10)
        await generateIndividualLessons(newCourse.id, today, to)
      }

      toast.success(t('indCourses.createdToast'))
      onCreated()
      onClose()
      reset()
    } catch (e) {
      const msg = errMsg(e, t('indCourses.createError'))
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{t('indCourses.modalTitle')}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Студент */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
              {t('indCourses.studentLabel')}
            </label>
            <select
              value={form.studentId}
              onChange={e => set('studentId', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
              <option value="">{t('indCourses.choose')}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.username ? ` (@${s.username})` : ''}</option>
              ))}
            </select>
          </div>

          <Input label={t('indCourses.fName')} value={form.name}
            onChange={e => set('name', e.target.value)} />
          <Input label={t('indCourses.fPrice')} type="number" value={form.pricePerLesson}
            onChange={e => set('pricePerLesson', e.target.value)} />
          <Input label={t('indCourses.fLessonLink')} value={form.lessonLink}
            onChange={e => set('lessonLink', e.target.value)} />

          {/* Расписание */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">{t('indCourses.scheduleLabel')}</span>
              <button type="button" onClick={addSlot}
                className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                {t('indCourses.addSlot')}
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
            <Button type="submit" loading={saving} className="flex-1">{tc('create')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
