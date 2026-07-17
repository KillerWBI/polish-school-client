import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, CEFR_LEVELS, getLanguageName } from '../../../constants/languages'

// Управляемый редактор языков.
// value: [{ code, level? }]  onChange: (newArr) => void
// withLevel — true для студента (показывать селект уровня), false для учителя
export default function LanguagesEditor({ value = [], onChange, withLevel = false, readOnly = false }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [picking, setPicking] = useState(false)

  // Языки, ещё не выбранные
  const available = LANGUAGES.filter(l => !value.some(v => v.code === l.code))

  const addLanguage = (code) => {
    onChange([...value, withLevel ? { code, level: 'A1' } : { code }])
    setPicking(false)
  }

  const removeLanguage = (code) => {
    onChange(value.filter(v => v.code !== code))
  }

  const setLevel = (code, level) => {
    onChange(value.map(v => v.code === code ? { ...v, level } : v))
  }

  if (readOnly) {
    if (value.length === 0) return <span className="text-xs text-slate-600">{t('settings.langNotSpecified')}</span>
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map(v => (
          <span key={v.code} className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
            {getLanguageName(v.code)}
            {v.level && <span className="text-slate-500 ml-1">· {v.level}</span>}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map(v => (
          <span key={v.code} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
            {getLanguageName(v.code)}
            {withLevel && (
              <select
                value={v.level || 'A1'}
                onChange={(e) => setLevel(v.code, e.target.value)}
                className="bg-transparent text-slate-400 text-xs focus:outline-none cursor-pointer"
              >
                {CEFR_LEVELS.map(lv => <option key={lv} value={lv} className="bg-slate-800">{lv}</option>)}
              </select>
            )}
            <button
              type="button"
              onClick={() => removeLanguage(v.code)}
              className="w-5 h-5 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
              title={tc('delete')}
            >
              ×
            </button>
          </span>
        ))}

        {/* Кнопка «+ Добавить язык» */}
        {available.length > 0 && (
          <button
            type="button"
            onClick={() => setPicking(p => !p)}
            className="px-2.5 py-1 rounded-full border border-dashed border-slate-200 text-xs text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-colors cursor-pointer"
          >
            {t('settings.addLang')}
          </button>
        )}
      </div>

      {/* Дропдаун с доступными языками */}
      {picking && available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-white">
          {available.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => addLanguage(l.code)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-100 text-xs text-slate-700 cursor-pointer transition-colors"
            >
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
