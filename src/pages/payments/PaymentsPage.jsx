import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getDebt, getDebtsForTeacher, recordPayment, getPaymentHistory } from '../../api/payments.api'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { SkeletonList } from '../../components/ui/Skeleton'
import useAuth from '../../hooks/useAuth'
import useFetch from '../../hooks/useFetch'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

// Способы оплаты — единый справочник (лейбл + цвет бейджа + цвет точки).
const METHOD = {
  cash:     { label: 'Наличные', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  card:     { label: 'Карта',    cls: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500' },
  transfer: { label: 'Перевод',  cls: 'bg-violet-50 text-violet-700 border-violet-200',    dot: 'bg-violet-500' },
  online:   { label: 'Онлайн',   cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
}
const METHOD_ORDER = ['cash', 'card', 'transfer', 'online']
// Методы для ручного ввода (онлайн проставляет платёжка сама).
const MANUAL_METHODS = ['cash', 'card', 'transfer']

export default function PaymentsPage() {
  const { isTeacher } = useAuth()
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Финансы</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isTeacher ? 'Долги учеников, внесение оплат и история' : 'Мой долг по преподавателям'}
        </p>
      </div>
      {isTeacher ? <TeacherPayments /> : <StudentDebts />}
    </div>
  )
}

/* ══════════════════ УЧИТЕЛЬ: вкладки Долги / История ══════════════════ */
function TeacherPayments() {
  const [tab, setTab] = useState('debts')
  return (
    <div className="max-w-5xl">
      <div className="inline-flex p-0.5 mb-5 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'debts'}   onClick={() => setTab('debts')}>Долги</TabBtn>
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')}>История оплат</TabBtn>
      </div>
      {tab === 'debts' ? <TeacherDebts /> : <PaymentHistory />}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

/* Ячейка сводки (на уровне модуля — не пересоздаётся на каждый рендер) */
function SummaryCell({ label, value, accent }) {
  return (
    <div className="flex-1 p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${accent}`}>{fmt(value)}</div>
    </div>
  )
}

/* Сводка сверху: начислено / оплачено / остаток */
function Summary({ rows }) {
  const t = useMemo(() => rows.reduce((a, r) => ({
    charged: a.charged + Number(r.charged || 0),
    paid:    a.paid + Number(r.paid || 0),
    debt:    a.debt + Math.max(0, Number(r.balance || 0)),
  }), { charged: 0, paid: 0, debt: 0 }), [rows])

  return (
    <div className="flex rounded-2xl border border-slate-200 bg-white divide-x divide-slate-100 mb-5">
      <SummaryCell label="Начислено" value={t.charged} accent="text-slate-900" />
      <SummaryCell label="Оплачено"  value={t.paid}    accent="text-emerald-600" />
      <SummaryCell label="Остаток"   value={t.debt}    accent={t.debt > 0 ? 'text-amber-600' : 'text-slate-400'} />
    </div>
  )
}

// Студент: долг по каждому преподавателю. «Оплатить» → страница оплаты.
function StudentDebts() {
  const { data, loading } = useFetch(getDebt)
  const navigate = useNavigate()

  if (loading) return <SkeletonList />
  if (!data?.length) return <EmptyState emoji="💳" title="Долгов нет" text="У вас пока нет начислений." />

  return (
    <div className="max-w-5xl">
      <Summary rows={data} />
      <div className="grid gap-3 lg:grid-cols-2">
        {data.map((row) => (
          <DebtCard
            key={row.teacher?.id}
            name={row.teacher?.name ?? '—'}
            sub={row.teacher?.email}
            charged={row.charged}
            paid={row.paid}
            balance={row.balance}
            action={
              <Button size="sm" disabled={!row.teacher?.id || Math.max(0, row.balance) <= 0}
                onClick={() => navigate(`/pay/${row.teacher.id}`)}>
                Оплатить
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}

// Учитель: долг по каждому ученику + модалка внесения оплаты (со способом).
function TeacherDebts() {
  const { data, loading, reload } = useFetch(getDebtsForTeacher)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount]     = useState('')
  const [method, setMethod]     = useState('cash')
  const [err, setErr]           = useState('')
  const [saving, setSaving]     = useState(false)

  const open  = (student) => { setSelected(student); setAmount(''); setMethod('cash'); setErr('') }
  const close = () => { if (!saving) setSelected(null) }

  const submit = async () => {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) { setErr('Введите сумму больше 0'); return }
    setSaving(true)
    try {
      await recordPayment(selected.id, value, method)
      toast.success('Оплата внесена')
      setSelected(null)
      reload()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка записи оплаты')
    } finally { setSaving(false) }
  }

  if (loading) return <SkeletonList />
  if (!data?.length) return <EmptyState emoji="🎓" title="Пока нет учеников" text="Когда появятся ученики, здесь будет их долг." />

  // Сначала должники (по убыванию долга), затем остальные
  const sorted = [...data].sort((a, b) => Math.max(0, b.balance) - Math.max(0, a.balance))

  return (
    <div>
      <Summary rows={data} />
      <div className="grid gap-3 lg:grid-cols-2">
        {sorted.map((row) => (
          <DebtCard
            key={row.student?.id}
            name={row.student?.name ?? '—'}
            sub={row.student?.email}
            charged={row.charged}
            paid={row.paid}
            balance={row.balance}
            action={
              <Button size="sm" variant={Math.max(0, row.balance) > 0 ? 'primary' : 'secondary'} onClick={() => open(row.student)}>
                Внести
              </Button>
            }
          />
        ))}
      </div>

      <Modal open={!!selected} onClose={close}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Внести оплату</h2>
          <p className="text-sm text-slate-400 mb-5">{selected?.name}</p>
          <Input label="Сумма, zł" type="number" value={amount}
            onChange={(e) => { setAmount(e.target.value); setErr('') }} error={err} />

          {/* Способ оплаты */}
          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-1.5">Способ оплаты</label>
            <div className="grid grid-cols-3 gap-2">
              {MANUAL_METHODS.map((m) => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                    method === m
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}>
                  {METHOD[m].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={close} disabled={saving}>Отмена</Button>
            <Button className="flex-1" onClick={submit} loading={saving}>Записать</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════ ИСТОРИЯ ОПЛАТ ══════════════════ */
function PaymentHistory() {
  const [method, setMethod] = useState('') // '' = показать все способы
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')

  // Грузим все оплаты за период (без фильтра по способу) — чтобы карточки-счета
  // всегда показывали суммы по каждому способу. По способу фильтруем список на клиенте.
  const { data, loading } = useFetch(
    () => getPaymentHistory({ from: from || undefined, to: to || undefined }),
    [from, to],
  )

  const allRecords = data?.data ?? []
  const byMethod   = data?.summary?.byMethod ?? {}
  const total      = data?.summary?.total ?? 0
  const records    = method ? allRecords.filter((r) => r.method === method) : allRecords

  const inputCls = 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'

  return (
    <div>
      {/* Карточки-счета: сколько поступило каждым способом. Клик — фильтрует список ниже. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {METHOD_ORDER.map((m) => (
          <MethodCard key={m} m={m} amount={byMethod[m] || 0}
            active={method === m} onClick={() => setMethod(method === m ? '' : m)} />
        ))}
      </div>

      {/* Итого + период */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="text-sm text-slate-500">
          Всего получено: <span className="font-semibold text-slate-900">{fmt(total)}</span>
          {method && <> · способ: <span className="font-medium text-slate-700">{METHOD[method].label}</span></>}
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">С</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">По</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </div>
          {(method || from || to) && (
            <button onClick={() => { setMethod(''); setFrom(''); setTo('') }}
              className="h-9 px-3 text-sm text-slate-500 hover:text-slate-700 transition-colors">Сбросить</button>
          )}
        </div>
      </div>

      {/* Список — «когда» */}
      {loading ? (
        <SkeletonList />
      ) : !records.length ? (
        <EmptyState emoji="🧾" title="Оплат нет"
          text={method ? 'По этому способу оплат не найдено.' : 'За выбранный период оплат не найдено.'} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {records.map((r) => <HistoryRow key={r.id} rec={r} />)}
        </div>
      )}
    </div>
  )
}

// Карточка-счёт по способу оплаты: подпись + сумма поступлений. Кликом фильтрует историю.
function MethodCard({ m, amount, active, onClick }) {
  const meta = METHOD[m]
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
        active ? 'border-blue-500 ring-2 ring-blue-500/15 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className="text-sm text-slate-600">{meta.label}</span>
      </div>
      <div className="text-xl font-semibold text-slate-900 tabular-nums">{fmt(amount)}</div>
    </button>
  )
}

function HistoryRow({ rec }) {
  const m = METHOD[rec.method] ?? { label: rec.method, cls: 'bg-slate-50 text-slate-600 border-slate-200' }
  const date = rec.paidAt
    ? new Date(rec.paidAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
        {(rec.student?.name || '?')[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-900 truncate">{rec.student?.name ?? '—'}</div>
        <div className="text-xs text-slate-400">{date}</div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${m.cls}`}>{m.label}</span>
      <div className="text-base font-semibold text-emerald-600 shrink-0 tabular-nums w-24 text-right">{fmt(rec.amount)}</div>
    </div>
  )
}

// Карточка строки долга: аватар, суммы, прогресс оплаты, остаток, действие.
function DebtCard({ name, sub, charged, paid, balance, action }) {
  const bal = Number(balance) || 0
  const pct = Number(charged) > 0 ? Math.min(100, Math.round((Number(paid) / Number(charged)) * 100)) : 0
  const balanceColor = bal > 0 ? 'text-amber-600' : bal < 0 ? 'text-emerald-600' : 'text-slate-400'
  const balanceLabel = bal < 0 ? 'Переплата' : 'Остаток'

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {(name || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900 truncate">{name}</div>
          {sub && <div className="text-xs text-slate-400 truncate">{sub}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider">{balanceLabel}</div>
          <div className={`text-base font-semibold ${balanceColor}`}>{fmt(Math.abs(bal))}</div>
        </div>
        <div className="shrink-0">{action}</div>
      </div>

      {/* Прогресс оплаты */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-slate-500 shrink-0 tabular-nums">
          {fmt(paid)} / {fmt(charged)}
        </span>
      </div>
    </div>
  )
}
