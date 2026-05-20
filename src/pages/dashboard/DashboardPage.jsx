import { useNavigate } from 'react-router-dom'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Logo from '../../components/ui/Logo'
import Button from '../../components/ui/Button'
import useAuth from '../../hooks/useAuth'

const TEACHER_CARDS = [
  { title: 'Календарь',        text: 'Расписание всех уроков',           emoji: '📅' },
  { title: 'Группы',           text: 'Создание и управление группами',    emoji: '👥' },
  { title: 'Уроки',            text: 'Материалы, темы, ссылки',          emoji: '📚' },
  { title: 'Инд. курсы',       text: 'Расписание инд. занятий',          emoji: '🎯' },
  { title: 'Домашние задания', text: 'Создание, проверка и оценки',       emoji: '✏️' },
  { title: 'Посещаемость',     text: 'Отметить присутствие студентов',    emoji: '✅' },
  { title: 'Студенты',         text: 'Список и профили учеников',         emoji: '🎓' },
  { title: 'Оплата',           text: 'Расчёт и история платежей',         emoji: '💳' },
]

const STUDENT_CARDS = [
  { title: 'Календарь',        text: 'Мои уроки на месяц вперёд',        emoji: '📅' },
  { title: 'Мои группы',       text: 'Группы, в которых я учусь',        emoji: '👥' },
  { title: 'Уроки',            text: 'Материалы и темы занятий',          emoji: '📚' },
  { title: 'Домашние задания', text: 'Сдать работы, видеть оценки',       emoji: '✏️' },
  { title: 'Посещаемость',     text: 'Моя история присутствий',           emoji: '✅' },
  { title: 'Оплата',           text: 'Мои платежи и задолженности',       emoji: '💳' },
]

export default function DashboardPage() {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()
  const rootRef  = useRef(null)
  const cards    = isTeacher ? TEACHER_CARDS : STUDENT_CARDS

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-dash-anim]',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0F1629]">

      {/* Декоративные блобы — едва заметный фон */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="blob blob-1 w-[600px] h-[600px] -top-60 -left-40 bg-brand-700 opacity-20" />
        <div className="blob blob-2 w-[500px] h-[500px] bottom-0 right-0 bg-pink-accent opacity-10" />
      </div>

      {/* Хедер */}
      <header className="bg-[#141D35]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="md" onClick={() => navigate('/')} />

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Роль-бейдж */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isTeacher
                ? 'bg-brand-700/30 text-brand-300 border border-brand-600/30'
                : 'bg-white/[0.07] text-slate-300 border border-white/[0.10]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isTeacher ? 'Преподаватель' : 'Студент'}
            </span>

            {/* Аватар-инициал */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-white leading-none">{user?.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{user?.email}</div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">

        {/* Приветствие */}
        <div data-dash-anim className="mb-10">
          <p className="text-sm text-slate-400 mb-1">
            {isTeacher ? '👨‍🏫 Кабинет преподавателя' : '🎓 Личный кабинет студента'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Привет, {user?.name?.split(' ')[0] ?? 'друг'}!
          </h1>
        </div>

        {/* Информационный баннер */}
        <div data-dash-anim className="mb-8 p-4 sm:p-5 rounded-2xl border border-brand-600/30 bg-brand-900/25 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-700/40 flex items-center justify-center shrink-0 text-brand-300 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-300">Платформа в разработке</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isTeacher
                ? 'Разделы скоро откроются. Пока можно управлять данными через API.'
                : 'Разделы скоро откроются. Следи за расписанием у преподавателя.'}
            </p>
          </div>
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <DashCard key={card.title} card={card} index={i} isTeacher={isTeacher} />
          ))}
        </div>

        {/* Быстрые действия (только для учителя) */}
        {isTeacher && (
          <div data-dash-anim className="mt-10">
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">
              Быстрые действия
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <QuickAction emoji="➕" text="Создать урок" />
              <QuickAction emoji="👤" text="Добавить студента" />
              <QuickAction emoji="📝" text="Задать ДЗ" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function DashCard({ card, index, isTeacher }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(el,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 + index * 0.05 }
    )
    return () => tween.kill()
  }, [index])

  return (
    <div
      ref={ref}
      className={`group relative p-5 rounded-2xl border bg-white/[0.05] backdrop-blur-sm transition-all duration-200 cursor-not-allowed ${
        isTeacher
          ? 'border-white/[0.09] hover:border-brand-500/50 hover:bg-white/[0.08]'
          : 'border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.07]'
      }`}
    >
      <div className="text-2xl mb-3">{card.emoji}</div>
      <div className="font-medium text-sm text-white mb-0.5">{card.title}</div>
      <div className="text-xs text-slate-400 leading-relaxed">{card.text}</div>
      <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.08] text-[11px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        Скоро
      </div>
    </div>
  )
}

function QuickAction({ emoji, text }) {
  return (
    <button
      disabled
      className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/[0.10] text-slate-500 text-sm cursor-not-allowed hover:border-brand-500/40 hover:text-brand-400 transition-colors"
    >
      <span className="text-lg">{emoji}</span>
      {text}
    </button>
  )
}
