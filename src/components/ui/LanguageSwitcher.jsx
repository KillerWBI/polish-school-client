import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED, LANG_NAMES } from '../../i18n/countryToLang'

// Переключатель языка. variant: 'light' (в приложении) | 'dark' (на тёмном лендинге).
export default function LanguageSwitcher({ variant = 'light', className = '' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = (i18n.language || 'en').split('-')[0]

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const choose = (lng) => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lf_lang', lng) } catch { /* ignore */ }
    setOpen(false)
  }

  const isDark = variant === 'dark'
  const btnCls = isDark
    ? 'text-[#B4B4BA] hover:text-white border border-[#2A2A2E] hover:border-[#3A3A40]'
    : 'text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] transition-colors cursor-pointer ${btnCls}`}>
        <Globe className="w-4 h-4" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-[9999] py-1 overflow-hidden">
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
      )}
    </div>
  )
}
