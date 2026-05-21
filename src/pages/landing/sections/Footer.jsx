import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../../../components/ui/Button'
import Logo from '../../../components/ui/Logo'
import useAuth from '../../../hooks/useAuth'

gsap.registerPlugin(ScrollTrigger)

export default function Footer({ onPrimary }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-cta]', {
        scale: 0.95,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: rootRef.current, start: 'top 90%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={rootRef} className="relative pt-16">
      {/* Большой CTA */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div
          data-cta
          className="relative overflow-hidden rounded-[2rem] p-10 sm:p-16 text-center bg-[linear-gradient(135deg,#8B5CF6_0%,#EC4899_100%)]"
        >
          {/* Декоративные круги */}
          <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

          <h2 className="relative text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            {isAuthenticated
              ? <>Добро пожаловать<br />обратно!</>
              : <>Готов начать говорить<br />на польском?</>
            }
          </h2>
          <p className="relative text-white/90 max-w-xl mx-auto mb-8">
            {isAuthenticated
              ? 'Все твои уроки, материалы и задания — в личном кабинете.'
              : 'Создай аккаунт и записывайся на первый урок. Бесплатное знакомство — обсудим цели и подберём программу.'
            }
          </p>
          <div className="relative inline-flex">
            <button
              onClick={() => isAuthenticated ? navigate('/calendar') : onPrimary()}
              className="h-14 px-8 rounded-2xl bg-white text-brand-700 font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 shadow-2xl cursor-pointer"
            >
              {isAuthenticated ? 'В кабинет →' : 'Записаться на урок →'}
            </button>
          </div>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-14 pb-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-ink-muted">
        <Logo size="sm" />
        <div className="flex items-center gap-6">
          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => navigate('/teacher-login')}
                className="hover:text-brand-700 transition-colors cursor-pointer"
              >
                Я преподаватель
              </button>
              <span className="text-white/20">·</span>
            </>
          )}
          <span>© {new Date().getFullYear()} PLatform</span>
        </div>
      </div>
    </footer>
  )
}
