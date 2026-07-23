import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { ISO_LANGUAGES, LANG_BY_CODE } from '../../constants/isoLanguages'

// Выпадающий выбор языка с поиском (по английскому названию / родному / ISO-коду).
// Язык выбирается ТОЛЬКО из фиксированного списка → в базе всегда чистый ISO-код, без опечаток.
// props: value (код или ''), onChange(code), placeholder, id.
export default function LanguageSelect({ value, onChange, placeholder = 'Выберите язык', id }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const boxRef = useRef(null)

  // Закрываем меню при клике вне компонента (слушатель на document живёт, пока компонент смонтирован)
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc) // cleanup — снять слушатель при размонтировании
  }, [])

  // Фильтрация списка по строке поиска. useMemo пересчитывает только при изменении q.
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return ISO_LANGUAGES
    return ISO_LANGUAGES.filter((l) =>
      l.name.toLowerCase().includes(s) || l.native.toLowerCase().includes(s) || l.code.includes(s)
    )
  }, [q])

  const selected = value ? LANG_BY_CODE.get(value) : null
  const pick = (code) => { onChange(code); setOpen(false); setQ('') } // выбрать язык и закрыть

  return (
    <div className="relative" ref={boxRef}>
      <button type="button" id={id} onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-left flex items-center justify-between outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow">
        <span className={selected ? 'text-slate-900 truncate' : 'text-slate-400 truncate'}>
          {selected ? `${selected.name} · ${selected.native}` : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск языка…"
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-400">Ничего не найдено</div>
            ) : filtered.map((l) => (
              <button type="button" key={l.code} onClick={() => pick(l.code)}
                className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors">
                <span className="text-slate-900 truncate">{l.name} <span className="text-slate-400">· {l.native}</span></span>
                {value === l.code && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
