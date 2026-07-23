import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Check, Sparkles } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { openCheckout, paddleConfigured } from '../../utils/paddle'
import { fetchMe } from '../../api/auth.api'
import { useCurrency, formatMoney } from '../../utils/money'

// Внутренние ключи: free/pro/school → Бесплатный/Стандартный/Максимальный
const RANK = { free: 0, pro: 1, school: 2 }
const PRICE_BY_PLAN = {
  pro:    import.meta.env.VITE_PADDLE_PRICE_PRO,    // Стандартный ($3.99 ≈ 15 zł) — реальная валюта задаётся в Paddle
  school: import.meta.env.VITE_PADDLE_PRICE_SCHOOL, // Максимальный ($7.99 ≈ 30 zł)
}

// Лимиты — СИНХРОННО с backend src/config/planLimits.js (по ролям)
const LIMITS = {
  teacher: {
    free:   { groups: 3,   students: 25,   courses: 8,   aiPerDay: 30   },
    pro:    { groups: 15,  students: 150,  courses: 40,  aiPerDay: 150  },
    school: { groups: 200, students: 3000, courses: 500, aiPerDay: 1000 },
  },
  student: {
    free:   { tracks: 3,   vocab: 100,   notes: 30,   aiPerDay: 20  },
    pro:    { tracks: 20,  vocab: 1000,  notes: 500,  aiPerDay: 100 },
    school: { tracks: 200, vocab: 10000, notes: 5000, aiPerDay: 500 },
  },
}

const PLANS = [
  { key: 'free',   price: '0',  periodKey: 'periodForever', nameKey: 'plans.freeName',     taglineKey: 'plans.freeTagline' },
  { key: 'pro',    price: '3.99', periodKey: 'periodMonth', highlight: true, nameKey: 'plans.standardName', taglineKey: 'plans.standardTagline' },
  { key: 'school', price: '7.99', periodKey: 'periodMonth', nameKey: 'plans.maxName',        taglineKey: 'plans.maxTagline' },
]

export default function PlansPage() {
  const { t } = useTranslation('teacher')
  const { user, updateUser, isStudent } = useAuth()
  const current = user?.plan ?? 'free'
  const role = isStudent ? 'student' : 'teacher'
  const money = useCurrency() // { cur, rates } — валюта пользователя по IP + курсы к USD

  const refetchMe = async () => {
    try { const me = await fetchMe(); if (me) updateUser?.(me) } catch { /* тихо */ }
  }

  const handleUpgrade = async (planKey) => {
    const priceId = PRICE_BY_PLAN[planKey]
    if (!paddleConfigured() || !priceId) { toast(t('plans.upgradeToast')); return }
    try {
      await openCheckout({
        priceId, email: user?.email, userId: user?.id,
        onSuccess: () => {
          toast.success('Оплата принята — тариф обновится в течение минуты')
          setTimeout(refetchMe, 4000)
        },
      })
    } catch (e) {
      toast.error(e.message || 'Не удалось открыть оплату')
    }
  }

  return (
    <div className="p-5 sm:p-7 max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{t('plans.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('plans.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((p) => (
          <PlanCard key={p.key} plan={p} current={current} role={role} onUpgrade={handleUpgrade} money={money} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">{t('plans.footNote')}</p>
    </div>
  )
}

function PlanCard({ plan, current, role, onUpgrade, money }) {
  const { t, i18n } = useTranslation('teacher')
  const isMax = plan.key === 'school'
  const isPaid = plan.key !== 'free'
  const isCurrent = plan.key === current
  const isIncluded = (RANK[plan.key] ?? 0) < (RANK[current] ?? 0) // ниже текущего — уже входит
  const lim = LIMITS[role][plan.key]

  // Цена: у бесплатного — '0'; иначе показываем в валюте пользователя (по IP) с «≈», база — USD.
  const usd = Number(plan.price)
  const rate = money?.rates?.[money?.cur?.code]
  const localised = isPaid && money?.cur?.code && money.cur.code !== 'USD' && rate
  const priceText = plan.key === 'free'
    ? plan.price
    : localised
      ? `≈ ${formatMoney(usd * rate, money.cur.code, i18n.language)}`
      : `$${plan.price}`

  const rows = role === 'student'
    ? [
        { n: lim.aiPerDay, label: t('plans.aiPerDay') },
        { n: lim.tracks,   label: t('plans.limitTracks') },
        { n: lim.vocab,    label: t('plans.limitVocab') },
        { n: lim.notes,    label: t('plans.limitNotes') },
      ]
    : [
        { n: lim.groups,   label: t('plans.limitGroups') },
        { n: lim.students, label: t('plans.limitStudents') },
        { n: lim.courses,  label: t('plans.limitCourses') },
      ]

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
        <div className="text-base font-semibold text-slate-900">{t(plan.nameKey)}</div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-900">{priceText}</span>
          <span className="text-sm text-slate-400">{t(`plans.${plan.periodKey}`)}</span>
        </div>
        {localised && <div className="text-[11px] text-slate-400 mt-0.5">≈ из ${plan.price} · точная сумма на оплате</div>}
        <p className="text-xs text-slate-500 mt-1.5">{t(plan.taglineKey)}</p>
      </div>

      {/* Все функции — на всех тарифах */}
      <div className="mb-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {t('plans.allFeatures')}
        </div>
        <p className="text-xs text-slate-400 mt-1">{role === 'student' ? t('plans.allFeaturesHintStudent') : t('plans.allFeaturesHint')}</p>
      </div>

      {/* Лимиты — в этом и разница между тарифами */}
      <div className="text-xs font-medium text-slate-500 mb-2">{t('plans.limitsTitle')}</div>
      <ul className="space-y-2 mb-5 flex-1">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 shrink-0 ${isMax ? 'text-blue-500' : isPaid ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className="text-slate-700">{t('plans.upTo')} {r.n.toLocaleString(i18n.language)} {r.label}</span>
          </li>
        ))}
        {isMax && <li className="text-xs text-slate-400 pl-6">{t('plans.unlimitedNote')}</li>}
      </ul>

      {isCurrent ? (
        <button disabled className="h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium cursor-default">
          {t('plans.yourPlan')}
        </button>
      ) : isIncluded ? (
        <button disabled className="h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium cursor-default inline-flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> {t('plans.included')}
        </button>
      ) : isPaid ? (
        <button onClick={() => onUpgrade(plan.key)}
          className={`h-10 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
          {t('plans.upgrade')}
        </button>
      ) : (
        <button disabled className="h-10 rounded-xl bg-slate-50 text-slate-400 text-sm font-medium cursor-default">
          {t('plans.freeCta')}
        </button>
      )}
    </div>
  )
}
