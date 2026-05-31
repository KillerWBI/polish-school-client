import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getDashboard, getActivity } from '../../api/dashboard.api'
import { formatDate } from '../../utils/formatDate'
import { PageSpinner } from '../../components/ui/Spinner'

/* ── Главный компонент ─────────────────────────────────────── */
export default function DashboardPage() {
  const { isTeacher } = useAuth()
  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />
}

/* ══════════════════════════════════════════════════════════
   УЧИТЕЛЬ
   ══════════════════════════════════════════════════════════ */
function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading }   = useFetch(getDashboard)
  const { data: activity }  = useFetch(getActivity)

  if (loading) return <PageSpinner />

  const kpi      = data?.kpi             ?? {}
  const lessons  = data?.upcomingLessons ?? []
  const ungraded = data?.ungradedList    ?? []
  const events   = activity              ?? []
  const today    = new Date().toISOString().slice(0, 10)
  const dateLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-full p-5 sm:p-8">
      <DashHeader dateLabel={dateLabel} firstName={user?.name?.split(' ')[0]} navigate={navigate} createOptions={[
        { label: 'Урок',       path: '/groups',    emoji: '📅' },
        { label: 'Задание',    path: '/homework',  emoji: '✏️' },
        { label: 'Студента',   path: '/students',  emoji: '👤' },
      ]} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard icon="📅" label="Уроков сегодня" value={kpi.lessonsToday ?? 0}
          glow={kpi.lessonsToday > 0} onClick={() => navigate('/calendar')} />
        <KpiCard icon="✏️" label="ДЗ без проверки" value={kpi.ungradedSubmissions ?? 0}
          alert={kpi.ungradedSubmissions > 0} onClick={() => navigate('/homework')} />
        <KpiCard icon="💳" label="Долг студентов" value={kpi.totalDebt > 0 ? `${kpi.totalDebt} zł` : '0 zł'}
          alert={kpi.totalDebt > 0} onClick={() => navigate('/payments')} />
        <KpiCard icon="✅" label="Посещаемость" value={kpi.attendancePercent != null ? `${kpi.attendancePercent}%` : '—'}
          onClick={() => navigate('/attendance')} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel title="Уроки сегодня" linkTo="/calendar" linkLabel="Весь календарь">
            {lessons.filter(l => l.date === today).length === 0
              ? <EmptyNote icon="📭" text="На сегодня уроков нет" />
              : lessons.filter(l => l.date === today).map(l =>
                  <TeacherTodayLessonCard key={l.id} lesson={l} navigate={navigate} />)
            }
          </Panel>

          <Panel title="Ближайшие уроки" linkTo="/calendar" linkLabel="Все →">
            {lessons.filter(l => l.date !== today).length === 0
              ? <EmptyNote icon="🗓" text="Нет запланированных уроков" />
              : lessons.filter(l => l.date !== today).map(l =>
                  <UpcomingRow key={l.id} lesson={l} />)
            }
          </Panel>

          {ungraded.length > 0 && (
            <Panel title="Ждут проверки" linkTo="/homework" linkLabel={`Все (${kpi.ungradedSubmissions})`}>
              {ungraded.map(s => <TeacherUngradedRow key={s.id} sub={s} />)}
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Активность">
            {events.length === 0
              ? <EmptyNote icon="💤" text="Пока тихо" />
              : events.slice(0, 12).map(e => <ActivityRow key={e.id} event={e} />)
            }
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   СТУДЕНТ
   ══════════════════════════════════════════════════════════ */
function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading }   = useFetch(getDashboard)
  const { data: activity }  = useFetch(getActivity)

  if (loading) return <PageSpinner />

  const kpi      = data?.kpi             ?? {}
  const lessons  = data?.upcomingLessons ?? []
  const pending  = data?.pendingHomework ?? []
  const events   = activity              ?? []
  const today    = new Date().toISOString().slice(0, 10)
  const dateLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-full p-5 sm:p-8">
      <DashHeader dateLabel={dateLabel} firstName={user?.name?.split(' ')[0]} navigate={navigate} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard icon="📅" label="Уроков на неделе" value={kpi.lessonsThisWeek ?? 0}
          glow={kpi.lessonsThisWeek > 0} onClick={() => navigate('/calendar')} />
        <KpiCard icon="✏️" label="ДЗ к сдаче" value={kpi.pendingHomework ?? 0}
          alert={kpi.pendingHomework > 0} onClick={() => navigate('/homework')} />
        <KpiCard icon="✅" label="Моя посещаемость" value={kpi.attendancePercent != null ? `${kpi.attendancePercent}%` : '—'}
          onClick={() => navigate('/attendance')} />
        <KpiCard icon="💳" label="Мой долг" value={kpi.myDebt > 0 ? `${kpi.myDebt} zł` : '0 zł'}
          alert={kpi.myDebt > 0} onClick={() => navigate('/payments')} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel title="Сегодня" linkTo="/calendar" linkLabel="Календарь">
            {lessons.filter(l => l.date === today).length === 0
              ? <EmptyNote icon="📭" text="На сегодня уроков нет" />
              : lessons.filter(l => l.date === today).map(l =>
                  <StudentTodayLessonCard key={l.id} lesson={l} />)
            }
          </Panel>

          <Panel title="Ближайшие уроки" linkTo="/calendar" linkLabel="Все →">
            {lessons.filter(l => l.date !== today).length === 0
              ? <EmptyNote icon="🗓" text="Уроков пока не запланировано" />
              : lessons.filter(l => l.date !== today).map(l =>
                  <UpcomingRow key={l.id} lesson={l} />)
            }
          </Panel>

          {pending.length > 0 && (
            <Panel title="ДЗ к сдаче" linkTo="/homework" linkLabel={`Все (${kpi.pendingHomework})`}>
              {pending.map(h => <PendingHwRow key={h.id} hw={h} />)}
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Моя активность">
            {events.length === 0
              ? <EmptyNote icon="💤" text="Здесь появятся ваши оценки и оплаты" />
              : events.slice(0, 12).map(e => <ActivityRow key={e.id} event={e} />)
            }
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ОБЩИЕ КОМПОНЕНТЫ
   ══════════════════════════════════════════════════════════ */

function DashHeader({ dateLabel, firstName, navigate, createOptions }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <p className="text-xs text-slate-500 capitalize mb-0.5">{dateLabel}</p>
        <h1 className="text-xl font-semibold text-white">
          Привет, {firstName ?? '—'} 👋
        </h1>
      </div>
      {createOptions && <CreateDropdown navigate={navigate} items={createOptions} />}
    </div>
  )
}

function KpiCard({ icon, label, value, onClick, glow, alert }) {
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer w-full group ${
        alert
          ? 'bg-amber-500/[0.05] border-amber-500/20 hover:border-amber-400/40'
          : glow
          ? 'bg-brand-600/[0.07] border-brand-600/20 hover:border-brand-500/40'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]'
      } ${glow ? 'shadow-[0_0_24px_rgba(99,102,241,0.10)]' : ''}`}
    >
      <div className="text-xl mb-2">{icon}</div>
      <div className={`text-lg font-semibold leading-none mb-1 ${
        alert ? 'text-amber-300' : glow ? 'text-brand-300' : 'text-white'
      }`}>{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </button>
  )
}

function Panel({ title, linkTo, linkLabel, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {(title || linkLabel) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</h2>
          {linkLabel && (
            <Link to={linkTo} className="text-[11px] text-brand-500 hover:text-brand-300 transition-colors">
              {linkLabel}
            </Link>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

/* ── Карточка урока СЕГОДНЯ — учитель ───────────────────── */
function TeacherTodayLessonCard({ lesson, navigate }) {
  const isGroup = lesson.type === 'group'
  return (
    <div className="p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-center shrink-0 w-10">
          <div className="text-sm font-semibold text-white leading-none">{lesson.time?.slice(0, 5)}</div>
          <div className="text-[9px] text-slate-600 mt-0.5">сегодня</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {isGroup ? lesson.label : `Инд. — ${lesson.label ?? '?'}`}
          </div>
          {lesson.topic && <div className="text-xs text-slate-500 truncate mt-0.5">{lesson.topic}</div>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => navigate(isGroup ? '/groups' : '/individual-courses')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/[0.10] hover:text-white transition-colors cursor-pointer">
              Открыть
            </button>
            <button onClick={() => navigate('/attendance')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-600/[0.12] text-brand-400 hover:bg-brand-600/[0.22] transition-colors cursor-pointer">
              Посещаемость
            </button>
          </div>
        </div>
        <LessonTypeBadge type={lesson.type} />
      </div>
    </div>
  )
}

/* ── Карточка урока СЕГОДНЯ — студент ──────────────────── */
function StudentTodayLessonCard({ lesson }) {
  const isGroup = lesson.type === 'group'
  return (
    <div className="p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-center shrink-0 w-10">
          <div className="text-sm font-semibold text-white leading-none">{lesson.time?.slice(0, 5)}</div>
          <div className="text-[9px] text-slate-600 mt-0.5">сегодня</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {isGroup ? lesson.label : `Инд. — учитель ${lesson.label ?? ''}`}
          </div>
          {lesson.topic && <div className="text-xs text-slate-500 truncate mt-0.5">{lesson.topic}</div>}
          <div className="flex gap-2 mt-2">
            {lesson.lessonLink && (
              <a href={lesson.lessonLink} target="_blank" rel="noreferrer"
                className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-600/[0.12] text-brand-400 hover:bg-brand-600/[0.22] transition-colors cursor-pointer">
                Присоединиться
              </a>
            )}
            <Link to="/calendar"
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/[0.10] hover:text-white transition-colors cursor-pointer">
              Материалы
            </Link>
          </div>
        </div>
        <LessonTypeBadge type={lesson.type} />
      </div>
    </div>
  )
}

function LessonTypeBadge({ type }) {
  const isGroup = type === 'group'
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 mt-0.5 ${
      isGroup
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }`}>
      {isGroup ? 'Группа' : 'Инд.'}
    </span>
  )
}

