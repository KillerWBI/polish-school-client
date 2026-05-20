import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import useAuth from '../../hooks/useAuth'
import Logo from '../../components/ui/Logo'

export default function WelcomePage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const rootRef   = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-welcome]',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const name       = user?.name?.split(' ')[0] || 'друг'
  const isTeacher  = user?.role === 'teacher'

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#0F1629] flex items-center justify-center overflow-hidden">

      {/* Блобы */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="blob blob-1 w-[700px] h-[700px] -top-40 -left-32 bg-brand-600" />
        <div className="blob blob-2 w-[600px] h-[600px] -bottom-32 -right-32 bg-pink-accent" />
        <div className="blob blob-1 w-[400px] h-[400px] top-1/3 left-1/2 bg-brand-500 opacity-20" />
      </div>

      {/* Верхняя полоска */}
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent" />

      <div className="absolute top-6 left-6">
        <Logo size="md" onClick={() => navigate('/')} />
      </div>

      <div className="max-w-2xl w-full px-6 text-center">

        {/* Бейдж */}
        <div
          data-welcome
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] backdrop-blur border border-white/[0.12] text-xs text-slate-300 mb-7"
        >
          <span>{isTeacher ? '👨‍🏫' : '🎉'}</span>
          {isTeacher ? 'Вход выполнен' : 'Аккаунт готов'}
        </div>

        {/* Заголовок */}
        <h1
          data-welcome
          className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-semibold tracking-tight text-white mb-6"
        >
          Привет, <span className="text-gradient">{name}</span>!<br />
          Давай начнём.
        </h1>

        <p data-welcome className="text-lg text-slate-400 max-w-md mx-auto mb-10">
          {isTeacher
            ? 'Твой кабинет преподавателя готов. Управляй группами, уроками и студентами в одном месте.'
            : 'Твой личный кабинет уже готов. Здесь будут расписание, материалы, задания и всё важное для учёбы.'}
        </p>

        {/* CTA */}
        <div data-welcome>
          <button
            onClick={() => navigate('/calendar')}
            className="h-14 px-10 rounded-2xl text-white font-semibold btn-river hover:shadow-brand active:scale-[0.98] transition-shadow cursor-pointer"
          >
            Перейти в кабинет →
          </button>
        </div>

        {/* Карточки-подсказки */}
        <div data-welcome className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {isTeacher ? (
            <>
              <Hint emoji="📅" title="Расписание" text="Все уроки групп и студентов" />
              <Hint emoji="👥" title="Группы" text="Создавай группы и добавляй студентов" />
              <Hint emoji="✏️" title="Домашние задания" text="Создавай и проверяй ДЗ" />
            </>
          ) : (
            <>
              <Hint emoji="📅" title="Расписание" text="Все уроки в одном календаре" />
              <Hint emoji="📚" title="Материалы" text="Подборки и ссылки к каждому уроку" />
              <Hint emoji="✅" title="Прогресс" text="История посещений и оценок" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Hint({ emoji, title, text }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.09] backdrop-blur-sm">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-sm font-semibold text-white mb-0.5">{title}</div>
      <div className="text-xs text-slate-400 leading-relaxed">{text}</div>
    </div>
  )
}
