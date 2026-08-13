import { useTranslation } from 'react-i18next'
import { IconCheck } from '../../../components/ui/icons'
import { SectionShell } from './_kit'

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
    <SectionShell id="pricing">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
        <div>
          <p className="eyebrow mb-3">{t('pricing.label')}</p>
          <h2 className="font-display font-bold text-[#0E1726] text-3xl sm:text-4xl tracking-tight max-w-xl leading-[1.15]">
            {t('pricing.title')}
          </h2>
        </div>
        <p className="text-[13px] text-[#8FA0AE] max-w-xs">{t('pricing.note')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {PLANS.map(p => {
          const feats = [
            [n(p.limits.groups), t('pricing.featGroups')],
            [n(p.limits.students), t('pricing.featStudents')],
            [n(p.limits.courses), t('pricing.featCourses')],
            [n(p.limits.ai), t('pricing.featAi')],
          ]
          return (
            <div
              key={p.key}
              className={`relative flex flex-col soft-card p-6 ${
                p.popular ? 'border-teal-400 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_20px_44px_-22px_rgba(43,176,174,0.5)]' : ''
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 h-6 inline-flex items-center px-3 rounded-full bg-teal-500 text-white text-[11px] font-semibold">
                  {t('pricing.popular')}
                </span>
              )}

              <div className="text-[13px] font-semibold text-[#5A6B7C] uppercase tracking-wide">{t(`pricing.${p.key}Name`)}</div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-[34px] font-bold text-[#0E1726] leading-none">${p.price}</span>
                <span className="text-[12px] text-[#8FA0AE]">
                  {p.key === 'free' ? t('pricing.forever') : t('pricing.perMonth')}
                </span>
              </div>

              <p className="mt-3 text-[14px] text-[#5A6B7C] leading-relaxed">{t(`pricing.${p.key}Tagline`)}</p>

              <div className="mt-5 pt-5 border-t border-[#EDF1F4]">
                <p className="text-[11px] uppercase tracking-wide text-[#8FA0AE] mb-3">{t('pricing.limitsTitle')}</p>
                <ul className="space-y-2.5">
                  {feats.map(([count, label]) => (
                    <li key={label} className="flex items-start gap-2.5 text-[14px] text-[#3D4C5C]">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-teal-100 text-teal-700 inline-flex items-center justify-center shrink-0">
                        <IconCheck size={10} strokeWidth={3.5} />
                      </span>
                      <span><span className="font-semibold text-[#0E1726]">{count}</span> {label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* mt-auto — кнопки выравниваются по низу, хотя описания тарифов разной длины */}
              <div className="mt-auto pt-6">
                <button
                  onClick={onPrimary}
                  className={`w-full h-11 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
                    p.popular
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'border-[1.5px] border-[#DDE5EA] text-[#3D4C5C] hover:border-teal-400 hover:text-teal-700'
                  }`}
                >
                  {p.key === 'free' ? t('pricing.ctaFree') : t('pricing.cta')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-[12px] text-[#8FA0AE] text-center">{t('pricing.vatNote')}</p>
    </SectionShell>
  )
}
