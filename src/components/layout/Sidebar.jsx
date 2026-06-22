import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getLessonRequests } from '../../api/lessonRequests.api'

// Навигация учителя — сгруппированная
const TEACHER_SECTIONS = [
  {
    label: 'Главное',
    items: [
      { path: '/dashboard', label: 'Дашборд',   icon: IconDashboard },
      { path: '/calendar',  label: 'Расписание', icon: IconCalendar },
    ],
  },
  {
    label: 'Учёба',
    items: [
      { path: '/groups',             label: 'Группы',           icon: IconGroups },
      { path: '/individual-courses', label: 'Инд. курсы',       icon: IconIndividual },
      { path: '/students',           label: 'Ученики',          icon: IconStudents },
      { path: '/homework',           label: 'Домашние задания', icon: IconHomework },
      { path: '/attendance',         label: 'Посещаемость',     icon: IconCheck },
    ],
  },
  {
    label: 'Финансы',
    items: [
      { path: '/payments', label: 'Оплата', icon: IconPayment },
    ],
  },
]

const STUDENT_SECTIONS = [
  {
    label: 'Главное',
    items: [
      { path: '/dashboard', label: 'Дашборд',   icon: IconDashboard },
      { path: '/calendar',  label: 'Расписание', icon: IconCalendar },
    ],
  },
  {
    label: 'Учёба',
    items: [
      { path: '/groups',             label: 'Мои группы',       icon: IconGroups },
      { path: '/individual-courses', label: 'Инд. курсы',       icon: IconIndividual },
      { path: '/homework',           label: 'Домашние задания', icon: IconHomework },
      { path: '/attendance',         label: 'Посещаемость',     icon: IconCheck },
    ],
  },
  {
    label: 'Финансы',
    items: [
      { path: '/payments', label: 'Оплата', icon: IconPayment },
    ],
  },
]

export default function Sidebar({ onClose }) {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()
  const sections = isTeacher ? TEACHER_SECTIONS : STUDENT_SECTIONS

  // Бейдж непринятых заявок (только учитель). Обновляется по событию requests:changed,
  // которое StudentsPage шлёт после accept/decline — дешёвая синхронизация без глоб. стейта.
  const [pending, setPending] = useState(0)
  useEffect(() => {
    if (!isTeacher) return
    const load = () => getLessonRequests('pending').then(r => setPending(r.length)).catch(() => {})
    load()
    window.addEventListener('requests:changed', load)
    return () => window.removeEventListener('requests:changed', load)
  }, [isTeacher])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="flex flex-col h-full bg-[#080B14] border-r border-white/[0.06] w-[220px] shrink-0">

      {/* Лого — клик → /dashboard */}
      <Link
        to="/dashboard"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">L</span>
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">LinguaFlow</span>
      </Link>

      {/* Профиль пользователя — ВВЕРХУ */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate leading-tight">
              {user?.name?.split(' ')[0] ?? '—'}
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {isTeacher ? 'Преподаватель' : 'Студент'}
            </div>
          </div>
          {/* Тариф-badge */}
          <span className="text-[9px] font-medium text-slate-500 border border-white/[0.10] rounded px-1.5 py-0.5 shrink-0">
            Free
          </span>
        </div>
      </div>

      {/* Навигация по секциям */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 px-2 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600/[0.12] text-white font-medium border-l-2 border-brand-400 pl-[6px]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-l-2 border-transparent pl-[6px]'
                    }`
                  }
                >
                  <Icon />
                  <span className="truncate flex-1">{label}</span>
                  {path === '/students' && pending > 0 && (
                    <span className="text-[10px] font-semibold text-white bg-brand-500 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                      {pending}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Профиль + Выход — внизу */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-all duration-150 border-l-2 ${
              isActive
                ? 'bg-brand-600/[0.12] text-white font-medium border-brand-400 pl-[6px]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-transparent pl-[6px]'
            }`
          }
        >
          <IconProfile />
          Профиль
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2 pl-[6px] rounded-lg text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer border-l-2 border-transparent"
        >
          <IconLogout />
          Выйти
        </button>
      </div>
    </aside>
  )
}

/* ── Иконки ────────────────────────────────────────────────── */
function IconDashboard() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
}
function IconCalendar() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round"/></svg>
}
function IconGroups() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconStudents() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z"/></svg>
}
function IconHomework() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/></svg>
}
function IconCheck() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPayment() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22" strokeLinecap="round"/></svg>
}
function IconIndividual() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconProfile() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round"/></svg>
}
function IconLogout() {
  return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
