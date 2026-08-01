import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

// Подсказка при наведении: появляется почти сразу (100 мс — только чтобы не мигала
// при проведении курсором мимо) и простыми словами поясняет, что делает элемент.
// Пропадает мгновенно, как только курсор ушёл. Оборачивает любой элемент:
//   <Tooltip text="Создать новую группу учеников"><button>…</button></Tooltip>
// side — с какой стороны показывать (bottom по умолчанию).
//
// Само облачко рисуется порталом в body с position:fixed. Иначе внутри контейнера
// со скроллом (вкладки, узкие карточки) оно раздувало родителя и браузер показывал
// полосы прокрутки — при наведении «выезжало поле».
export default function Tooltip({ text, side = 'bottom', children, className = '' }) {
  const [coords, setCoords] = useState(null)
  const anchor = useRef(null)
  const timer  = useRef(null)

  const place = () => {
    const r = anchor.current?.getBoundingClientRect()
    if (!r) return
    setCoords({
      bottom: { top: r.bottom + 8,        left: r.left + r.width / 2 },
      top:    { top: r.top - 8,           left: r.left + r.width / 2 },
      right:  { top: r.top + r.height / 2, left: r.right + 8 },
      left:   { top: r.top + r.height / 2, left: r.left - 8 },
    }[side])
  }

  const open  = () => { timer.current = setTimeout(place, 100) }
  const close = () => { clearTimeout(timer.current); setCoords(null) }

  // Координаты посчитаны один раз — при скролле/ресайзе они устаревают, поэтому прячем
  useEffect(() => {
    if (!coords) return
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [coords])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!text) return children

  const shift = {
    bottom: 'translate(-50%, 0)',
    top:    'translate(-50%, -100%)',
    right:  'translate(0, -50%)',
    left:   'translate(-100%, -50%)',
  }[side]

  return (
    <span
      ref={anchor}
      className={`relative inline-flex ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocusCapture={open}
      onBlurCapture={close}
    >
      {children}
      {coords && createPortal(
        <span
          role="tooltip"
          style={{ top: coords.top, left: coords.left, transform: shift }}
          className="pointer-events-none fixed z-[100] w-max max-w-[240px] whitespace-normal text-left text-[11.5px] leading-snug font-normal text-white bg-slate-900 px-2.5 py-1.5 rounded-lg shadow-[0_8px_24px_rgba(15,23,42,0.25)]"
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}
