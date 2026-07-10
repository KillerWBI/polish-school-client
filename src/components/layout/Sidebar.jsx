import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { safeUrl } from '../../utils/safeUrl'

// Светлый сайдбар (Cemdash-стиль).
const PLAN_LABEL = { free: 'Free', pro: 'Pro', school: 'School' }

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
    { path: '/materials',          label: 'Материалы',        icon: IconFolder },
  ]},
  { label: 'Инструменты', items: [
    { path: '/quiz',    label: 'AI-тесты',  icon: IconSparkles },
    { path: '/quizzes', label: 'Мои тесты', icon: IconList },
  ]},
  { label: 'Финансы', items: [
    { path: '/payments', label: 'Оплата', icon: IconPayment },
  ]},
]

const STUDENT_SECTIONS = [
  { label: 'Главное', items: [
    { path: '/dashboard',   label: 'Дашборд',    icon: IconDashboard },
    { path: '/calendar',    label: 'Расписание', icon: IconCalendar },
    { path: '/my-progress', label: 'Прогресс',   icon: IconProgress },
  ]},
  { label: 'Учёба', items: [
    { path: '/groups',     label: 'Мои группы',       icon: IconGroups },
    { path: '/homework',   label: 'Домашние задания', icon: IconHomework },
    { path: '/attendance', label: 'Посещаемость',     icon: IconCheck },
    { path: '/materials',  label: 'Материалы',        icon: IconFolder },
    { path: '/my-lessons', label: 'Мои занятия',      icon: IconNotebook },
  ]},
  { label: 'Инструменты', items: [
    { path: '/quiz',     label: 'AI-тесты',  icon: IconSparkles },
    { path: '/quizzes',  label: 'Мои тесты', icon: IconList },
    { path: '/vocab',    label: 'Словарь',   icon: IconVocab },
    { path: '/my-notes', label: 'Заметки',   icon: IconNote },
  ]},
  { label: 'Финансы', items: [
    { path: '/payments', label: 'Оплата', icon: IconPayment },
  ]},
]

const ADMIN_EXTRA_SECTION = {
  label: 'Администрирование',
  items: [{ path: '/admin', label: 'Панель управления', icon: IconShield }],
}

const ROLE_DISPLAY = { teacher: 'Преподаватель', student: 'Студент', admin: 'Администратор' }

export default function Sidebar({ onClose }) {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const baseSections = isTeacher ? TEACHER_SECTIONS : STUDENT_SECTIONS
  const sections = isAdmin ? [...baseSections, ADMIN_EXTRA_SECTION] : baseSections

  const [installPrompt, setInstallPrompt] = useState(null)
  useEffect(() => {
    const h = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  const handleInstall = () => { installPrompt?.prompt(); setInstallPrompt(null) }

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
            {user?.avatar ? <img src={safeUrl(user.avatar)} alt="" className="w-full h-full object-cover" /> : (user?.name?.[0]?.toUpperCase() ?? '?')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-[#0F172A] truncate leading-tight">{user?.name?.split(' ')[0] ?? '—'}</div>
            <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">{ROLE_DISPLAY[user?.role] ?? 'Пользователь'}</div>
          </div>
          {isTeacher && (
            <Link to="/plans" onClick={onClose}
              className={`text-[9px] font-medium rounded px-1.5 py-0.5 shrink-0 border transition-colors ${
                user?.plan && user.plan !== 'free'
                  ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'
                  : 'text-[#64748B] border-[#E2E5EA] hover:border-blue-300 hover:text-blue-600'
              }`}>
              {PLAN_LABEL[user?.plan] ?? 'Free'}
            </Link>
          )}
        </div>
      </div>

      {/* Навигация */}
      <nav data-tour="nav" className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
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
        {installPrompt && (
          <button onClick={handleInstall}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
            <IconInstall /> Установить приложение
          </button>
        )}
        <NavLink to="/help" onClick={onClose} className={linkClass}>
          <IconHelp /> Помощь
        </NavLink>
        <NavLink to="/settings" onClick={onClose} className={({ isActive }) =>
          `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}>
          <IconProfile />
          <span className="flex-1">Настройки</span>
          {isTeacher && !user?.paymentDetails && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center shrink-0">!</span>
          )}
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
function IconSparkles() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l1.9 4.8L18.7 9.7 13.9 11.6 12 16.4 10.1 11.6 5.3 9.7 10.1 7.8 12 3zM19 15l.8 2 2 .8-2 .8L19 21l-.8-2-2-.8 2-.8L19 15z" strokeLinejoin="round"/></svg> }
function IconList() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round"/></svg> }
function IconInstall() { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z" strokeLinejoin="round"/><path d="M4 18h16" strokeLinecap="round"/></svg> }
function IconShield()  { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round"/></svg> }
function IconVocab()   { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinejoin="round"/></svg> }
function IconNotebook(){ return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 4a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4z" strokeLinejoin="round"/><path d="M8 2v20M12 7h3M12 11h3" strokeLinecap="round"/></svg> }
function IconNote()    { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" strokeLinejoin="round"/><path d="M15 3v6h6" strokeLinejoin="round"/></svg> }
function IconProgress(){ return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 14l3-4 3 3 4-6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconFolder()  { return <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" strokeLinejoin="round"/></svg> }
