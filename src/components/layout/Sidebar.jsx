import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import { safeUrl } from '../../utils/safeUrl'
import Tooltip from '../ui/Tooltip'
import Logo from '../ui/Logo'
import {
  IconDashboard, IconCalendar, IconLessons, IconGroups, IconStudents, IconHomework,
  IconAttendance, IconMaterials, IconTests, IconPayments, IconTopics, IconVocab,
  IconDiary, IconDailySession, IconAdmin, IconPlan,
} from '../ui/icons'

// Навигация приложения. Свёрнута до иконок; разворачивается по наведению поверх контента,
// чтобы страница под ней не дёргалась. В мобильной шторке всегда развёрнута (collapsible=false).
const PLAN_LABEL = { free: 'Free', basic: 'Basic', pro: 'Pro', school: 'School' }

const TEACHER_SECTIONS = [
  { label: 'nav.sectionMain', items: [
    { path: '/dashboard', label: 'nav.dashboard', icon: IconDashboard },
    { path: '/calendar',  label: 'nav.calendar',  icon: IconCalendar },
  ]},
  { label: 'nav.sectionStudy', items: [
    { path: '/lessons',    label: 'nav.lessons',    icon: IconLessons },
    { path: '/students',   label: 'nav.students',   icon: IconStudents },
    { path: '/homework',   label: 'nav.homework',   icon: IconHomework },
    { path: '/attendance', label: 'nav.attendance', icon: IconAttendance },
    { path: '/materials',  label: 'nav.materials',  icon: IconMaterials },
    { path: '/tests',      label: 'nav.tests',      icon: IconTests },
  ]},
  { label: 'nav.sectionFinance', items: [
    { path: '/payments', label: 'nav.payments', icon: IconPayments },
  ]},
]

const STUDENT_SECTIONS = [
  { label: 'nav.sectionMain', items: [
    { path: '/dashboard', label: 'nav.dashboard',    icon: IconDashboard },
    { path: '/calendar',  label: 'nav.calendar',     icon: IconCalendar },
    { path: '/study',     label: 'nav.dailySession', icon: IconDailySession },
  ]},
  { label: 'nav.sectionWithTeacher', items: [
    { path: '/groups',     label: 'nav.myGroups',   icon: IconGroups },
    { path: '/homework',   label: 'nav.homework',   icon: IconHomework },
    { path: '/attendance', label: 'nav.attendance', icon: IconAttendance },
    { path: '/materials',  label: 'nav.materials',  icon: IconMaterials },
    { path: '/payments',   label: 'nav.payments',   icon: IconPayments },
  ]},
  { label: 'nav.sectionSelf', items: [
    { path: '/topics', label: 'nav.topics', icon: IconTopics },
    { path: '/tests',  label: 'nav.tests',  icon: IconTests },
    { path: '/vocab',  label: 'nav.vocab',  icon: IconVocab },
    { path: '/diary',  label: 'nav.diary',  icon: IconDiary },
  ]},
]

const ADMIN_EXTRA_SECTION = {
  label: 'nav.sectionAdmin',
  items: [{ path: '/admin', label: 'nav.adminPanel', icon: IconAdmin }],
}

export default function Sidebar({ onClose, collapsible = true }) {
  const { t } = useTranslation('app')
  const { user, isTeacher } = useAuth()
  const [hovered, setHovered] = useState(false)
  const open = !collapsible || hovered

  const isAdmin = user?.role === 'admin'
  const baseSections = isTeacher ? TEACHER_SECTIONS : STUDENT_SECTIONS
  const sections = isAdmin ? [...baseSections, ADMIN_EXTRA_SECTION] : baseSections

  const linkClass = ({ isActive }) =>
    `w-full flex items-center gap-2.5 h-9 rounded-lg text-[13px] transition-colors ${
      open ? 'px-2.5' : 'px-0 justify-center'
    } ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`

  // В свёрнутом виде подпись не рендерим вовсе, иначе она съедает отступ и сбивает центровку иконок
  const label = (text) => open ? <span className="truncate">{text}</span> : null

  return (
    <aside
      onMouseEnter={collapsible ? () => setHovered(true) : undefined}
      onMouseLeave={collapsible ? () => setHovered(false) : undefined}
      className={`flex flex-col h-screen bg-white border-r border-[#EAECEF] overflow-hidden ${
        collapsible
          ? `fixed left-0 top-0 z-40 transition-[width] duration-200 ease-out ${open ? 'w-60 shadow-[8px_0_28px_rgba(15,23,42,0.06)]' : 'w-16'}`
          : 'w-60'
      }`}
    >
      {/* Лого */}
      <Link to="/dashboard" onClick={onClose}
        className={`flex items-center gap-2.5 h-16 shrink-0 border-b border-[#F0F2F5] ${open ? 'px-5' : 'justify-center'}`}>
        <Logo size={26} />
        {label(<span className="font-mono text-sm font-semibold text-[#0F172A] tracking-tight">Diklaro</span>)}
      </Link>

      {/* Аватар — вход в профиль. Имя и роль показаны в шапке, здесь не дублируются. */}
      <div className={`py-3 shrink-0 ${open ? 'px-3' : 'flex justify-center'}`}>
        <Tooltip text={t('sidebar.openProfile')} side="right">
          <Link to="/profile" onClick={onClose}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-transparent hover:ring-blue-200 transition-all">
            {user?.avatar
              ? <img src={safeUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
              : (user?.name?.[0]?.toUpperCase() ?? '?')}
          </Link>
        </Tooltip>
      </div>

      {/* Навигация */}
      <nav data-tour="nav" className="flex-1 px-3 pb-2 overflow-y-auto overflow-x-hidden space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            {open
              ? <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A0AAB8] px-2.5 mb-1.5 truncate">{t(section.label)}</p>
              : <div className="h-px bg-[#EAECEF] mx-2 mb-2" />}
            <div className="space-y-0.5">
              {section.items.map(({ path, label: key, icon: Icon }) => (
                <Tooltip key={path} className="w-full" side="right" text={open ? '' : t(key)}>
                  <NavLink to={path} onClick={onClose} className={linkClass}>
                    <Icon size={17} />
                    {label(t(key))}
                  </NavLink>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Тариф — заметная точка входа к оплате */}
      <div className={`shrink-0 border-t border-[#EAECEF] ${open ? 'p-3' : 'p-2 flex justify-center'}`}>
        <Tooltip side="right" text={open ? '' : t('sidebar.planTooltip', { plan: PLAN_LABEL[user?.plan] ?? 'Free' })}>
          <Link to="/plans" onClick={onClose}
            className={`flex items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ${
              open ? 'w-full gap-2.5 px-3 py-2.5' : 'w-10 h-10 justify-center'
            }`}>
            <IconPlan size={17} />
            {open && (
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] text-blue-500 leading-tight truncate">
                  {t('sidebar.planCurrent', { plan: PLAN_LABEL[user?.plan] ?? 'Free' })}
                </span>
                <span className="block text-[13px] font-semibold leading-tight truncate">{t('sidebar.planUpgrade')}</span>
              </span>
            )}
          </Link>
        </Tooltip>
      </div>
    </aside>
  )
}
