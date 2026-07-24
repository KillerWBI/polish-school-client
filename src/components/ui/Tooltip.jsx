import { useState, useRef } from 'react'

// Подсказка при наведении: появляется через 1 секунду и простыми словами поясняет,
// что делает элемент. Оборачивает любой элемент:
//   <Tooltip text="Создать новую группу учеников"><button>…</button></Tooltip>
// side — с какой стороны показывать (bottom по умолчанию).
export default function Tooltip({ text, side = 'bottom', children, className = '' }) {
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  const open  = () => { timer.current = setTimeout(() => setShow(true), 1000) }
  const close = () => { clearTimeout(timer.current); setShow(false) }

  if (!text) return children

  const pos = {
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
  }[side]

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocusCapture={open}
      onBlurCapture={close}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-[60] ${pos} w-max max-w-[240px] whitespace-normal text-left text-[11.5px] leading-snug font-normal text-white bg-slate-900 px-2.5 py-1.5 rounded-lg shadow-[0_8px_24px_rgba(15,23,42,0.25)]`}
        >
          {text}
        </span>
      )}
    </span>
  )
}
