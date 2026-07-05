import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import EmailVerificationBanner from '../auth/EmailVerificationBanner'

// Светлый SaaS-каркас: плавающий сайдбар + топ-бар с поиском.
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-[#EAECEF]">
          <button onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-blue-600" />
            <span className="font-mono text-sm font-semibold text-[#0F172A]">LinguaFlow</span>
          </Link>
        </header>

        <Topbar />
        <EmailVerificationBanner />

        <main className="flex-1 overflow-y-auto">
          {/* Центрируем контент и ограничиваем ширину — чтобы страницы не «растягивались» на весь монитор */}
          <div className="mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
