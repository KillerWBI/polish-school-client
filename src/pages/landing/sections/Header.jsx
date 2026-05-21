import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../components/ui/Logo'
import Button from '../../../components/ui/Button'
import useAuth from '../../../hooks/useAuth'

export default function Header({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0F1629]/90 backdrop-blur-xl border-b border-white/[0.10]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-18 flex items-center justify-between">
        <Logo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
          <button onClick={() => scrollTo('features')} className="hover:text-brand-400 transition-colors cursor-pointer">
            Возможности
          </button>
          <button onClick={() => scrollTo('about')} className="hover:text-brand-400 transition-colors cursor-pointer">
            Преподаватель
          </button>
          <button onClick={() => scrollTo('faq')} className="hover:text-brand-400 transition-colors cursor-pointer">
            Вопросы
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="hidden sm:inline-flex">
                Выйти
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/calendar')}>
                <span className="hidden sm:inline">В кабинет, {user?.name?.split(' ')[0]}</span>
                <span className="sm:hidden">В кабинет</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLogin} className="hidden sm:inline-flex">
                Войти
              </Button>
              <Button variant="primary" size="sm" onClick={onRegister}>
                Начать
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
