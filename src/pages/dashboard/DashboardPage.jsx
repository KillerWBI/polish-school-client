import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CalendarDays, FileText, Wallet, CheckCircle2, Plus, Award, Clock,
  ChevronRight, CalendarClock, Inbox, MoreHorizontal,
} from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import AnalyticsChart from './AnalyticsChart'
import { getDashboard, getActivity } from '../../api/dashboard.api'
import { getGroups } from '../../api/groups.api'
import { getMyStudents } from '../../api/students.api'
import { getHomework } from '../../api/homework.api'
import { formatDate } from '../../utils/formatDate'
import { SkeletonDashboard } from '../../components/ui/Skeleton'

export default function DashboardPage() {
  const { isTeacher } = useAuth()
  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />
}

/* ══════════════════ УЧИТЕЛЬ ══════════════════ */
function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading }  = useFetch(getDashboard)
  const { data: activity } = useFetch(getActivity)
  // Онбординг-чеклист: показываем, пока учитель не прошёл старт (флаг в localStorage).
  const [hideChecklist, setHideChecklist] = useState(() => localStorage.getItem('lf_onboarding_done') === '1')
  const dismissChecklist = useCallback(() => {
    localStorage.setItem('lf_onboarding_done', '1')
    setHideChecklist(true)
  }, [])
  if (loading) return <SkeletonDashboard />

  const kpi      = data?.kpi ?? {}
  const lessons  = data?.upcomingLessons ?? []
  const ungraded = data?.ungradedList ?? []
  const events   = activity ?? []

  return (
    <Page firstName={user?.name?.split(' ')[0]} navigate={navigate} createOptions={[
      { label: 'Урок', path: '/groups' },
      { label: 'Задание', path: '/homework' },
      { label: 'Ученика', path: '/students' },
    ]}>
      {!hideChecklist && <StartChecklist navigate={navigate} onDone={dismissChecklist} />}

      <div data-tour="kpi" className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Kpi Icon={CalendarDays} accent="blue"    label="Уроков сегодня"  value={kpi.lessonsToday ?? 0} pill={kpi.lessonsToday > 0 ? { t: 'сегодня', tone: 'info' } : { t: 'пусто', tone: 'muted' }} onClick={() => navigate('/calendar')} />
        <Kpi Icon={FileText}     accent="amber"   label="ДЗ без проверки" value={kpi.ungradedSubmissions ?? 0} pill={kpi.ungradedSubmissions > 0 ? { t: 'ждут вас', tone: 'warn' } : { t: 'готово', tone: 'good' }} onClick={() => navigate('/homework')} />
        <Kpi Icon={Wallet}       accent="slate"   label="Долг учеников"   value={fmtMoney(kpi.totalDebt)} pill={kpi.totalDebt > 0 ? { t: 'к оплате', tone: 'warn' } : { t: 'нет долгов', tone: 'good' }} onClick={() => navigate('/payments')} />
        <Kpi Icon={CheckCircle2} accent="emerald" label="Посещаемость"    value={kpi.attendancePercent != null ? `${kpi.attendancePercent}%` : '—'} pill={{ t: 'за месяц', tone: 'muted' }} onClick={() => navigate('/attendance')} />
      </div>

      <AnalyticsChart isTeacher userId={user?.id} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <LessonsTable lessons={lessons} />
        <ActivityCard events={events} title="Активность" empty="Пока тихо" />
      </div>

      {ungraded.length > 0 && (
        <div className="mt-4">
          <Card>
            <CardHead title="Ждут проверки" linkTo="/homework" linkLabel={`Все (${kpi.ungradedSubmissions})`} />
            {ungraded.map(s => <UngradedRow key={s.id} sub={s} />)}
          </Card>
        </div>
      )}
    </Page>
  )
}

