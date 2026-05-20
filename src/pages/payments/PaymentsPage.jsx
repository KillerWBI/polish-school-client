import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getPayments, calculatePayments, updatePayment } from '../../api/payments.api'
import { formatMonth, currentMonth } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function PaymentsPage() {
  const { isTeacher } = useAuth()
  const { data: payments, loading, reload } = useFetch(getPayments)
  const [month,      setMonth]      = useState(currentMonth())
  const [calculating, setCalculating] = useState(false)
  const [calcError,  setCalcError]  = useState('')
  const [toggling,   setToggling]   = useState(null)

  const handleCalculate = async () => {
    setCalculating(true); setCalcError('')
    try { await calculatePayments(month); reload() }
    catch (e) { setCalcError(e.response?.data?.error || 'Ошибка расчёта') }
    finally   { setCalculating(false) }
  }

  const handleToggle = async (id, paid) => {
    setToggling(id)
    try { await updatePayment(id, paid); reload() }
    catch (e) { console.error(e) }
    finally   { setToggling(null) }
  }

  // Фильтруем по выбранному месяцу
  const filtered = (payments || []).filter(p => p.month === month)
  const totalOwed = filtered.filter(p => !p.paid).reduce((s, p) => s + parseFloat(p.amount), 0)
  const totalPaid = filtered.filter(p =>  p.paid).reduce((s, p) => s + parseFloat(p.amount), 0)

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Оплата</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isTeacher ? 'Расчёт и отслеживание платежей' : 'Мои платежи и задолженности'}
        </p>
      </div>

      {/* Панель расчёта — только для teacher */}
      {isTeacher ? (
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] mb-6">
          <p className="text-sm font-medium text-white mb-3">Рассчитать за месяц</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Месяц</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="h-11 px-3 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
              />
            </div>
            <Button onClick={handleCalculate} loading={calculating}>
              ⚡ Рассчитать {formatMonth(month)}
            </Button>
          </div>
          {calcError && <p className="text-sm text-red-400 mt-2">{calcError}</p>}
        </div>
      ) : (
        <div className="mb-6 max-w-xs">
          <label className="text-xs text-slate-400 block mb-1">Месяц</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-white/[0.07] border border-white/[0.15] text-white text-sm outline-none focus:border-brand-400"
          />
        </div>
      )}

      {/* Итоги месяца */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {isTeacher && <Stat label="Студентов" value={filtered.length} />}
          <Stat label="Оплачено" value={`${totalPaid} zł`} color="text-green-400" />
          <Stat label="Ожидает" value={`${totalOwed} zł`} color="text-amber-400" />
        </div>
      )}

      {/* Список */}
      {loading ? <PageSpinner /> : !filtered.length ? (
        <EmptyState emoji="💳" title={`Нет данных за ${formatMonth(month)}`}
          text="Нажмите «Рассчитать», чтобы посчитать оплату по посещаемости." />
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {isTeacher && (
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Студент</th>
                )}
                <th className={`px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider ${isTeacher ? 'text-right' : 'text-left'}`}>
                  {isTeacher ? 'Сумма' : 'Месяц'}
                </th>
                {!isTeacher && (
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Сумма</th>
                )}
                <th className="text-center px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-white/[0.05] last:border-0 ${i%2===0?'':'bg-white/[0.02]'}`}>
                  {isTeacher && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {(p.student?.name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{p.student?.name ?? p.studentId}</div>
                          {p.student?.email && <div className="text-xs text-slate-400">{p.student.email}</div>}
                        </div>
                      </div>
                    </td>
                  )}
                  {!isTeacher && (
                    <td className="px-5 py-3.5 text-white">{formatMonth(p.month)}</td>
                  )}
                  <td className="px-5 py-3.5 text-right font-semibold text-white">
                    {parseFloat(p.amount).toFixed(0)} zł
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {isTeacher ? (
                      <button
                        onClick={() => handleToggle(p.id, !p.paid)}
                        disabled={toggling === p.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer disabled:opacity-60 ${
                          p.paid
                            ? 'bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400'
                            : 'bg-amber-500/15 text-amber-400 hover:bg-green-500/15 hover:text-green-400'
                        }`}
                      >
                        {toggling === p.id
                          ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                          : p.paid ? '✓ Оплачено' : '⏳ Ожидает'
                        }
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        p.paid ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {p.paid ? '✓ Оплачено' : '⏳ Ожидает'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
