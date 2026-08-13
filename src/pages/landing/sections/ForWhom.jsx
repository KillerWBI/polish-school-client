import { useTranslation } from 'react-i18next'
import { SectionShell } from './_kit'

// «Для кого» — сценарии-истории, а не сухие карточки. Смещённая раскладка.
export default function ForWhom() {
  const { t } = useTranslation('landing')
  const CASES = [1, 2, 3].map(i => ({
    tag: t(`forWhom.c${i}tag`), quote: t(`forWhom.c${i}quote`), story: t(`forWhom.c${i}story`), stat: t(`forWhom.c${i}stat`),
  }))

  return (
    <SectionShell tone="alt">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
        <div>
          <p className="eyebrow mb-3">{t('forWhom.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight max-w-xl leading-[1.15]">
            {t('forWhom.title')}
          </h2>
        </div>
        <p className="text-[13px] text-[#8FA0AE] max-w-xs">{t('forWhom.note')}</p>
      </div>

      <div className="space-y-5">
        {CASES.map((c, i) => (
          <div
            key={c.tag}
            className={`grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 soft-card p-6 sm:p-8 ${i % 2 ? 'lg:ml-16' : 'lg:mr-16'}`}
          >
            <div>
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-teal-50 text-teal-700 text-[12px] font-semibold">
                {c.tag}
              </span>
              <div className="mt-4 text-[12px] text-[#8FA0AE]">{c.stat}</div>
            </div>
            <div>
              <p className="font-display font-semibold text-xl sm:text-2xl text-[#0E1726] leading-snug">{c.quote}</p>
              <p className="mt-3 text-[15px] text-[#5A6B7C] leading-relaxed max-w-2xl">{c.story}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
