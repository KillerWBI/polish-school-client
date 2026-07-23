import { useTranslation } from 'react-i18next'

// «Знакомо?» — хаос из десяти инструментов слева, порядок справа.
// Раскладка намеренно асимметричная и «живая» (наклонённые карточки-заметки).
const MESS_POS = [
  { k: 'mess1', rot: '-6deg', cls: 'top-0 left-2' },
  { k: 'mess2', rot: '4deg', cls: 'top-16 left-40' },
  { k: 'mess3', rot: '-3deg', cls: 'top-44 left-8' },
  { k: 'mess4', rot: '7deg', cls: 'top-52 left-44' },
  { k: 'mess5', rot: '-8deg', cls: 'top-28 left-24' },
]

export default function Pain() {
  const { t } = useTranslation('landing')
  const MESS = MESS_POS.map((m) => ({ ...m, t: t(`pain.${m.k}t`), s: t(`pain.${m.k}s`) }))
  return (
    <section className="bg-[#18181C] text-[#EDEDED] border-t border-[#26262B]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-14 items-center">
        {/* Хаос */}
        <div className="relative h-[340px] order-2 lg:order-1">
          <div className="absolute inset-0 rounded-2xl border border-dashed border-[#26262B]" />
          {MESS.map((m) => (
            <div
              key={m.t}
              className={`absolute w-44 rounded-lg border border-[#303036] bg-[#1D1D22] px-3 py-2.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] ${m.cls}`}
              style={{ transform: `rotate(${m.rot})` }}
            >
              <div className="text-xs font-medium text-[#CFCFD4]">{m.t}</div>
              <div className="text-[11px] text-[#6E6E76] mt-0.5">{m.s}</div>
            </div>
          ))}
          <div className="absolute -bottom-2 right-2 font-mono text-[11px] text-[#5A5A60]">{t('pain.note')}</div>
        </div>

        {/* Порядок */}
        <div className="order-1 lg:order-2">
          <p className="mono-label mb-4">{t('pain.label')}</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.7rem] leading-[1.08] tracking-tight">
            {t('pain.title')}
          </h2>
          <p className="mt-5 text-[#9A9AA1] leading-relaxed">
            {t('pain.text')}
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#303036] bg-[#1D1D22] p-4">
            <span className="font-mono text-2xl text-brand-400">→</span>
            <p className="text-sm text-[#EDEDED]">
              {t('pain.solution')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
