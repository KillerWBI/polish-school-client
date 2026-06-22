import { useState } from 'react'
import { toast } from 'sonner'
import { getDebt, getDebtsForTeacher, recordPayment } from '../../api/payments.api'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import useAuth from '../../hooks/useAuth'
import useFetch from '../../hooks/useFetch'

export default function PaymentsPage() {
  const { isTeacher } = useAuth()
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Оплата</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isTeacher ? 'Долги учеников и внесение оплат' : 'Мой долг по преподавателям'}
        </p>
      </div>
      {isTeacher ? <TeacherDebts /> : <StudentDebts />}
    </div>
  )
}

// Студент: долг по каждому преподавателю. «Оплатить» пока заглушка.
function StudentDebts() {
  const { data, loading } = useFetch(getDebt)

  if (loading) return <PageSpinner />
  if (!data?.length) {
    return <EmptyState emoji="💳" title="Долгов нет" text="У вас пока нет начислений." />
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <DebtCard
          key={row.teacher?.id}
          name={row.teacher?.name ?? '—'}
          sub={row.teacher?.email}
          charged={row.charged}
          paid={row.paid}
          balance={row.balance}
          action={
            <Button size="sm" onClick={() => toast('Онлайн-оплата скоро')}>
              Оплатить
            </Button>
          }
        />
      ))}
    </div>
  )
}

// Учитель: долг по каждому ученику + модалка внесения оплаты.
function TeacherDebts() {
  const { data, loading, reload } = useFetch(getDebtsForTeacher)
  const [selected, setSelected] = useState(null) // ученик, которому вносим оплату
  const [amount, setAmount]     = useState('')
  const [err, setErr]           = useState('')
  const [saving, setSaving]     = useState(false)

  const open  = (student) => { setSelected(student); setAmount(''); setErr('') }
  const close = () => { if (!saving) setSelected(null) }

  const submit = async () => {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) {
      setErr('Введите сумму больше 0')
      return
    }
    setSaving(true)
    try {
      await recordPayment(selected.id, value)
      toast.success('Оплата внесена')
      setSelected(null)
      reload() // перечитываем /debts — balance пересчитает сервер
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка записи оплаты')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!data?.length) {
    return <EmptyState emoji="🎓" title="Пока нет учеников" text="Когда появятся ученики, здесь будет их долг." />
  }

  return (
    <>
      <div className="space-y-3">
        {data.map((row) => (
          <DebtCard
            key={row.student?.id}
            name={row.student?.name ?? '—'}
            sub={row.student?.email}
            charged={row.charged}
            paid={row.paid}
            balance={row.balance}
            action={
              <Button size="sm" variant="secondary" onClick={() => open(row.student)}>
                Внести оплату
              </Button>
            }
          />
        ))}
      </div>

      <Modal open={!!selected} onClose={close}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Внести оплату</h2>
          <p className="text-sm text-slate-400 mb-5">{selected?.name}</p>
          <Input
            label="Сумма, zł"
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErr('') }}
            error={err}
          />
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={close} disabled={saving}>
              Отмена
            </Button>
            <Button className="flex-1" onClick={submit} loading={saving}>
              Записать
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Общая карточка строки долга (для обеих ролей).
function DebtCard({ name, sub, charged, paid, balance, action }) {
  const fmt = (n) => `${Math.round(Number(n))} zł`
  const balanceColor =
    Number(balance) > 0 ? 'text-amber-400' : Number(balance) < 0 ? 'text-green-400' : 'text-slate-400'

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
        {(name || '?')[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-white truncate">{name}</div>
        {sub && <div className="text-xs text-slate-400 truncate">{sub}</div>}
        <div className="text-xs text-slate-500 mt-0.5">
          Начислено {fmt(charged)} · Оплачено {fmt(paid)}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] text-slate-500 uppercase tracking-wider">Остаток</div>
        <div className={`text-base font-semibold ${balanceColor}`}>{fmt(balance)}</div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}
