import { toast } from 'sonner'
import { Check, Minus, Sparkles } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

// Тарифы учителя (SaaS). Оплата подписки подключится позже (платёжный шлюз) —
// сейчас кнопка «Улучшить» показывает «скоро». Лимиты Free пока не блокируются, только показываются.
const PLANS = [
  {
    key: 'free', name: 'Free', price: '0', period: 'навсегда',
    tagline: 'Попробовать и вести первых учеников',
    features: [
      { t: 'До 2 групп', ok: true },
      { t: 'До 15 учеников', ok: true },
      { t: 'Журнал, ДЗ, посещаемость, финансы', ok: true },
      { t: 'Индивидуальные курсы и уроки', ok: false },
      { t: 'Аналитика и история оплат', ok: false },
      { t: 'AI-проверка ДЗ и напоминания', ok: false },
    ],
  },
  {
    key: 'pro', name: 'Pro', price: '49', period: 'zł / мес', highlight: true,
    tagline: 'Для активного преподавателя без ограничений',
    features: [
      { t: 'Безлимит групп', ok: true },
      { t: 'Безлимит учеников', ok: true },
      { t: 'Журнал, ДЗ, посещаемость, финансы', ok: true },
      { t: 'Индивидуальные курсы и уроки', ok: true },
      { t: 'Аналитика и история оплат', ok: true },
      { t: 'AI-проверка ДЗ и напоминания', ok: true, soon: true },
    ],
  },
  {
    key: 'school', name: 'School', price: '—', period: 'скоро',
    tagline: 'Несколько преподавателей под одним брендом',
    features: [
      { t: 'Всё из Pro', ok: true },
      { t: 'Несколько учителей под школой', ok: true },
      { t: 'Общий бренд и управление', ok: true },
      { t: 'Приоритетная поддержка', ok: true },
    ],
  },
]

export default function PlansPage() {
  const { user } = useAuth()
  const current = user?.plan ?? 'free'

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Тарифы</h1>
        <p className="text-sm text-slate-500 mt-1">Больше групп, учеников и возможностей по мере роста.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-start">
        {PLANS.map((p) => (
          <PlanCard key={p.key} plan={p} current={current} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Оплата подписки подключается — сейчас лимиты Free не блокируют работу.
      </p>
    </div>
  )
}

function PlanCard({ plan, current }) {
  const isCurrent = plan.key === current
  const isSchool  = plan.key === 'school'

  const upgrade = () => toast('Оплата подписки скоро — подключаем платёжку')

  return (
    <div className={`relative rounded-2xl border bg-white p-5 flex flex-col ${
      plan.highlight ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/10' : 'border-slate-200'
    }`}>
      {plan.highlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-medium bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> Популярный
        </span>
      )}

      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">{plan.name}</div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-900">{plan.price}</span>
          <span className="text-sm text-slate-400">{plan.period}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{plan.tagline}</p>
      </div>

      <ul className="space-y-2 mb-5 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {f.ok
              ? <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              : <Minus className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
            <span className={f.ok ? 'text-slate-700' : 'text-slate-400'}>
              {f.t}
              {f.soon && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">скоро</span>}
            </span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button disabled className="h-10 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium cursor-default">
          Ваш тариф
        </button>
      ) : isSchool ? (
        <button disabled className="h-10 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium cursor-default">
          Скоро
        </button>
      ) : (
        <button onClick={upgrade}
          className={`h-10 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
          Улучшить
        </button>
      )}
    </div>
  )
}
