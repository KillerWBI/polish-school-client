import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast, errMsg } from '../../utils/toast'
import useAuth from '../../hooks/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import { getInvoices, previewInvoice, createInvoice, patchInvoice } from '../../api/invoices.api'
import { getMyStudents } from '../../api/students.api'
import { formatMoney } from '../../utils/money'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { IconPayments, IconAdd } from '../../components/ui/icons'

// Первое и последнее число прошедшего месяца — самый частый период выставления,
// поэтому форма открывается уже заполненной им.
const lastMonth = () => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to   = new Date(now.getFullYear(), now.getMonth(), 0)
  const iso  = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

const STATUS_CLS = {
  issued:    'bg-amber-50 text-amber-700 border-amber-200',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
}

/* ══════════════ Счета: общий список для обеих ролей ══════════════ */
export default function InvoicesTab() {
  const { t } = useTranslation('teacher')
  const { user } = useAuth()
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'
  const { data: invoices, loading, reload } = useApiQuery(['invoices'], getInvoices)
  const [creating, setCreating] = useState(false)

  const setStatus = async (inv, status) => {
    try {
      await patchInvoice(inv.id, status)
      toast.success(t('invoices.updated'))
      reload()
    } catch (e) { toast.error(errMsg(e)) }
  }

  if (loading) return <SkeletonList rows={3} />

  return (
    <div className="space-y-4">
      {isTeacher && (
        <p className="text-sm text-slate-500">{t('invoices.explain')}</p>
      )}

      {!invoices?.length ? (
        <EmptyState
          icon={IconPayments}
          title={t('invoices.emptyTitle')}
          text={isTeacher ? t('invoices.emptyTextTeacher') : t('invoices.emptyTextStudent')}
          action={isTeacher && <Button size="sm" onClick={() => setCreating(true)}><IconAdd size={15} /> {t('invoices.newBtn')}</Button>}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {t('invoices.number', { n: inv.number })}
                    <span className="text-slate-400 font-normal"> · {isTeacher ? inv.student?.name : inv.teacher?.name}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('invoices.period', { from: inv.periodFrom, to: inv.periodTo })}
                    {inv.dueDate && ` · ${t('invoices.due', { date: inv.dueDate })}`}
                  </div>
                </div>
                <span className={`hidden sm:inline text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_CLS[inv.status]}`}>
                  {t(`invoices.status.${inv.status}`)}
                </span>
                <div className="text-base font-semibold text-slate-900 shrink-0 tabular-nums">
                  {formatMoney(Number(inv.total), inv.currency)}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    {t('invoices.open')}
                  </Button>
                  {isTeacher && inv.status === 'issued' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setStatus(inv, 'paid')}>{t('invoices.markPaid')}</Button>
                      <Button size="sm" variant="secondary" onClick={() => setStatus(inv, 'cancelled')}>{t('invoices.cancel')}</Button>
                    </>
                  )}
                  {!isTeacher && inv.status === 'issued' && (
                    <Button size="sm" onClick={() => navigate(`/pay/${inv.teacher?.id}`)}>{t('invoices.pay')}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isTeacher && (
            <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
              <IconAdd size={15} /> {t('invoices.newBtn')}
            </Button>
          )}
        </>
      )}

      {creating && (
        <NewInvoiceModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); reload() }} />
      )}
    </div>
  )
}

/* ══════════════ Выставление счёта ══════════════ */
function NewInvoiceModal({ onClose, onCreated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: students } = useApiQuery(['my-students'], getMyStudents)
  const [f, setF] = useState(() => ({ studentId: '', ...lastMonth(), dueDate: '', note: '' }))
  const [prev, setPrev] = useState(null)      // расчёт до выпуска
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => { setF(v => ({ ...v, [k]: e.target.value })); setPrev(null); setError('') }
  const ready = f.studentId && f.from && f.to

  const doPreview = async () => {
    if (!ready) return setError(t('invoices.errFill'))
    setBusy(true); setError('')
    try {
      setPrev(await previewInvoice({ studentId: f.studentId, from: f.from, to: f.to }))
    } catch (e) { setError(errMsg(e)) }
    finally { setBusy(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    // Счёт выставляем только после показа расчёта: номер расходуется навсегда,
    // и увидеть строки нужно до, а не после выпуска.
    if (!prev) return doPreview()
    setBusy(true); setError('')
    try {
      await createInvoice({
        studentId: f.studentId, from: f.from, to: f.to,
        dueDate: f.dueDate || null, note: f.note.trim() || null,
      })
      toast.success(t('invoices.created'))
      onCreated()
    } catch (e) { setError(errMsg(e)) }
    finally { setBusy(false) }
  }

  const total = useMemo(() => prev ? formatMoney(prev.total, prev.currency) : '', [prev])

  return (
    <Modal open onClose={onClose} title={t('invoices.newTitle')} subtitle={t('invoices.newHint')}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('invoices.studentLabel')}</label>
          <select value={f.studentId} onChange={set('studentId')}
            className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500">
            <option value="">{t('invoices.chooseStudent')}</option>
            {(students || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('invoices.from')} type="date" value={f.from} onChange={set('from')} />
          <Input label={t('invoices.to')}   type="date" value={f.to}   onChange={set('to')} />
        </div>
        <Input label={t('invoices.dueDate')} type="date" value={f.dueDate} onChange={set('dueDate')} />
        <Input label={t('invoices.note')} value={f.note} onChange={set('note')} placeholder={t('invoices.notePlaceholder')} />

        {prev && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
              {prev.positions.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="text-slate-400 tabular-nums shrink-0">{p.date}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-700">{p.title}</span>
                  <span className="tabular-nums text-slate-900">{formatMoney(p.price, prev.currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-sm font-semibold">
              <span>{t('invoices.total')}</span><span className="tabular-nums">{total}</span>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
          <Button type="submit" loading={busy} className="flex-1" disabled={!ready}>
            {prev ? t('invoices.issue') : t('invoices.calc')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
