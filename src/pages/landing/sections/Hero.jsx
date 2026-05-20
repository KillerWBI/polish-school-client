import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../../../components/ui/Button'

gsap.registerPlugin(ScrollTrigger)

const ROTATING_WORDS = ['Polski', 'польский', 'Polnisch', 'Polish']

export default function Hero({ onPrimary, onSecondary }) {
  const rootRef = useRef(null)
  const wordRef = useRef(null)
  const fogRef  = useRef(null)
  const [idx, setIdx] = useState(0)

  // Появление hero при загрузке
  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-anim]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Туман растягивается при скролле — стартует только после того,
  // как контент hero уже ушёл на 45% вверх, чтобы не перекрывать текст
  useEffect(() => {
    if (!fogRef.current || !rootRef.current) return

    const tween = gsap.to(fogRef.current, {
      scaleY: 5,
      transformOrigin: 'bottom center',
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        start: '45% top',   // начинаем когда 45% секции ушло за верх вьюпорта
        end:   'bottom top',
        scrub: 2,
      },
    })

    return () => tween.kill()
  }, [])

  // Fade-out по интервалу → меняем слово через setIdx
  // y не используем: translateY двигал элемент и сдвигал «Учи»
  // После fade-out GSAP оставляет inline opacity:0 на DOM-ноде,
  // React меняет текст, следующий useEffect плавно проявляет новое слово
  useEffect(() => {
    const interval = setInterval(() => {
      const el = wordRef.current
      if (!el) return
      gsap.to(el, {
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => setIdx((i) => (i + 1) % ROTATING_WORDS.length),
      })
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Fade-in каждый раз когда idx меняется (React отрендерил новый текст,
  // а inline opacity:0 от предыдущей анимации уже стоит на элементе)
  useEffect(() => {
    const el = wordRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, filter: 'blur(6px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.38, ease: 'power3.out' }
    )
  }, [idx])

  return (
    // overflow-hidden убран: теперь на внутреннем blob-контейнере,
    // чтобы туман мог «вылезать» за нижний край секции
    <section ref={rootRef} className="relative pt-32 sm:pt-40 pb-24 sm:pb-32">

      {/* Блобы заперты в своём overflow-hidden контейнере */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="blob blob-1 w-[520px] h-[520px] -top-32 -left-20 bg-brand-400" />
        <div className="blob blob-2 w-[460px] h-[460px] top-20 -right-20 bg-pink-accent" />
        <div className="blob blob-1 w-[380px] h-[380px] top-[55%] left-[40%] bg-brand-300 opacity-30" />
      </div>

      {/* Туман снизу — изначально тонкий (не перекрывает текст),
          при скролле растягивается вверх через scaleY */}
      <div
        ref={fogRef}
        aria-hidden
        className="absolute bottom-0 left-0 right-0 pointer-events-none will-change-transform"
        style={{
          height: '72px',
          zIndex: 20,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(15,22,41,0.55) 55%, #0F1629 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
        {/* Маленький бейдж */}
        <div
          data-hero-anim
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.07] backdrop-blur text-xs text-slate-300 mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Живые онлайн-уроки польского
        </div>

        {/* Основной заголовок с меняющимся словом */}
        <h1
          data-hero-anim
          className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] font-semibold tracking-tight text-ink mb-6"
        >
          Учи{' '}
          <span className="relative inline-block align-baseline">
            <span ref={wordRef} className="inline-block text-gradient">
              {ROTATING_WORDS[idx]}
            </span>
          </span>
          <br />
          c живым&nbsp;преподавателем
        </h1>

        <p
          data-hero-anim
          className="max-w-2xl mx-auto text-base sm:text-lg text-ink-muted mb-10"
        >
          Расписание, материалы, домашние задания и оплата —
          всё&nbsp;в&nbsp;одной&nbsp;платформе. Без чатов, таблиц и потерянных файлов.
        </p>

        <div data-hero-anim className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={onPrimary}>
            Начать учиться
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <Button size="lg" variant="secondary" onClick={onSecondary}>
            У меня уже есть аккаунт
          </Button>
        </div>

        {/* Stat-полоса */}
        <div
          data-hero-anim
          className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-ink-muted"
        >
          <Stat value="1:1" label="индивидуальные занятия" />
          <Dot />
          <Stat value="∞" label="материалы под рукой" />
          <Dot />
          <Stat value="100%" label="прогресс под контролем" />
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-ink">{value}</span>
      <span>{label}</span>
    </div>
  )
}

function Dot() {
  return <span className="w-1 h-1 rounded-full bg-white/30 hidden sm:inline-block" />
}
