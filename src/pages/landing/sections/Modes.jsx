import { useTranslation } from 'react-i18next'
import { SectionShell, SectionHead, PrimaryButton } from './_kit'

// «Соло или с учениками» — два режима, разнесённые панелями.
// id="how" — цель пункта «как работает» в шапке и футере.
function ModeCard({ tag, title, text, steps, highlight }) {
  return (
    <div className={`soft-card p-7 ${highlight ? 'border-teal-300 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-20px_rgba(43,176,174,0.45)]' : ''}`}>
      <span className="inline-flex items-center h-7 px-3 rounded-full bg-teal-50 text-teal-700 text-[12px] font-semibold">
        {tag}
      </span>
      <h3 className="mt-4 font-display font-bold text-[22px] text-[#0E1726] leading-snug">{title}</h3>
      <p className="mt-3 text-[15px] text-[#5A6B7C] leading-relaxed">{text}</p>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#F1F5F6] text-[#5A6B7C] text-[12px] font-semibold inline-flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-[14px] text-[#3D4C5C] leading-relaxed">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Modes({ onPrimary }) {
  const { t } = useTranslation('landing')
  return (
    <SectionShell id="how" tone="alt">
      <SectionHead
        label={t('modes.label')}
        title={<>{t('modes.title1')} <span className="text-teal-500">{t('modes.title2')}</span></>}
        subtitle={t('modes.subtitle')}
      />

      <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch">
        <ModeCard
          tag={t('modes.aTag')} title={t('modes.aTitle')} text={t('modes.aText')}
          steps={[t('modes.a1'), t('modes.a2'), t('modes.a3')]}
        />

        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="flex-1 w-px bg-[#DDE5EA]" />
          <span className="my-3 text-xs text-[#8FA0AE] uppercase tracking-wider">{t('modes.or')}</span>
          <div className="flex-1 w-px bg-[#DDE5EA]" />
        </div>

        <ModeCard
          highlight
          tag={t('modes.bTag')} title={t('modes.bTitle')} text={t('modes.bText')}
          steps={[t('modes.b1'), t('modes.b2'), t('modes.b3')]}
        />
      </div>

      <div className="mt-12 text-center">
        <PrimaryButton onClick={onPrimary}>{t('modes.cta')}</PrimaryButton>
      </div>
    </SectionShell>
  )
}
