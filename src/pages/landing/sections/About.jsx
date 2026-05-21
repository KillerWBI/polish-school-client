import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../../../components/ui/Button'
import useAuth from '../../../hooks/useAuth'

gsap.registerPlugin(ScrollTrigger)

export default function About({ onPrimary }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-about-text]', {
        x: -40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        immediateRender: false,
        scrollTrigger: { trigger: rootRef.current, start: 'top 90%', once: true },
      })
      gsap.from('[data-about-visual]', {
        x: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: rootRef.current, start: 'top 90%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={rootRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Декор фоном */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="blob blob-2 w-[400px] h-[400px] top-1/2 -translate-y-1/2 -left-32 bg-brand-600" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Текстовая часть */}
        <div>
          <p data-about-text className="text-sm font-medium text-brand-600 mb-3 uppercase tracking-wider">
            Преподаватель
          </p>
          <h2 data-about-text className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink mb-5">
            Один учитель.<br />
            <span className="text-gradient">Личный подход.</span>
          </h2>
          <p data-about-text className="text-ink-muted leading-relaxed mb-4">
            Платформа создана для школы, где один преподаватель ведёт всех студентов лично.
            Никаких текучек, безликих ассистентов и потерянного контекста — учитель помнит,
            на чём вы остановились в прошлый раз.
          </p>
          <p data-about-text className="text-ink-muted leading-relaxed mb-8">
            Группы для тех, кто любит учиться вместе. Индивидуальные уроки — когда нужен
            свой темп. Можно совмещать.
          </p>

          <div data-about-text className="flex flex-wrap gap-3">
            {isAuthenticated
              ? <Button onClick={() => navigate('/calendar')}>Перейти в кабинет</Button>
              : <Button onClick={onPrimary}>Начать обучение</Button>
            }
          </div>
        </div>

        {/* Визуальный блок справа — стек карточек */}
        <div data-about-visual className="relative">
          <div className="relative max-w-md mx-auto">
            {/* Задняя карточка */}
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-gradient-to-br from-brand-400 to-pink-accent opacity-80 blur-md" />

            {/* Главная карточка */}
            <div className="relative bg-white/[0.06] backdrop-blur-sm rounded-3xl border border-white/[0.12] shadow-[0_8px_40px_rgba(139,92,246,0.18)] p-7">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center text-white text-xl font-semibold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-ink">Преподаватель</div>
                  <div className="text-xs text-slate-300">Польский • A1–C1</div>
                </div>
              </div>

              <div className="space-y-3">
                <Row icon="🇵🇱" text="Носитель методики коммуникативного обучения" />
                <Row icon="🎯" text="Индивидуальная программа под цель студента" />
                <Row icon="💬" text="Живая разговорная практика с первого урока" />
                <Row icon="📚" text="Авторские материалы и подборки" />
              </div>

              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-300">Сейчас принимаю студентов</span>
                <span className="flex items-center gap-1.5 text-green-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  доступен
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ icon, text }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-brand-900/40 transition-colors">
      <span className="text-xl shrink-0">{icon}</span>
      <span className="text-sm text-ink-soft">{text}</span>
    </div>
  )
}
