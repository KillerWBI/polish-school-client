import { useTranslation } from 'react-i18next'

// «Для кого» — сценарии-истории, а не сухие карточки. Смещённая раскладка.
export default function ForWhom() {
  const { t } = useTranslation('landing')
  const CASES = [1, 2, 3].map((i) => ({
    tag: t(`forWhom.c${i}tag`), quote: t(`forWhom.c${i}quote`), story: t(`forWhom.c${i}story`), stat: t(`forWhom.c${i}stat`),
  }))
  return (
    <section className="bg-[#0D0D0F] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="mono-label mb-3">{t('forWhom.label')}</p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-xl">
              {t('forWhom.title')}
            </h2>
          </div>
          <p className="font-mono text-[12px] text-[#5A5A60] max-w-xs">{t('forWhom.note')}</p>
        </div>

        <div className="space-y-5">
          {CASES.map((c, i) => (
            <div
              key={c.tag}
              className={`grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 rounded-2xl border border-[#1E1E22] bg-[#0A0A0B] p-6 sm:p-8 ${i % 2 ? 'lg:ml-16' : 'lg:mr-16'}`}
            >
              <div>
                <span className="inline-block font-mono text-[11px] text-brand-400 border border-brand-600/30 rounded px-2 py-1">{c.tag}</span>
                <div className="mt-4 font-mono text-[11px] text-[#5A5A60]">{c.stat}</div>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl text-[#EDEDED] leading-snug">{c.quote}</p>
                <p className="mt-3 text-sm text-[#8A8A8F] leading-relaxed max-w-2xl">{c.story}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
