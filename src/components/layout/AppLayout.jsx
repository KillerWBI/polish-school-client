import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Topbar, { SearchBox, NotifBell } from './Topbar'
import HelpFab from './HelpFab'
import Tour from '../tour/Tour'
import EmailVerificationBanner from '../auth/EmailVerificationBanner'

// Светлый SaaS-каркас: плавающий сайдбар + топ-бар с поиском.
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const { isTeacher } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex">
      {/* Десктопный sidebar */}
      <div className="hidden lg:flex p-3 pr-0">
        <Sidebar />
      </div>

      {/* Мобильный drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex p-3">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Мобильный хедер */}
        <header className="lg:hidden flex items-center gap-2 px-3 h-14 bg-white border-b border-[#EAECEF]">
          <button onClick={() => setMobileOpen(true)} aria-label="Меню"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-blue-600" />
            <span className="font-mono text-sm font-semibold text-[#0F172A]">LinguaFlow</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setMobileSearch(v => !v)} aria-label="Поиск"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">
              {mobileSearch ? <X size={18} /> : <Search size={18} />}
            </button>
            <NotifBell isTeacher={isTeacher} navigate={navigate} />
          </div>
        </header>

        {/* Раскрывающийся поиск (моб.) */}
        {mobileSearch && (
          <div className="lg:hidden px-3 py-2 bg-white border-b border-[#EAECEF]">
            <SearchBox isTeacher={isTeacher} navigate={navigate} />
          </div>
        )}

        <Topbar />
        <EmailVerificationBanner />

        <main className="flex-1 overflow-y-auto">
          {/* Центрируем контент и ограничиваем ширину — чтобы страницы не «растягивались» на весь монитор */}
          <div className="mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Плавающая кнопка помощи — на каждой странице */}
      <HelpFab />

      {/* Интерактивный тур (авто-старт для новичка-учителя) */}
      <Tour autoStart={isTeacher} />
    </div>
  )
}
