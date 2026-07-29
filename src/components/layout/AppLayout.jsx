import { useState, Suspense } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '../ui/Spinner'
import useAuth from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Topbar, { NotifBell, ProfileMenu } from './Topbar'
import Tour from '../tour/Tour'
import EmailVerificationBanner from '../auth/EmailVerificationBanner'
import { IconMenu } from '../ui/icons'

// Светлый SaaS-каркас: сайдбар во всю высоту слева + шапка с уведомлениями и профилем.
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isTeacher } = useAuth()
  const { t } = useTranslation('app')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex">
      {/* Десктопный сайдбар: сам закреплён слева, здесь — полоса под свёрнутое состояние */}
      <div className="hidden lg:block w-16 shrink-0" />
      <div className="hidden lg:block"><Sidebar /></div>

      {/* Мобильная шторка — сайдбар всегда развёрнут */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex">
            <Sidebar collapsible={false} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Мобильный хедер */}
        <header className="lg:hidden flex items-center gap-2 px-3 h-14 bg-white border-b border-[#EAECEF]">
          <button onClick={() => setMobileOpen(true)} aria-label={t('topbar.openMenu')}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
            <IconMenu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-blue-600" />
            <span className="font-mono text-sm font-semibold text-[#0F172A]">Diklario</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <NotifBell navigate={navigate} />
            <ProfileMenu navigate={navigate} onNavigate={() => setMobileOpen(false)} />
          </div>
        </header>

        <Topbar />
        <EmailVerificationBanner />

        <main className="flex-1 overflow-y-auto">
          {/* Центрируем контент и ограничиваем ширину — чтобы страницы не «растягивались» на весь монитор */}
          <div className="mx-auto w-full max-w-[1320px]">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Интерактивный тур (авто-старт для новичка-учителя) */}
      <Tour autoStart={isTeacher} />
    </div>
  )
}