/* ══════════════════ СТУДЕНТ ══════════════════ */
function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading }  = useFetch(getDashboard)
  const { data: activity } = useFetch(getActivity)
  if (loading) return <SkeletonDashboard />

  const kpi     = data?.kpi ?? {}
  const lessons = data?.upcomingLessons ?? []
  const pending = data?.pendingHomework ?? []
  const events  = activity ?? []

  return (
    <Page firstName={user?.name?.split(' ')[0]} navigate={navigate}>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Kpi Icon={CalendarDays} accent="blue"    label="Уроков на неделе" value={kpi.lessonsThisWeek ?? 0} pill={{ t: '7 дней', tone: 'info' }} onClick={() => navigate('/calendar')} />
        <Kpi Icon={FileText}     accent="amber"   label="ДЗ к сдаче"       value={kpi.pendingHomework ?? 0} pill={kpi.pendingHomework > 0 ? { t: 'не сдано', tone: 'warn' } : { t: 'всё сдано', tone: 'good' }} onClick={() => navigate('/homework')} />
        <Kpi Icon={CheckCircle2} accent="emerald" label="Посещаемость"     value={kpi.attendancePercent != null ? `${kpi.attendancePercent}%` : '—'} pill={{ t: 'за месяц', tone: 'muted' }} onClick={() => navigate('/attendance')} />
        <Kpi Icon={Wallet}       accent="slate"   label="Мой долг"         value={fmtMoney(kpi.myDebt)} pill={kpi.myDebt > 0 ? { t: 'к оплате', tone: 'warn' } : { t: 'нет долгов', tone: 'good' }} onClick={() => navigate('/payments')} />
      </div>

      <AnalyticsChart userId={user?.id} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <LessonsTable lessons={lessons} student />
        <ActivityCard events={events} title="Моя активность" empty="Здесь появятся оценки и оплаты" />
      </div>

      {pending.length > 0 && (
        <div className="mt-4">
          <Card>
            <CardHead title="ДЗ к сдаче" linkTo="/homework" linkLabel={`Все (${kpi.pendingHomework})`} />
            {pending.map(h => <PendingHwRow key={h.id} hw={h} />)}
          </Card>
        </div>
      )}
    </Page>
  )
}

