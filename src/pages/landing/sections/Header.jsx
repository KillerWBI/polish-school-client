import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../../hooks/useAuth'
import RoleSwitch from './RoleSwitch'
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher'
import Logo from '../../../components/ui/Logo'

// Светлая шапка лендинга. Один компонент на обе роли: раньше лендинг ученика
// держал собственную почти дословную копию и они расходились при правках.
// role меняет только набор якорей, состояние переключателя и адрес регистрации.
export default function Header({ role = 'teacher', onLogin, onRegister }) {
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation('common')
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const nav = role === 'student'
    ? [
        { key: 'features', onClick: () => scrollTo('features') },
        { key: 'how',      onClick: () => scrollTo('how') },
        { key: 'faq',      onClick: () => scrollTo('faq') },
      ]
    : [
        { key: 'features', onClick: () => scrollTo('features') },
        { key: 'how',      onClick: () => scrollTo('how') },
        { key: 'pricing',  onClick: () => scrollTo('pricing') },
        { key: 'faq',      onClick: () => scrollTo('faq') },
        { key: 'support',  onClick: () => navigate('/support') },
      ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#EDF1F4] shadow-[0_1px_12px_rgba(16,24,40,0.05)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Лого */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <Logo size={30} />
          <span className="font-display text-[19px] font-bold text-[#0E1726] tracking-tight">Peravenor</span>
        </button>

        {/* Нав */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-[#5A6B7C]">
          {nav.map(({ key, onClick }) => (
            <button
              key={key}
              onClick={onClick}
              className="whitespace-nowrap hover:text-[#0E1726] transition-colors cursor-pointer"
            >
              {t(`header.${key}`)}
            </button>
          ))}
        </nav>

        {/* Действия */}
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <RoleSwitch active={role} />
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[14px] font-semibold transition-colors cursor-pointer"
            >
              {user?.name ? t('header.toDashboardName', { name: user.name.split(' ')[0] }) : t('header.toDashboard')}
            </button>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="hidden sm:inline-flex h-10 px-3 items-center rounded-lg text-[14px] text-[#5A6B7C] hover:text-[#0E1726] transition-colors cursor-pointer"
              >
                {tc('login')}
              </button>
              <button
                onClick={onRegister}
                className="h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[14px] font-semibold transition-colors cursor-pointer shadow-[0_8px_20px_-10px_rgba(43,176,174,0.9)]"
              >
                {tc('register')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
