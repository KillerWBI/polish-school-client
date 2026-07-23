import { useTranslation } from 'react-i18next'

// «Соло или с учениками» — два режима, разнесённые панелями. Уникальный split.
export default function Modes({ onPrimary }) {
  const { t } = useTranslation('landing')
  return (
    <section className="bg-[#1D1D22] text-[#EDEDED] border-t border-[#26262B]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <p className="mono-label mb-3">{t('modes.label')}</p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            {t('modes.title1')} <span className="text-[#6E6E76]">{t('modes.title2')}</span>
          </h2>
          <p className="mt-3 text-[#8A8A8F]">{t('modes.subtitle')}</p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-stretch">
          {/* Соло */}
          <div className="rounded-2xl border border-[#303036] bg-[#18181C] p-7">
            <div className="font-mono text-[12px] text-brand-400 mb-4">{t('modes.aTag')}</div>
            <h3 className="font-display font-semibold text-2xl">{t('modes.aTitle')}</h3>
            <p className="mt-3 text-sm text-[#8A8A8F] leading-relaxed">
              {t('modes.aText')}
            </p>
            <div className="mt-5 space-y-2 font-mono text-[12px] text-[#8A8A8F]">
              <div className="flex items-center gap-2"><span className="text-[#48484F]">01</span> {t('modes.a1')}</div>
              <div className="flex items-center gap-2"><span className="text-[#48484F]">02</span> {t('modes.a2')}</div>
              <div className="flex items-center gap-2"><span className="text-[#48484F]">03</span> {t('modes.a3')}</div>
            </div>
          </div>

          {/* разделитель */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="flex-1 w-px bg-[#303036]" />
            <span className="my-3 font-mono text-xs text-[#5A5A60] rotate-0">{t('modes.or')}</span>
            <div className="flex-1 w-px bg-[#303036]" />
          </div>

          {/* С учениками */}
          <div className="rounded-2xl border border-brand-600/30 bg-[#1D1D22] p-7">
            <div className="font-mono text-[12px] text-brand-400 mb-4">{t('modes.bTag')}</div>
            <h3 className="font-display font-semibold text-2xl">{t('modes.bTitle')}</h3>
            <p className="mt-3 text-sm text-[#8A8A8F] leading-relaxed">
              {t('modes.bText')}
            </p>
            <div className="mt-5 space-y-2 font-mono text-[12px] text-[#8A8A8F]">
              <div className="flex items-center gap-2"><span className="text-[#48484F]">01</span> {t('modes.b1')}</div>
              <div className="flex items-center gap-2"><span className="text-[#48484F]">02</span> {t('modes.b2')}</div>
              <div className="flex items-center gap-2"><span className="text-brand-400">03</span> {t('modes.b3')}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={onPrimary} className="h-11 px-6 rounded-lg bg-white text-[#18181C] text-sm font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
            {t('modes.cta')}
          </button>
        </div>
      </div>
    </section>
  )
}
