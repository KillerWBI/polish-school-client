import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Универсальная модалка с overlay, закрытием по Esc и блокировкой скролла
export default function Modal({ open, onClose, children, maxWidth = 'max-w-md' }) {
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
        className={`relative w-full ${maxWidth} bg-white border border-slate-200 rounded-2xl shadow-[0_24px_64px_rgba(15,23,42,0.18)] animate-modal-in`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
