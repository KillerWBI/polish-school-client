import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import plLocale from '@fullcalendar/core/locales/pl'
import ukLocale from '@fullcalendar/core/locales/uk'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { formatDate } from '../../utils/formatDate'
import Modal from '../../components/ui/Modal'

// Статические пропсы FullCalendar — на уровне модуля, чтобы их ссылки не менялись
// на каждый рендер. Иначе обёртка @fullcalendar/react видит «пропсы изменились» →
// resetOptions() → повторный datesSet → бесконечная петля запросов.
const CAL_PLUGINS = [dayGridPlugin, interactionPlugin]
const CAL_LOCALES = [ruLocale, plLocale, ukLocale] // en встроен в FullCalendar
const CAL_HEADER  = { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }

export default function CalendarPage() {
  const { t, i18n } = useTranslation('app')
  const calRef  = useRef(null)
  const lastRange = useRef('')                     // последний загруженный диапазон from|to
  const [events, setEvents]       = useState([])
  const [selected, setSelected]   = useState(null) // выбранное событие
  const [loading, setLoading]     = useState(false)

  // FullCalendar вызывает datesSet при смене месяца → загружаем уроки за период.
  // ГАРД: если диапазон тот же — выходим без запроса. Это разрывает петлю,
  // даже если datesSet пере-стреливает из-за внутренних ре-рендеров FullCalendar.
  const handleDatesSet = useCallback(async ({ startStr, endStr }) => {
    const from = startStr.slice(0, 10)
    const to   = endStr.slice(0, 10)
    const key  = `${from}|${to}`
    if (key === lastRange.current) return
    lastRange.current = key

    setLoading(true)
    try {
      const [group, indiv] = await Promise.all([
        getLessons({ from, to }),
        getIndividualLessons({ from, to }),
      ])

      const groupEvents = (group || []).map(l => ({
        id:    `g-${l.id}`,
        title: l.topic || l.Group?.name || t('calendar.lessonFallback'),
        start: `${l.date}T${l.time}:00`,
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
        extendedProps: { type: 'group', lesson: l },
      }))

      const indivEvents = (indiv || []).map(l => ({
        id:    `i-${l.id}`,
        title: l.topic || l.student?.name || t('calendar.indFallback'),
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
  }, [t])

  const handleEventClick = ({ event }) => setSelected(event.extendedProps)

  return (
    <div className="p-5 sm:p-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('calendar.title')}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{t('calendar.subtitle')}</p>
        </div>
        {loading && (
          <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
        )}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-5 mb-5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
          {t('calendar.legendGroup')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-pink-700 inline-block" />
          {t('calendar.legendIndiv')}
        </span>
      </div>

      {/* Календарь */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <FullCalendar
          ref={calRef}
          plugins={CAL_PLUGINS}
          initialView="dayGridMonth"
          locales={CAL_LOCALES}
          locale={i18n.language}
          firstDay={1}
          headerToolbar={CAL_HEADER}
          buttonText={{ today: t('calendar.today'), month: t('calendar.month'), week: t('calendar.week') }}
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
  const { t } = useTranslation('app')
  const linkUrl = lesson.lessonLink || lesson.Group?.lessonLink
  const chatUrl = lesson.Group?.chatLink

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full mb-2 ${
            type === 'group'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-pink-100 text-pink-700'
          }`}>
            {type === 'group' ? lesson.Group?.name : t('calendar.indFallback')}
          </span>
          <h3 className="text-lg font-semibold text-slate-900">
            {lesson.topic || t('calendar.noTopic')}
          </h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm mb-5">
        <Row label={t('calendar.rowDate')}  value={formatDate(lesson.date)} />
        <Row label={t('calendar.rowTime')} value={lesson.time} />
        {type === 'individual' && lesson.student &&
          <Row label={t('calendar.rowStudent')} value={lesson.student.name} />
        }
        {lesson.description &&
          <Row label={t('calendar.rowDesc')} value={lesson.description} />
        }
      </div>

      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round"/>
          </svg>
          {t('calendar.goToLesson')}
        </a>
      )}

      {chatUrl && (
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 mt-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          <span>💬</span>
          {t('calendar.chatGroup')}
        </a>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0 w-20">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  )
}
