import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Универсальная модалка с overlay, Esc, блокировкой скролла и focus trap (a11y)
export default function Modal({ open, onClose, children, maxWidth = 'max-w-md' }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (!open) return
    document.body.classList.add('no-scroll')
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // Focus trap: Tab/Shift+Tab остаются внутри модалки, первый элемент получает фокус
  useEffect(() => {
    if (!open) return
    const el = contentRef.current
    if (!el) return
    const nodes = [...el.querySelectorAll(FOCUSABLE_SELECTOR)]
    if (!nodes.length) return
    nodes[0].focus()
    const trap = (e) => {
      if (e.key !== 'Tab') return
      const first = nodes[0]
      const last  = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    el.addEventListener('keydown', trap)
    return () => el.removeEventListener('keydown', trap)
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-overlay-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      {/* Затемнение */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Контент */}
      <div
        ref={contentRef}
        className={`relative w-full ${maxWidth} bg-white border border-slate-200 rounded-2xl shadow-[0_24px_64px_rgba(15,23,42,0.18)] animate-modal-in`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
