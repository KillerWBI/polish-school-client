import { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { formatDate } from '../../utils/formatDate'
import Modal from '../../components/ui/Modal'
import useAuth from '../../hooks/useAuth'

export default function CalendarPage() {
  const { isTeacher } = useAuth()
  const calRef  = useRef(null)
  const [events, setEvents]       = useState([])
  const [selected, setSelected]   = useState(null) // выбранное событие
  const [loading, setLoading]     = useState(false)

  // FullCalendar вызывает datesSet при смене месяца → загружаем уроки за период
  const handleDatesSet = useCallback(async ({ startStr, endStr }) => {
    setLoading(true)
    try {
      const from = startStr.slice(0, 10)
      const to   = endStr.slice(0, 10)
      const [group, indiv] = await Promise.all([
        getLessons({ from, to }),
        getIndividualLessons({ from, to }),
      ])

      const groupEvents = (group || []).map(l => ({
        id:    `g-${l.id}`,
        title: l.topic || l.Group?.name || 'Урок',
        start: `${l.date}T${l.time}:00`,
        backgroundColor: '#7C3AED',
        borderColor: '#7C3AED',
        extendedProps: { type: 'group', lesson: l },
      }))

      const indivEvents = (indiv || []).map(l => ({
        id:    `i-${l.id}`,
        title: l.topic || l.student?.name || 'Инд. урок',
        start: `${l.date}T${l.time}:00`,
        backgroundColor: '#BE185D',
        borderColor: '#BE185D',
        extendedProps: { type: 'individual', lesson: l },
      }))

      setEvents([...groupEvents, ...indivEvents])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleEventClick = ({ event }) => setSelected(event.extendedProps)

  return (
    <div className="p-5 sm:p-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Расписание</h1>
          <p className="text-sm text-slate-400 mt-0.5">Все уроки по группам и индивидуальные</p>
        </div>
        {loading && (
          <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-brand-400 animate-spin" />
        )}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-5 mb-5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-700 inline-block" />
          Групповые уроки
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-pink-700 inline-block" />
          Индивидуальные
        </span>
      </div>

      {/* Календарь */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-6">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locales={[ruLocale]}
          locale="ru"
          firstDay={1}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
          buttonText={{ today: 'Сегодня', month: 'Месяц', week: 'Неделя' }}
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
        />
      </div>

      {/* Модалка деталей урока */}
      <Modal open={!!selected} onClose={() => setSelected(null)} maxWidth="max-w-sm">
        {selected && <LessonDetail props={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </div>
  )
}

function LessonDetail({ props: { type, lesson }, onClose }) {
  const linkUrl = lesson.lessonLink || lesson.Group?.lessonLink

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full mb-2 ${
            type === 'group'
              ? 'bg-brand-700/30 text-brand-300'
              : 'bg-pink-900/40 text-pink-300'
          }`}>
            {type === 'group' ? lesson.Group?.name : 'Инд. урок'}
          </span>
          <h3 className="text-lg font-semibold text-white">
            {lesson.topic || 'Без темы'}
          </h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm mb-5">
        <Row label="Дата"  value={formatDate(lesson.date)} />
        <Row label="Время" value={lesson.time} />
        {type === 'individual' && lesson.student &&
          <Row label="Студент" value={lesson.student.name} />
        }
        {lesson.description &&
          <Row label="Описание" value={lesson.description} />
        }
      </div>

      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl btn-river text-white text-sm font-medium"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round"/>
          </svg>
          Перейти на урок
        </a>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0 w-20">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  )
}
