import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'
import useAuth from '../../hooks/useAuth'

const TEACHER_NAV = [
  { path: '/calendar',             label: 'Расписание',          icon: IconCalendar },
  { path: '/groups',               label: 'Группы',              icon: IconGroups },
  { path: '/individual-courses',   label: 'Инд. курсы',          icon: IconIndividual },
  { path: '/students',             label: 'Студенты',            icon: IconStudents },
  { path: '/homework',             label: 'Домашние задания',    icon: IconHomework },
  { path: '/attendance',           label: 'Посещаемость',        icon: IconCheck },
  { path: '/payments',             label: 'Оплата',              icon: IconPayment },
  { path: '/profile',              label: 'Профиль',             icon: IconProfile },
]

const STUDENT_NAV = [
  { path: '/calendar',             label: 'Расписание',          icon: IconCalendar },
  { path: '/groups',               label: 'Мои группы',          icon: IconGroups },
  { path: '/individual-courses',   label: 'Инд. курсы',          icon: IconIndividual },
  { path: '/homework',             label: 'Домашние задания',    icon: IconHomework },
  { path: '/attendance',           label: 'Посещаемость',        icon: IconCheck },
  { path: '/payments',             label: 'Оплата',              icon: IconPayment },
  { path: '/profile',              label: 'Профиль',             icon: IconProfile },
]

export default function Sidebar({ onClose }) {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()
  const nav = isTeacher ? TEACHER_NAV : STUDENT_NAV

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="flex flex-col h-full bg-[#0A0E1A] border-r border-white/[0.07] w-60 shrink-0">
      {/* Логотип */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Logo size="sm" onClick={() => { navigate('/'); onClose?.() }} />
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 font-medium border border-brand-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Пользователь + выход */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{isTeacher ? 'Преподаватель' : 'Студент'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <IconLogout />
          Выйти
        </button>
      </div>
    </aside>
  )
}

// SVG-иконки
function IconCalendar() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round"/></svg>
}
function IconGroups() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconStudents() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z"/></svg>
}
function IconHomework() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/></svg>
}
function IconCheck() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPayment() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22" strokeLinecap="round"/></svg>
}
function IconLogout() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconIndividual() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconProfile() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round"/></svg>
}
