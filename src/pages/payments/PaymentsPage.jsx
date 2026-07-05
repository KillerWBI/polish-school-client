import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { getDebt, getDebtsForTeacher, recordPayment } from '../../api/payments.api'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import useAuth from '../../hooks/useAuth'
import useFetch from '../../hooks/useFetch'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

export default function PaymentsPage() {
  const { isTeacher } = useAuth()
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Финансы</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isTeacher ? 'Долги учеников и внесение оплат' : 'Мой долг по преподавателям'}
        </p>
      </div>
      {isTeacher ? <TeacherDebts /> : <StudentDebts />}
    </div>
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

// Студент: долг по каждому преподавателю. «Оплатить» пока заглушка.
function StudentDebts() {
  const { data, loading } = useFetch(getDebt)

  if (loading) return <PageSpinner />
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
            action={<Button size="sm" onClick={() => toast('Онлайн-оплата скоро')}>Оплатить</Button>}
          />
        ))}
      </div>
    </div>
  )
}

// Учитель: долг по каждому ученику + модалка внесения оплаты.
function TeacherDebts() {
  const { data, loading, reload } = useFetch(getDebtsForTeacher)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount]     = useState('')
  const [err, setErr]           = useState('')
  const [saving, setSaving]     = useState(false)

  const open  = (student) => { setSelected(student); setAmount(''); setErr('') }
  const close = () => { if (!saving) setSelected(null) }

  const submit = async () => {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) { setErr('Введите сумму больше 0'); return }
    setSaving(true)
    try {
      await recordPayment(selected.id, value)
      toast.success('Оплата внесена')
      setSelected(null)
      reload()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка записи оплаты')
    } finally { setSaving(false) }
  }

  if (loading) return <PageSpinner />
  if (!data?.length) return <EmptyState emoji="🎓" title="Пока нет учеников" text="Когда появятся ученики, здесь будет их долг." />

  // Сначала должники (по убыванию долга), затем остальные
  const sorted = [...data].sort((a, b) => Math.max(0, b.balance) - Math.max(0, a.balance))

  return (
    <div className="max-w-5xl">
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
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={close} disabled={saving}>Отмена</Button>
            <Button className="flex-1" onClick={submit} loading={saving}>Записать</Button>
          </div>
        </div>
      </Modal>
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