/* ══════════════════ ОНБОРДИНГ (быстрый старт) ══════════════════ */
function StartChecklist({ navigate, onDone }) {
  const { data: groups }   = useFetch(getGroups)
  const { data: students } = useFetch(getMyStudents)
  const { data: homework } = useFetch(getHomework)

  const ready = !!groups && !!students && !!homework
  const steps = ready ? [
    { key: 'group',    label: 'Создайте первую группу',  hint: 'Контейнер для уроков, ДЗ и посещаемости',    done: groups.length > 0,   to: '/groups' },
    { key: 'student',  label: 'Добавьте ученика',         hint: 'Реального по нику или заглушку — для себя',   done: students.length > 0, to: '/students' },
    { key: 'homework', label: 'Задайте домашнее задание', hint: 'Прикрепите ДЗ к уроку с дедлайном',           done: homework.length > 0, to: '/homework' },
  ] : []
  const doneCount = steps.filter(s => s.done).length
  // Кабинет настроен, когда есть и группа, и ученик — дальше чеклист не нужен (прячем навсегда).
  const setUp = ready && groups.length > 0 && students.length > 0

  useEffect(() => { if (setUp) onDone() }, [setUp, onDone])

  if (!ready || setUp) return null
  const next = steps.find(s => !s.done)

  return (
    <div data-tour="quickstart" className="mb-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Быстрый старт</h2>
          <p className="text-sm text-slate-500 mt-0.5">Три шага, чтобы запустить кабинет</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-slate-500 tabular-nums">{doneCount}/{steps.length}</span>
          <button onClick={onDone} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Скрыть</button>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden mb-4">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>

      <div className="space-y-2">
        {steps.map(s => (
          <div key={s.key} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${s === next ? 'border-blue-200 bg-white' : 'border-slate-100 bg-white/50'}`}>
            {s.done
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              : <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-medium ${s.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{s.label}</div>
              {!s.done && <div className="text-xs text-slate-500 mt-0.5">{s.hint}</div>}
            </div>
            {!s.done && (s === next
              ? <button onClick={() => navigate(s.to)} className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Сделать <ChevronRight className="w-4 h-4" /></button>
              : <button onClick={() => navigate(s.to)} className="shrink-0 text-sm text-blue-600 hover:text-blue-700 transition-colors">Открыть</button>)}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════ КАРКАС ══════════════════ */
function Page({ firstName, navigate, createOptions, children }) {
  const dateLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div className="p-5 sm:p-7 max-w-[1240px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight leading-none">Дашборд</h1>
          <p className="text-sm text-slate-400 mt-1.5 capitalize">Привет, {firstName ?? '—'} · {dateLabel}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600">
            <CalendarDays className="w-4 h-4 text-slate-400" /> Этот месяц
          </span>
          {createOptions && <CreateDropdown navigate={navigate} items={createOptions} />}
        </div>
      </div>
      {children}
    </div>
  )
}

/* ══════════════════ KPI ══════════════════ */
const ACCENT = {
  blue:    'bg-blue-50 text-blue-600',
  amber:   'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate:   'bg-slate-100 text-slate-600',
}
const PILL = {
  good:  'bg-emerald-50 text-emerald-700',
  warn:  'bg-amber-50 text-amber-700',
  info:  'bg-blue-50 text-blue-700',
  muted: 'bg-slate-100 text-slate-500',
}
function Kpi({ Icon, accent = 'blue', label, value, pill, onClick }) {
  return (
    <button onClick={onClick}
      className="text-left w-full p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT[accent]}`}><Icon className="w-5 h-5" strokeWidth={2} /></span>
        {pill && <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${PILL[pill.tone]}`}>{pill.t}</span>}
      </div>
      <div className="mt-4 text-[28px] font-semibold text-slate-900 leading-none tracking-tight">{value}</div>
      <div className="mt-1.5 text-[13px] text-slate-500">{label}</div>
    </button>
  )
}

/* ══════════════════ КАРТЫ ══════════════════ */
function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm ${className}`}>{children}</div>
}
function CardHead({ title, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      {linkLabel && <Link to={linkTo} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">{linkLabel}<ChevronRight className="w-3.5 h-3.5" /></Link>}
    </div>
  )
}

function LessonsTable({ lessons, student }) {
  const rows = lessons.slice(0, 6)
  return (
    <Card>
      <CardHead title="Ближайшие уроки" linkTo="/calendar" linkLabel="Календарь" />
      {rows.length === 0 ? <Empty Icon={CalendarClock} text="Нет запланированных уроков" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5">Время</th>
                <th className="text-left font-medium px-3 py-2.5">{student ? 'Группа / учитель' : 'Группа / ученик'}</th>
                <th className="text-left font-medium px-3 py-2.5">Тип</th>
                <th className="text-right font-medium px-5 py-2.5">Дата</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">{l.time?.slice(0, 5)}</td>
                  <td className="px-3 py-3 text-slate-600 max-w-[180px] truncate">
                    {l.type === 'group' ? l.label : `Инд. — ${l.label ?? '?'}`}
                    {l.topic && <span className="text-slate-400"> · {l.topic}</span>}
                  </td>
                  <td className="px-3 py-3"><TypeBadge type={l.type} /></td>
                  <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{formatDate(l.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function TypeBadge({ type }) {
  const g = type === 'group'
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${g ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{g ? 'Группа' : 'Инд.'}</span>
}

const ACT = {
  submission: { Icon: FileText,     cls: 'bg-blue-50 text-blue-600' },
  grade:      { Icon: Award,        cls: 'bg-emerald-50 text-emerald-600' },
  payment:    { Icon: Wallet,       cls: 'bg-emerald-50 text-emerald-600' },
  attendance: { Icon: CheckCircle2, cls: 'bg-slate-100 text-slate-500' },
}
function ActivityCard({ events, title, empty }) {
  return (
    <Card>
      <CardHead title={title} />
      {events.length === 0 ? <Empty Icon={Inbox} text={empty} /> : (
        <div className="max-h-[360px] overflow-y-auto">
          {events.slice(0, 12).map(e => {
            const a = ACT[e.type] ?? { Icon: Clock, cls: 'bg-slate-100 text-slate-500' }
            return (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3 border-t border-slate-100 first:border-0 hover:bg-slate-50 transition-colors">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.cls}`}><a.Icon className="w-3.5 h-3.5" /></span>
                <p className="flex-1 min-w-0 text-[12px] text-slate-600 leading-snug pt-0.5">{e.text}</p>
                <span className="text-[10px] text-slate-400 shrink-0 pt-1">{relativeTime(e.at)}</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function UngradedRow({ sub }) {
  return (
    <Link to="/homework" className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 first:border-0 hover:bg-slate-50 transition-colors">
      <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-[11px] text-amber-700 font-semibold">{sub.student?.name?.[0]?.toUpperCase() ?? '?'}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-900 truncate">{sub.student?.name ?? '—'}</div>
        <div className="text-[10px] text-slate-400 truncate">{sub.Homework?.description ?? '—'}</div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Проверить</span>
    </Link>
  )
}

function PendingHwRow({ hw }) {
  const deadline = hw.deadline ? new Date(hw.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'без срока'
  const urgent = hw.deadline && (new Date(hw.deadline) - Date.now()) < 864e5
  return (
    <Link to="/homework" className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 first:border-0 hover:bg-slate-50 transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}><Clock className="w-3.5 h-3.5" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-900 truncate">{hw.description}</div>
        <div className="text-[10px] text-slate-400">до {deadline}{urgent && <span className="text-red-500"> · срочно</span>}</div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Сдать</span>
    </Link>
  )
}

function CreateDropdown({ navigate, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} data-tour="create" className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer">
        <Plus className="w-4 h-4" /> Создать
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden py-1">
          {items.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Empty({ Icon, text }) {
  return (
    <div className="px-5 py-10 text-center">
      <span className="inline-flex w-10 h-10 rounded-xl bg-slate-100 text-slate-400 items-center justify-center mb-2"><Icon className="w-5 h-5" /></span>
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  )
}

function fmtMoney(v) { return v > 0 ? `${v} zł` : '0 zł' }
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`
  if (diff < 172800) return 'вчера'
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
