import { useState, useLayoutEffect, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

// Интерактивный тур по кабинету: спотлайт-подсветка реального элемента + тултип.
// Без внешних зависимостей. Цели помечены атрибутом data-tour="..." прямо в разметке.
// Авто-старт один раз для новичка на дашборде (флаг lf_tour_done), повтор — событием 'lf:tour-start'.

const STEPS = [
  { sel: '[data-tour="quickstart"]', place: 'bottom', title: 'Быстрый старт',      text: 'Чеклист запуска кабинета: создайте группу, добавьте ученика и задайте ДЗ. Галочки проставляются сами.' },
  { sel: '[data-tour="kpi"]',        place: 'bottom', title: 'Ключевые метрики',   text: 'Уроки на сегодня, ДЗ без проверки, долги и посещаемость. Клик по карточке ведёт в раздел.' },
  { sel: '[data-tour="nav"]',        place: 'right',  title: 'Навигация',          text: 'Слева — все разделы: группы, ученики, домашние задания, посещаемость и финансы.' },
  { sel: '[data-tour="create"]',     place: 'bottom', title: 'Быстрое создание',   text: 'Отсюда за пару кликов создаёте урок, задание или добавляете ученика.' },
  { sel: '[data-tour="help"]',       place: 'left',   title: 'Помощь всегда рядом', text: 'Кнопка «?» на каждой странице открывает справку именно по этому разделу. Тур можно пройти заново со страницы помощи.' },
]

const TT_W = 300

export default function Tour({ autoStart = true }) {
  const { pathname } = useLocation()
  const [active, setActive] = useState(false)
  const [steps, setSteps]   = useState([])
  const [i, setI]           = useState(0)
  const [rect, setRect]     = useState(null)
  const [pos, setPos]       = useState(null) // позиция тултипа (считается по его реальной высоте)
  const ttRef               = useRef(null)

  const start = useCallback(() => {
    // Берём только реально видимые цели (скрытый мобильный сайдбар → width 0 → пропускаем).
    const avail = STEPS.filter(s => {
      const el = document.querySelector(s.sel)
      return el && el.getBoundingClientRect().width > 0
    })
    if (!avail.length) return
    setSteps(avail); setI(0); setRect(null); setActive(true)
  }, [])

  const finish = useCallback(() => {
    setActive(false)
    localStorage.setItem('lf_tour_done', '1')
  }, [])

  const next = useCallback(() => setI(prev => (prev < steps.length - 1 ? prev + 1 : (finish(), prev))), [steps.length, finish])
  const prev = useCallback(() => setI(p => Math.max(0, p - 1)), [])

  // Авто-старт для новичка: только десктоп (сайдбар виден) и только на дашборде.
  useEffect(() => {
    if (!autoStart) return
    if (localStorage.getItem('lf_tour_done') === '1') return
    if (window.innerWidth < 1024) return
    if (!/^\/dashboard/.test(pathname)) return
    const t = setTimeout(start, 800) // дать дашборду отрисоваться
    return () => clearTimeout(t)
  }, [autoStart, pathname, start])

  // Ручной перезапуск (кнопка на /help).
  useEffect(() => {
    const h = () => start()
    window.addEventListener('lf:tour-start', h)
    return () => window.removeEventListener('lf:tour-start', h)
  }, [start])

  // Escape закрывает тур.
  useEffect(() => {
    if (!active) return
    const h = (e) => { if (e.key === 'Escape') finish() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [active, finish])

  const step = steps[i]

  // Позиция подсветки: меряем цель, обновляем при скролле/ресайзе.
  useLayoutEffect(() => {
    if (!active || !step) return
    const el = document.querySelector(step.sel)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const measure = () => setRect(el.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [active, i, step])

  // Позиция тултипа: считаем по РЕАЛЬНОЙ высоте (ttRef), чтобы у нижних целей (кнопка «?»)
  // тултип не съезжал за экран и кнопки были видны.
  useLayoutEffect(() => {
    const place = () => {
      if (!active || !step || !rect) { setPos(null); return }
      const tt = ttRef.current
      const h = tt?.offsetHeight || 180
      const w = tt?.offsetWidth || TT_W
      const m = 12
      let top, left
      if (step.place === 'right')      { top = rect.top;         left = rect.right + m }
      else if (step.place === 'left')  { top = rect.top;         left = rect.left - w - m }
      else if (step.place === 'top')   { top = rect.top - h - m; left = rect.left }
      else                             { top = rect.bottom + m;  left = rect.left }
      left = Math.max(m, Math.min(left, window.innerWidth - w - m))
      top  = Math.max(m, Math.min(top,  window.innerHeight - h - m))
      setPos({ top, left })
    }
    place()
  }, [active, i, rect, step])

  if (!active || !step || !rect) return null

  const pad = 6
  const hi = { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      {/* Блокер кликов по фону — чтобы во время тура не уйти со страницы */}
      <div className="absolute inset-0" />

      {/* Дырка-подсветка: тёмная подложка через огромный box-shadow */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-300"
        style={{ ...hi, boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)', outline: '2px solid rgba(59,130,246,0.9)', outlineOffset: 0 }}
      />

      {/* Тултип */}
      <div
        ref={ttRef}
        className="absolute rounded-2xl bg-white shadow-xl border border-slate-200 p-4 transition-opacity duration-150"
        style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: TT_W, maxWidth: 'calc(100vw - 24px)', opacity: pos ? 1 : 0 }}
      >
        <div className="text-xs font-medium text-blue-600 mb-1">Шаг {i + 1} из {steps.length}</div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">{step.title}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{step.text}</p>
        <div className="flex items-center justify-between">
          <button onClick={finish} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Пропустить</button>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={prev} className="h-8 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Назад</button>
            )}
            <button onClick={next} className="h-8 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              {i === steps.length - 1 ? 'Готово' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
