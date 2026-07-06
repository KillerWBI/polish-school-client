import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Светлый сайдбар (Cemdash-стиль).
const TEACHER_SECTIONS = [
  { label: 'Главное', items: [
    { path: '/dashboard', label: 'Дашборд',   icon: IconDashboard },
    { path: '/calendar',  label: 'Расписание', icon: IconCalendar },
  ]},
  { label: 'Учёба', items: [
    { path: '/groups',             label: 'Группы',           icon: IconGroups },
    { path: '/individual-courses', label: 'Инд. курсы',       icon: IconIndividual },
    { path: '/students',           label: 'Ученики',          icon: IconStudents },
    { path: '/homework',           label: 'Домашние задания', icon: IconHomework },
    { path: '/attendance',         label: 'Посещаемость',     icon: IconCheck },
  ]},
  { label: 'Финансы', items: [
    { path: '/payments', label: 'Оплата', icon: IconPayment },
  ]},
]

const STUDENT_SECTIONS = [
  { label: 'Главное', items: [
    { path: '/dashboard', label: 'Дашборд',   icon: IconDashboard },
    { path: '/calendar',  label: 'Расписание', icon: IconCalendar },
  ]},
  { label: 'Учёба', items: [
    { path: '/groups',     label: 'Мои группы',       icon: IconGroups },
    { path: '/homework',   label: 'Домашние задания', icon: IconHomework },
    { path: '/attendance', label: 'Посещаемость',     icon: IconCheck },
  ]},
  { label: 'Финансы', items: [
    { path: '/payments', label: 'Оплата', icon: IconPayment },
  ]},
]

export default function Sidebar({ onClose }) {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()
  const sections = isTeacher ? TEACHER_SECTIONS : STUDENT_SECTIONS

  const handleLogout = () => { logout(); navigate('/') }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`

  return (
    <aside className="flex flex-col w-[240px] shrink-0 bg-white border border-[#EAECEF] rounded-2xl h-[calc(100vh-1.5rem)] sticky top-3 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Лого */}
      <Link to="/dashboard" onClick={onClose}
        className="flex items-center gap-2.5 px-5 h-16 border-b border-[#F0F2F5]">
        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">L</span>
        <span className="font-mono text-sm font-semibold text-[#0F172A] tracking-tight">LinguaFlow</span>
      </Link>

      {/* Профиль */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#F7F8FA] border border-[#EAECEF]">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name?.[0]?.toUpperCase() ?? '?')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-[#0F172A] truncate leading-tight">{user?.name?.split(' ')[0] ?? '—'}</div>
            <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">{isTeacher ? 'Преподаватель' : 'Студент'}</div>
          </div>
          <span className="text-[9px] font-medium text-[#64748B] border border-[#E2E5EA] rounded px-1.5 py-0.5 shrink-0">Free</span>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A0AAB8] px-2.5 mb-1.5">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => (
                <NavLink key={path} to={path} onClick={onClose} className={linkClass}>
                  <Icon />
                  <span className="truncate flex-1">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Помощь + профиль + выход */}
      <div className="px-3 py-3 border-t border-[#EAECEF] space-y-0.5">
        <NavLink to="/help" onClick={onClose} className={linkClass}>
          <IconHelp /> Помощь
        </NavLink>
        <NavLink to="/profile" onClick={onClose} className={linkClass}>
          <IconProfile /> Профиль
        </NavLink>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer">
          <IconLogout /> Выйти
        </button>
      </div>
    </aside>
  )
}

/* ── Иконки (stroke=currentColor, наследуют цвет пункта) ── */
function IconDashboard() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg> }
function IconCalendar() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round"/></svg> }
function IconGroups() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function IconStudents() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z"/></svg> }
function IconHomework() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/></svg> }
function IconCheck() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconPayment() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22" strokeLinecap="round"/></svg> }
function IconIndividual() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function IconProfile() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round"/></svg> }
function IconHelp() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconLogout() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg> }
