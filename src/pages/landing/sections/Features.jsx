import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    title: 'Живые уроки',
    text: 'Групповые и индивидуальные занятия с постоянной Zoom/Meet ссылкой — без поиска по чатам.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Расписание',
    text: 'Календарь с уроками на месяц вперёд. Учитель генерирует, ученик — просто видит, когда идти учиться.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Домашние задания',
    text: 'Загрузка файлов через Cloudinary, комментарии, оценки. Студент видит статус — учитель проверяет в одном окне.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Материалы',
    text: 'Ссылки, файлы и заметки прикреплены к каждому уроку. Всё, что обсуждали, останется с тобой.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12h6M9 8h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Посещаемость',
    text: 'Учитель отмечает присутствие — студент видит свою историю. Прозрачно и без споров.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Оплата',
    text: 'Автоматический расчёт по факту посещения. История платежей всегда под рукой.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Features() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-feat-title]', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '[data-feat-title]',
          start: 'top 92%',
          once: true,
        },
      })
      gsap.from('[data-feat-card]', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        immediateRender: false,
        scrollTrigger: {
          trigger: '[data-feat-grid]',
          start: 'top 90%',
          once: true,
        },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={rootRef} className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div data-feat-title className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-brand-600 mb-3 uppercase tracking-wider">
            Возможности
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink mb-4">
            Всё для обучения <span className="text-gradient">в одном месте</span>
          </h2>
          <p className="text-ink-muted">
            Платформа собирает уроки, материалы и прогресс так, чтобы ничего не терялось.
          </p>
        </div>

        <div data-feat-grid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              data-feat-card
              className="group relative p-7 bg-white/[0.05] rounded-3xl border border-white/[0.09] hover:border-brand-500/50 hover:shadow-brand-sm hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1"
            >
              {/* Градиентный кружок под иконку */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-700/50 to-pink-accent/20 text-brand-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
