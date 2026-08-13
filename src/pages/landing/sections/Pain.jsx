import { useTranslation } from 'react-i18next'
import { IconArrow } from '../../../components/ui/icons'
import { SectionShell } from './_kit'

// «Знакомо?» — хаос из десяти инструментов слева, порядок справа.
// Раскладка намеренно асимметричная и «живая» (наклонённые карточки-заметки);
// цветная полоска слева отличает записки друг от друга на светлом фоне.
const MESS_POS = [
  { k: 'mess1', rot: '-6deg', cls: 'top-0 left-2',    bar: 'bg-[#F97316]' },
  { k: 'mess2', rot: '4deg',  cls: 'top-16 left-40',  bar: 'bg-[#0EA5E9]' },
  { k: 'mess3', rot: '-3deg', cls: 'top-44 left-8',   bar: 'bg-[#7C3AED]' },
  { k: 'mess4', rot: '7deg',  cls: 'top-52 left-44',  bar: 'bg-[#F59E0B]' },
  { k: 'mess5', rot: '-8deg', cls: 'top-28 left-24',  bar: 'bg-teal-500' },
]

export default function Pain() {
  const { t } = useTranslation('landing')
  const MESS = MESS_POS.map(m => ({ ...m, t: t(`pain.${m.k}t`), s: t(`pain.${m.k}s`) }))

  return (
    <SectionShell>
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* Хаос */}
        <div className="relative h-[340px] order-2 lg:order-1">
          <div className="absolute inset-0 rounded-2xl border border-dashed border-[#DDE5EA] bg-[#F7FAFB]" />
          {MESS.map(m => (
            <div
              key={m.t}
              className={`absolute w-44 soft-card overflow-hidden px-3 py-2.5 pl-4 ${m.cls}`}
              style={{ transform: `rotate(${m.rot})` }}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${m.bar}`} />
              <div className="text-xs font-semibold text-[#0E1726]">{m.t}</div>
              <div className="text-[11px] text-[#8FA0AE] mt-0.5">{m.s}</div>
            </div>
          ))}
          <div className="absolute -bottom-2 right-2 text-[11px] text-[#8FA0AE]">{t('pain.note')}</div>
        </div>

        {/* Порядок */}
        <div className="order-1 lg:order-2">
          <p className="eyebrow mb-3">{t('pain.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-[2.6rem] leading-[1.12] tracking-tight">
            {t('pain.title')}
          </h2>
          <p className="mt-5 text-[#5A6B7C] text-base leading-relaxed">{t('pain.text')}</p>
          <div className="mt-7 flex items-start gap-3.5 rounded-2xl bg-teal-50 border border-teal-100 p-5">
            <span className="w-8 h-8 rounded-lg bg-teal-500 text-white inline-flex items-center justify-center shrink-0">
              <IconArrow size={17} strokeWidth={2.4} />
            </span>
            <p className="text-[15px] text-[#17766F] leading-relaxed font-medium">{t('pain.solution')}</p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
