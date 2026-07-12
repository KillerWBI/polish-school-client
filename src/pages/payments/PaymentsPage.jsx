import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getDebt, getDebtsForTeacher, recordPayment, getPaymentHistory, getMyPaymentHistory,
  getPendingPayments, approvePayment, rejectPayment, cancelMyPayment,
} from '../../api/payments.api'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import { safeUrl } from '../../utils/safeUrl'
import useAuth from '../../hooks/useAuth'
import useFetch from '../../hooks/useFetch'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

// Способы оплаты — единый справочник (лейбл + цвет бейджа + цвет точки).
const METHOD = {
  cash:     { label: 'Наличные', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  card:     { label: 'Карта',    cls: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500' },
  transfer: { label: 'Перевод',  cls: 'bg-violet-50 text-violet-700 border-violet-200',    dot: 'bg-violet-500' },
  blik:     { label: 'BLIK',     cls: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  paypal:   { label: 'PayPal',   cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',    dot: 'bg-indigo-500' },
  revolut:  { label: 'Revolut',  cls: 'bg-cyan-50 text-cyan-700 border-cyan-200',          dot: 'bg-cyan-500' },
  other:    { label: 'Другое',   cls: 'bg-slate-50 text-slate-600 border-slate-200',       dot: 'bg-slate-400' },
  online:   { label: 'Онлайн',   cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' }, // легаси
}
const BASE_METHODS = ['cash', 'card', 'transfer']
// Методы для ручного ввода учителем (базовые всегда доступны).
const MANUAL_METHODS = ['cash', 'card', 'transfer']

// Доп. каналы учителя из его реквизитов (paymentDetails) → ключи способов.
function extraMethodsFromPaymentDetails(pd) {
  if (!pd) return []
  const out = []
  if (pd.blik) out.push('blik')
  if (pd.paypal) out.push('paypal')
  if (pd.revolut) out.push('revolut')
  if (pd.customLabel) out.push('other')
  return out
}

// Карточка-счёт по способу оплаты: подпись + сумма поступлений. Кликом фильтрует список.
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

// Порядок способов для разбивки: базовые + доп.каналы учителя + всё, где реально есть деньги.
const METHOD_ORDER_ALL = ['cash', 'card', 'transfer', 'blik', 'paypal', 'revolut', 'other', 'online']
function breakdownMethods(byMethod, extras = []) {
  const set = new Set([...BASE_METHODS, ...extras])
  for (const k of Object.keys(byMethod || {})) if ((byMethod[k] || 0) !== 0) set.add(k)
  return METHOD_ORDER_ALL.filter((k) => set.has(k))
}

// Блок «поступило по способам» + фильтр по датам (для вкладки «Поступления»)
function MethodBreakdown({ methods, byMethod, method, setMethod, from, setFrom, to, setTo, total, totalLabel = 'Всего поступило' }) {
  const inputCls = 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {methods.map((m) => (
          <MethodCard key={m} m={m} amount={byMethod[m] || 0}
            active={method === m} onClick={() => setMethod(method === m ? '' : m)} />
        ))}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="text-sm text-slate-500">
          {totalLabel}: <span className="font-semibold text-slate-900">{fmt(total)}</span>
          {method && <> · способ: <span className="font-medium text-slate-700">{METHOD[method]?.label}</span></>}
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
    </>
  )
}

// Статусы модерации оплаты
const STATUS = {
  pending:  { label: 'На проверке', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Одобрено',    cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Отклонено',   cls: 'bg-red-100 text-red-700' },
}

// Переключатель статусов сверху (с опциональным счётчиком)
function StatusToggle({ value, onChange, tabs }) {
  return (
    <div className="inline-flex p-0.5 mb-4 rounded-xl bg-slate-100 border border-slate-200 flex-wrap">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`h-8 px-3.5 rounded-lg text-sm font-medium transition-colors ${
            value === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
          {t.label}
          {t.count > 0 && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${value === t.key ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// Лайтбокс скриншота оплаты
function ScreenshotModal({ url, onClose }) {
  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-4">
        <div className="text-sm font-medium text-slate-700 mb-3">Скриншот оплаты</div>
        <img src={safeUrl(url)} alt="Скриншот оплаты" className="w-full rounded-lg border border-slate-200" />
      </div>
    </Modal>
  )
}

// Миниатюра-кнопка «Скрин» (если есть)
function ShotButton({ url, onShot }) {
  if (!url) return null
  return (
    <button onClick={() => onShot(url)}
      className="shrink-0 text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
      📎 Скрин
    </button>
  )
}

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
      {isTeacher ? <TeacherPayments /> : <StudentPayments />}
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
/* ══════════════════ УЧЕНИК: вкладки Долг / История ══════════════════ */
function StudentPayments() {
  const [tab, setTab] = useState('debts')
  return (
    <div className="max-w-5xl">
      <div className="inline-flex p-0.5 mb-5 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'debts'}   onClick={() => setTab('debts')}>Мой долг</TabBtn>
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')}>История оплат</TabBtn>
      </div>
      {tab === 'debts' ? <StudentDebts /> : <StudentPaymentHistory />}
    </div>
  )
}

// История оплат ученика: переключатели статусов В процессе / Одобрено / Отклонено.
function StudentPaymentHistory() {
  const [status, setStatus] = useState('approved')
  const [shot, setShot]     = useState(null)

  // Pending грузим всегда — для счётчика на переключателе
  const { data: pending, reload: reloadPending } = useFetch(() => getMyPaymentHistory({ status: 'pending' }), [])
  const pendingCount = (pending?.data || []).length

  return (
    <div>
      <StatusToggle value={status} onChange={setStatus} tabs={[
        { key: 'pending',  label: 'В процессе', count: pendingCount },
        { key: 'approved', label: 'Одобрено' },
        { key: 'rejected', label: 'Отклонено' },
      ]} />

      <StudentHistoryList status={status} onShot={setShot} onChanged={reloadPending} />

      {shot && <ScreenshotModal url={shot} onClose={() => setShot(null)} />}
    </div>
  )
}

function StudentHistoryList({ status, onShot, onChanged }) {
  const isApproved = status === 'approved'
  const [busy, setBusy]     = useState(null)
  const [method, setMethod] = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')

  const { data, loading, reload } = useFetch(
    () => getMyPaymentHistory({ status, from: from || undefined, to: to || undefined }),
    [status, from, to],
  )
  const allRecords = data?.data ?? []
  const byMethod   = data?.summary?.byMethod ?? {}
  const total      = data?.summary?.total ?? 0
  const records    = method ? allRecords.filter((r) => r.method === method) : allRecords
  const methods    = breakdownMethods(byMethod)

  const cancel = async (id) => {
    setBusy(id)
    try { await cancelMyPayment(id); toast.success('Заявка отменена'); reload(); onChanged?.() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(null) }
  }

  return (
    <div>
      {isApproved && (
        <MethodBreakdown methods={methods} byMethod={byMethod} method={method} setMethod={setMethod}
          from={from} setFrom={setFrom} to={to} setTo={setTo} total={total} totalLabel="Всего оплачено" />
      )}

      {loading ? (
        <SkeletonList />
      ) : !records.length ? (
        <EmptyState emoji="🧾" title="Оплат нет"
          text={status === 'pending' ? 'Оплаты на проверке появятся здесь.' : status === 'rejected' ? 'Отклонённых оплат нет.' : 'Подтверждённые оплаты появятся здесь.'} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {records.map((r) => (
            <StudentHistoryRow key={r.id} rec={r} onShot={onShot}
              onCancel={r.status === 'pending' ? () => cancel(r.id) : null} busy={busy === r.id} />
          ))}
        </div>
      )}
    </div>
  )
}

// Строка истории оплат ученика — показывает учителя (кому платил) + статус/скрин/причину.
function StudentHistoryRow({ rec, onShot, onCancel, busy }) {
  const m = METHOD[rec.method] ?? { label: rec.method, cls: 'bg-slate-50 text-slate-600 border-slate-200' }
  const st = STATUS[rec.status] ?? null
  const date = rec.paidAt
    ? new Date(rec.paidAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const amountCls = rec.status === 'approved' ? 'text-emerald-600' : rec.status === 'rejected' ? 'text-slate-400 line-through' : 'text-slate-700'
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {(rec.teacher?.name || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900 truncate">{rec.teacher?.name ?? '—'}</div>
          <div className="text-xs text-slate-400">{date} · <span className={`px-1.5 py-0.5 rounded-full border ${m.cls}`}>{m.label}</span></div>
        </div>
        <ShotButton url={rec.screenshotUrl} onShot={onShot} />
        {st && <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>}
        <div className={`text-base font-semibold shrink-0 tabular-nums w-20 text-right ${amountCls}`}>{fmt(rec.amount)}</div>
      </div>
      {rec.status === 'rejected' && rec.rejectionReason && (
        <div className="text-xs text-red-500 mt-1.5">Причина: {rec.rejectionReason}</div>
      )}
      {onCancel && (
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={onCancel} loading={busy}>Отменить заявку</Button>
        </div>
      )}
    </div>
  )
}

function StudentDebts() {
  const { data, loading } = useFetch(getDebt)
  const navigate = useNavigate()

  if (loading) return <SkeletonList />
  if (!data?.length) return <EmptyState emoji="💳" title="Долгов нет" text="У вас пока нет начислений." />

  return (
    <div>
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
  const { user } = useAuth()
  const { data, loading, reload } = useFetch(getDebtsForTeacher)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount]     = useState('')
  const [method, setMethod]     = useState('cash')
  const [err, setErr]           = useState('')
  const [saving, setSaving]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Способы ручного ввода: базовые + доп.каналы учителя из реквизитов
  const manualMethods = [...MANUAL_METHODS, ...extraMethodsFromPaymentDetails(user?.paymentDetails)]

  const open  = (student) => { setSelected(student); setAmount(''); setMethod('cash'); setErr('') }
  const close = () => { if (!saving) setSelected(null) }

  // Валидация перед показом ConfirmDialog
  const trySubmit = () => {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) { setErr('Введите сумму больше 0'); return }
    setConfirmOpen(true)
  }

  const submit = async () => {
    setConfirmOpen(false)
    setSaving(true)
    try {
      await recordPayment(selected.id, Number(amount), method)
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
              {manualMethods.map((m) => (
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
            <Button className="flex-1" onClick={trySubmit} loading={saving}>Записать</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        title="Записать оплату?"
        message={`Записать ${Number(amount)} zł от ${selected?.name ?? ''}? Отменить потом нельзя.`}
        confirmLabel="Записать"
      />
    </div>
  )
}

/* ══════════════════ ИСТОРИЯ ОПЛАТ (учитель) ══════════════════ */
// Переключатели: На проверке (N) | Поступления | Отклонённые
function PaymentHistory() {
  const [status, setStatus] = useState('pending')
  const [shot, setShot]     = useState(null) // url скрина для лайтбокса

  // Pending грузим всегда — и для счётчика-бейджа, и для очереди проверки
  const { data: pending, loading: pLoad, reload: reloadPending } = useFetch(getPendingPayments)
  const pendingCount = (pending || []).length

  return (
    <div>
      <StatusToggle value={status} onChange={setStatus} tabs={[
        { key: 'pending',  label: 'На проверке', count: pendingCount },
        { key: 'approved', label: 'Поступления' },
        { key: 'rejected', label: 'Отклонённые' },
      ]} />

      {status === 'pending'
        ? <PendingReview items={pending} loading={pLoad} reload={reloadPending} onShot={setShot} />
        : <HistoryList status={status} onShot={setShot} />}

      {shot && <ScreenshotModal url={shot} onClose={() => setShot(null)} />}
    </div>
  )
}

// Очередь проверки: карточки оплат ученика со скрином + Одобрить/Отклонить
function PendingReview({ items, loading, reload, onShot }) {
  const [busy, setBusy]           = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason]       = useState('')

  const approve = async (id) => {
    setBusy(id)
    try { await approvePayment(id); toast.success('Оплата подтверждена'); reload() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(null) }
  }
  const doReject = async () => {
    setBusy(rejecting.id)
    try { await rejectPayment(rejecting.id, reason.trim()); toast.success('Оплата отклонена'); setRejecting(null); setReason(''); reload() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(null) }
  }

  if (loading) return <SkeletonList />
  if (!items?.length) return <EmptyState emoji="✅" title="Нет оплат на проверке" text="Здесь появятся оплаты учеников со скриншотом — их нужно подтвердить или отклонить." />

  return (
    <>
      <div className="space-y-2.5">
        {items.map((r) => {
          const m = METHOD[r.method] ?? { label: r.method, cls: 'bg-slate-50 text-slate-600 border-slate-200' }
          const date = r.paidAt ? new Date(r.paidAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
          return (
            <div key={r.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {(r.student?.name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{r.student?.name ?? '—'}</div>
                  <div className="text-xs text-slate-400">{date} · <span className={`px-1.5 py-0.5 rounded-full border ${m.cls}`}>{m.label}</span></div>
                </div>
                <ShotButton url={r.screenshotUrl} onShot={onShot} />
                <div className="text-base font-semibold text-slate-900 shrink-0 tabular-nums w-20 text-right">{fmt(r.amount)}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setRejecting(r)} loading={busy === r.id}>Отклонить</Button>
                <Button size="sm" className="flex-1" onClick={() => approve(r.id)} loading={busy === r.id}>Одобрить</Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Модалка отклонения с необязательной причиной */}
      <Modal open={!!rejecting} onClose={() => { if (busy === null) { setRejecting(null); setReason('') } }} maxWidth="max-w-sm">
        <div className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Отклонить оплату</h3>
          <p className="text-sm text-slate-400 mb-4">{rejecting?.student?.name} · {fmt(rejecting?.amount)}</p>
          <label className="block text-xs font-medium text-slate-500 mb-1">Причина (необязательно, увидит ученик)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Напр.: сумма не совпадает / оплата не поступила"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none mb-4" />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setRejecting(null); setReason('') }}>Отмена</Button>
            <Button className="flex-1" onClick={doReject} loading={busy === rejecting?.id}>Отклонить</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Список одобренных/отклонённых оплат (учитель).
// Для «Поступлений» — разбивка по способам (Наличные/Карта/Перевод/Онлайн) + фильтр по датам.
function HistoryList({ status, onShot }) {
  const { user } = useAuth()
  const isApproved = status === 'approved'
  const [method, setMethod] = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')

  const { data, loading } = useFetch(
    () => getPaymentHistory({ status, from: from || undefined, to: to || undefined }),
    [status, from, to],
  )
  const allRecords = data?.data ?? []
  const byMethod   = data?.summary?.byMethod ?? {}
  const total      = data?.summary?.total ?? 0
  const records    = method ? allRecords.filter((r) => r.method === method) : allRecords
  const methods    = breakdownMethods(byMethod, extraMethodsFromPaymentDetails(user?.paymentDetails))

  return (
    <div>
      {isApproved && (
        <MethodBreakdown methods={methods} byMethod={byMethod} method={method} setMethod={setMethod}
          from={from} setFrom={setFrom} to={to} setTo={setTo} total={total} />
      )}

      {loading ? (
        <SkeletonList />
      ) : !records.length ? (
        <EmptyState emoji="🧾" title="Записей нет"
          text={isApproved ? 'Подтверждённые оплаты появятся здесь.' : 'Отклонённых оплат нет.'} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {records.map((r) => <HistoryRow key={r.id} rec={r} onShot={onShot} />)}
        </div>
      )}
    </div>
  )
}

function HistoryRow({ rec, onShot }) {
  const m = METHOD[rec.method] ?? { label: rec.method, cls: 'bg-slate-50 text-slate-600 border-slate-200' }
  const date = rec.paidAt
    ? new Date(rec.paidAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const amountCls = rec.status === 'rejected' ? 'text-slate-400 line-through' : 'text-emerald-600'
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {(rec.student?.name || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900 truncate">{rec.student?.name ?? '—'}</div>
          <div className="text-xs text-slate-400">{date}</div>
        </div>
        <ShotButton url={rec.screenshotUrl} onShot={onShot} />
        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${m.cls}`}>{m.label}</span>
        <div className={`text-base font-semibold shrink-0 tabular-nums w-20 text-right ${amountCls}`}>{fmt(rec.amount)}</div>
      </div>
      {rec.status === 'rejected' && rec.rejectionReason && (
        <div className="text-xs text-red-500 mt-1.5 ml-13 pl-0.5">Причина: {rec.rejectionReason}</div>
      )}
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
