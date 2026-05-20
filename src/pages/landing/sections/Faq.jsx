import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  {
    q: 'Как проходят занятия?',
    a: 'Уроки идут онлайн через Zoom или Google Meet. Ссылка постоянная — сохранена в твоём расписании, не нужно каждый раз искать.',
  },
  {
    q: 'Можно ли учиться в группе и индивидуально одновременно?',
    a: 'Да. Можно записаться на групповые занятия и брать отдельные индивидуальные уроки под свои цели. Всё видно в одном календаре.',
  },
  {
    q: 'Как работают домашние задания?',
    a: 'Учитель прикрепляет ДЗ к уроку с описанием и сроком. Ты сдаёшь файл и комментарий — учитель проверяет и ставит оценку. Всё в одном окне.',
  },
  {
    q: 'Как считается оплата?',
    a: 'Оплата идёт по факту посещённых занятий — за пропуски не платишь. История всех платежей и текущий статус всегда под рукой.',
  },
  {
    q: 'Что если пропущу урок?',
    a: 'Все материалы урока (заметки, ссылки, файлы) сохраняются в карточке занятия. Можно посмотреть в любой момент и догнать тему.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-faq-anim]', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        immediateRender: false,
        scrollTrigger: { trigger: rootRef.current, start: 'top 90%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="faq" ref={rootRef} className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div data-faq-anim className="text-center mb-14">
          <p className="text-sm font-medium text-brand-600 mb-3 uppercase tracking-wider">
            Вопросы и ответы
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink">
            Коротко о <span className="text-gradient">главном</span>
          </h2>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item, i) => {
            const active = open === i
            return (
              <div
                key={i}
                data-faq-anim
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  active
                    ? 'bg-white/[0.07] border-brand-500/50 shadow-brand-sm'
                    : 'bg-white/[0.04] border-white/[0.09] hover:border-white/[0.18]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(active ? -1 : i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className={`font-medium transition-colors ${active ? 'text-brand-400' : 'text-ink'}`}>
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      active ? 'bg-gradient-to-br from-brand-500 to-pink-accent text-white rotate-45' : 'bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: active ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-ink-muted leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
