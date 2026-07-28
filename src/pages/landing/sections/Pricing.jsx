import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

// Публичные тарифы на лендинге. Цены и лимиты — синхронно с backend src/config/planLimits.js
// (роль teacher: лендинг teacher-first) и с каталогом Paddle.
const PLANS = [
  { key: 'free',  price: '0',    limits: { groups: 3,   students: 25,   courses: 8,   ai: 30   } },
  { key: 'basic', price: '1.99', limits: { groups: 8,   students: 60,   courses: 20,  ai: 60   } },
  { key: 'pro',   price: '3.99', limits: { groups: 15,  students: 150,  courses: 40,  ai: 150  }, popular: true },
  { key: 'max',   price: '7.99', limits: { groups: 200, students: 3000, courses: 500, ai: 1000 } },
]

export default function Pricing({ onPrimary }) {
  const { t, i18n } = useTranslation('landing')
  const n = (v) => v.toLocaleString(i18n.language)

  return (
    <section id="pricing" className="bg-[#18181C] text-[#EDEDED] border-t border-[#26262B]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="mono-label mb-3">{t('pricing.label')}</p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-xl">
              {t('pricing.title')}
            </h2>
          </div>
          <p className="font-mono text-[12px] text-[#5A5A60] max-w-xs">{t('pricing.note')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`relative flex flex-col rounded-2xl border bg-[#1D1D22] p-6 ${
                p.popular ? 'border-brand-600/50' : 'border-[#303036]'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 font-mono text-[10px] uppercase tracking-wide bg-brand-500 text-[#18181C] px-2 py-0.5 rounded">
                  {t('pricing.popular')}
                </span>
              )}

              <div className="font-mono text-[13px] text-[#8A8A8F]">{t(`pricing.${p.key}Name`)}</div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold">${p.price}</span>
                <span className="font-mono text-[12px] text-[#5A5A60]">
                  {p.key === 'free' ? t('pricing.forever') : t('pricing.perMonth')}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#8A8A8F] leading-relaxed">{t(`pricing.${p.key}Tagline`)}</p>

              <div className="mt-5 pt-5 border-t border-[#26262B]">
                <p className="font-mono text-[11px] text-[#5A5A60] mb-3">{t('pricing.limitsTitle')}</p>
                <ul className="space-y-2 text-sm text-[#B4B4BA]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
                    {n(p.limits.groups)} {t('pricing.featGroups')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
                    {n(p.limits.students)} {t('pricing.featStudents')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
                    {n(p.limits.courses)} {t('pricing.featCourses')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
                    {n(p.limits.ai)} {t('pricing.featAi')}
                  </li>
                </ul>
              </div>

              <button
                onClick={onPrimary}
                className={`mt-6 h-10 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  p.popular
                    ? 'bg-white text-[#18181C] hover:bg-[#EDEDED]'
                    : 'border border-[#303036] text-[#B4B4BA] hover:text-white hover:border-[#48484F]'
                }`}
              >
                {p.key === 'free' ? t('pricing.ctaFree') : t('pricing.cta')}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 font-mono text-[11px] text-[#5A5A60] text-center">{t('pricing.vatNote')}</p>
      </div>
    </section>
  )
}
