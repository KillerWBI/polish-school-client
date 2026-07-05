import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

// Тёмный тех-моно хедер лендинга.
export default function Header({ onLogin, onRegister }) {
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-[#0A0A0B]/85 backdrop-blur-md border-b border-[#1E1E22]' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Лого */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-[2px] bg-brand-500 group-hover:bg-brand-400 transition-colors" />
          <span className="font-mono text-sm font-semibold text-[#EDEDED] tracking-tight">LinguaFlow</span>
        </button>

        {/* Нав — моно */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[13px] text-[#8A8A8F]">
          <button onClick={() => scrollTo('features')} className="hover:text-[#EDEDED] transition-colors cursor-pointer">возможности</button>
          <button onClick={() => scrollTo('how')}      className="hover:text-[#EDEDED] transition-colors cursor-pointer">как&nbsp;работает</button>
          <button onClick={() => scrollTo('faq')}       className="hover:text-[#EDEDED] transition-colors cursor-pointer">вопросы</button>
        </nav>

        {/* Действия */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer"
            >
              В кабинет{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </button>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="hidden sm:inline-flex h-9 px-3 items-center rounded-lg text-[13px] text-[#B4B4BA] hover:text-white transition-colors cursor-pointer"
              >
                Войти
              </button>
              <button
                onClick={onRegister}
                className="h-9 px-4 rounded-lg bg-white text-[#0A0A0B] text-[13px] font-medium hover:bg-[#EDEDED] transition-colors cursor-pointer"
              >
                Начать
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
