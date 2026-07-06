import { useNavigate, useLocation } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { helpSectionFor } from '../../utils/helpSection'

// Плавающая кнопка помощи «?» в углу — на каждой странице кабинета.
// Ведёт на справку сразу к секции текущей страницы. На /help не показывается.
export default function HelpFab() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (pathname.startsWith('/help')) return null

  const section = helpSectionFor(pathname)
  return (
    <button
      onClick={() => navigate(`/help${section ? `#${section}` : ''}`)}
      title="Помощь по этой странице"
      aria-label="Помощь по этой странице"
      className="group fixed z-40 bottom-4 right-4 sm:bottom-6 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
    >
      <span className="absolute inset-0 rounded-full bg-blue-500 help-fab-pulse pointer-events-none" />
      <HelpCircle size={22} className="relative" />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap text-xs bg-slate-900 text-white px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
        Помощь по странице
      </span>
    </button>
  )
}