function UpcomingRow({ lesson }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-300 truncate">
          {lesson.type === 'group' ? lesson.label : `Инд. — ${lesson.label ?? '?'}`}
          {lesson.topic && <span className="text-slate-600"> · {lesson.topic}</span>}
        </span>
      </div>
      <span className="text-[11px] text-slate-500 shrink-0">
        {formatDate(lesson.date)} {lesson.time?.slice(0, 5)}
      </span>
    </div>
  )
}

/* ── Сдача ДЗ без проверки — учитель ─────────────────── */
function TeacherUngradedRow({ sub }) {
  return (
    <Link to="/homework"
      className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
        <span className="text-[10px] text-amber-400 font-bold">{sub.student?.name?.[0]?.toUpperCase() ?? '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white truncate">{sub.student?.name ?? '—'}</div>
        <div className="text-[10px] text-slate-500 truncate">{sub.Homework?.description ?? '—'}</div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
        Проверить →
      </span>
    </Link>
  )
}

/* ── ДЗ к сдаче — студент ────────────────────────────── */
function PendingHwRow({ hw }) {
  const deadlineLabel = hw.deadline
    ? new Date(hw.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : 'без срока'
  const isUrgent = hw.deadline && (new Date(hw.deadline) - Date.now()) < 24 * 60 * 60 * 1000

  return (
    <Link to="/homework"
      className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
        isUrgent
          ? 'bg-red-500/15 border-red-500/25 text-red-400'
          : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
      }`}>
        <span className="text-[10px] font-bold">!</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white truncate">{hw.description}</div>
        <div className="text-[10px] text-slate-500">
          до {deadlineLabel} {isUrgent && <span className="text-red-400">· срочно</span>}
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-600/15 text-brand-400 border border-brand-600/20 shrink-0">
        Сдать →
      </span>
    </Link>
  )
}

/* ── Лента активности ─────────────────────────────────── */
const TYPE_CONFIG = {
  submission: { icon: '✏️', color: 'text-blue-400' },
  grade:      { icon: '🎯', color: 'text-emerald-400' },
  payment:    { icon: '💳', color: 'text-emerald-400' },
  attendance: { icon: '✅', color: 'text-slate-400' },
}

function ActivityRow({ event }) {
  const cfg = TYPE_CONFIG[event.type] ?? { icon: '•', color: 'text-slate-500' }
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
      <span className="text-base shrink-0 leading-none mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-slate-300 leading-snug">{event.text}</p>
        {event.extra && <span className="text-[10px] text-slate-600">{event.extra}</span>}
      </div>
      <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">{relativeTime(event.at)}</span>
    </div>
  )
}

/* ── Dropdown «+ Создать» ───────────────────────────── */
function CreateDropdown({ navigate, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.3)]">
        <span className="text-base leading-none">+</span>
        Создать
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/[0.10] bg-[#111827] shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          {items.map(item => (
            <button key={item.path}
              onClick={() => { navigate(item.path); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left">
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyNote({ icon, text }) {
  return (
    <div className="px-4 py-6 text-center">
      <span className="block text-xl mb-1.5">{icon}</span>
      <p className="text-xs text-slate-600">{text}</p>
    </div>
  )
}

/* ── Утилита: относительное время ────────────────── */
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)    return 'только что'
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 172800) return 'вчера'
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
