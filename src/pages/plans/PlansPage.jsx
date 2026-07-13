import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Check, Minus, Sparkles } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

// Иерархия тарифов — для сравнения «выше/ниже текущего»
const RANK = { free: 0, pro: 1, school: 2 }

// Тарифы учителя (SaaS). Структура (ok-флаги, цена) — в коде; тексты — в teacher:plans.*.
// Оплата подписки подключится позже (платёжный шлюз) — кнопка «Улучшить» показывает «скоро».
const PLANS = [
  { key: 'free',   price: '0',  periodKey: 'periodForever', ok: [true, true, true, true, false, false, false] },
  { key: 'pro',    price: '49', periodKey: 'periodMonth', highlight: true, ok: [true, true, true, true, true, true] },
  { key: 'school', price: '—',  periodKey: 'periodSoon', ok: [true, true, true, true] },
]
const FEATURE_KEY = { free: 'freeFeatures', pro: 'proFeatures', school: 'schoolFeatures' }
const TAGLINE_KEY = { free: 'freeTagline', pro: 'proTagline', school: 'schoolTagline' }
const PLAN_NAME = { free: 'Free', pro: 'Pro', school: 'School' }

export default function PlansPage() {
  const { t } = useTranslation('teacher')
  const { user } = useAuth()
  const current = user?.plan ?? 'free'

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{t('plans.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('plans.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-start">
        {PLANS.map((p) => (
          <PlanCard key={p.key} plan={p} current={current} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        {t('plans.footNote')}
      </p>
    </div>
  )
}

function PlanCard({ plan, current }) {
  const { t } = useTranslation('teacher')
  const isCurrent = plan.key === current
  const isSchool  = plan.key === 'school'
  const planRank  = RANK[plan.key] ?? 0
  const curRank   = RANK[current] ?? 0
  const isIncluded = planRank < curRank // тариф ниже текущего — уже входит в подписку
  const features = t(`plans.${FEATURE_KEY[plan.key]}`, { returnObjects: true })

  const upgrade = () => toast(t('plans.upgradeToast'))

  return (
    <div className={`relative rounded-2xl border bg-white p-5 flex flex-col ${
      plan.highlight ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/10' : 'border-slate-200'
    }`}>
      {plan.highlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-medium bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> {t('plans.popular')}
        </span>
      )}

      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">{PLAN_NAME[plan.key]}</div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-900">{plan.price}</span>
          <span className="text-sm text-slate-400">{t(`plans.${plan.periodKey}`)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{t(`plans.${TAGLINE_KEY[plan.key]}`)}</p>
      </div>

      <ul className="space-y-2 mb-5 flex-1">
        {features.map((text, i) => {
          const ok = plan.ok[i]
          return (
            <li key={i} className="flex items-start gap-2 text-sm">
              {ok
                ? <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <Minus className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
              <span className={ok ? 'text-slate-700' : 'text-slate-400'}>{text}</span>
            </li>
          )
        })}
      </ul>

      {isCurrent ? (
        <button disabled className="h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium cursor-default">
          {t('plans.yourPlan')}
        </button>
      ) : isIncluded ? (
        // Тариф ниже текущего — его возможности уже входят в вашу подписку
        <button disabled className="h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium cursor-default inline-flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> {t('plans.included')}
        </button>
      ) : isSchool ? (
        <button disabled className="h-10 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium cursor-default">
          {t('plans.soon')}
        </button>
      ) : (
        <button onClick={upgrade}
          className={`h-10 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
          {t('plans.upgrade')}
        </button>
      )}
    </div>
  )
}
