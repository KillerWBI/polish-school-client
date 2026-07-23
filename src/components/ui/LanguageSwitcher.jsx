import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED, LANG_NAMES } from '../../i18n/countryToLang'

// Переключатель языка. variant: 'light' (в приложении) | 'dark' (на тёмном лендинге).
// Дропдаун рендерится порталом в document.body (как в админке) — не обрезается краем
// сайдбара и открывается вверх, если снизу не хватает места.
export default function LanguageSwitcher({ variant = 'light', className = '' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const current = (i18n.language || 'en').split('-')[0]

  const DROP_W = 176
  const DROP_H = SUPPORTED.length * 40 + 8

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      // position: fixed → координаты вьюпорта (без scrollY). Сайдбар sticky —
      // кнопка не двигается во вьюпорте, поэтому меню остаётся приклеенным при прокрутке.
      const openUp = (window.innerHeight - r.bottom) < DROP_H
      const top = openUp ? r.top - DROP_H - 4 : r.bottom + 4
      const left = Math.max(8, Math.min(r.left, window.innerWidth - DROP_W - 8))
      setPos({ top, left })
    }
    setOpen(v => !v)
  }

  const choose = (lng) => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lf_lang', lng) } catch { /* ignore */ }
    setOpen(false)
  }

  const isDark = variant === 'dark'
  const btnCls = isDark
    ? 'text-[#B4B4BA] hover:text-white border border-[#3C3C43] hover:border-[#3A3A40]'
    : 'text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'

  return (
    <div className={className}>
      <button ref={btnRef} onClick={toggle}
        className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] transition-colors cursor-pointer ${btnCls}`}>
        <Globe className="w-4 h-4" />
        <span className="uppercase">{current}</span>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: DROP_W }}
            className="rounded-xl border border-slate-200 bg-white shadow-xl z-[9999] py-1 max-h-72 overflow-y-auto">
            {SUPPORTED.map((lng) => (
              <button key={lng} onClick={() => choose(lng)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                  current === lng ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}>
                {LANG_NAMES[lng]}
                {current === lng && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
