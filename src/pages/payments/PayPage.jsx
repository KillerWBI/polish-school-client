import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Upload, CheckCircle, Landmark, Smartphone, CreditCard, Globe, Copy } from 'lucide-react'
import { getDebt, getTeacherPaymentInfo, studentPay } from '../../api/payments.api'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { SkeletonList } from '../../components/ui/Skeleton'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

// Иконки и лейблы для способов оплаты
const METHOD_META = {
  iban:    { Icon: Landmark,   label: 'Банковский перевод (IBAN)' },
  blik:    { Icon: Smartphone, label: 'BLIK' },
  paypal:  { Icon: CreditCard, label: 'PayPal' },
  revolut: { Icon: Globe,      label: 'Revolut' },
  custom:  { Icon: CreditCard, label: '' },
}

// Загружает скриншот напрямую в Cloudinary (unsigned upload preset)
const uploadScreenshot = async (file) => {
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', PRESET)
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error('Ошибка загрузки скриншота')
  const json = await r.json()
  return json.secure_url
}

export default function PayPage() {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const { data: debtData, loading: debtLoading } = useFetch(getDebt)
  const { data: teacherInfo, loading: infoLoading } = useFetch(() => getTeacherPaymentInfo(teacherId))

  const [amount, setAmount]         = useState('')
  const [method, setMethod]         = useState('transfer')
  const [screenshot, setScreenshot] = useState(null) // File
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)

  if (debtLoading || infoLoading) return <div className="p-5 sm:p-8 max-w-2xl mx-auto"><SkeletonList count={3} /></div>

  const row = (debtData || []).find((r) => r.teacher?.id === teacherId)
  const pd  = teacherInfo?.paymentDetails || {}
  const teacherName = teacherInfo?.name || row?.teacher?.name || '—'

  if (!row) {
    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto">
        <BackLink />
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-4xl mb-3">🤷</div>
          <div className="text-slate-900 font-medium mb-1">Счёт не найден</div>
          <div className="text-sm text-slate-500">У вас нет начислений от этого преподавателя.</div>
          <Button className="mt-5" onClick={() => navigate('/payments')}>К финансам</Button>
        </div>
      </div>
    )
  }

  const balance   = Math.max(0, Number(row.balance) || 0)
  const payAmount = amount === '' ? balance : Number(amount)
  const canSubmit = payAmount > 0 && !Number.isNaN(payAmount)

  const hasPaymentMethods = pd.iban || pd.blik || pd.paypal || pd.revolut || pd.customLabel

  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScreenshot(file)
    setUploading(true)
    try {
      const url = await uploadScreenshot(file)
      setScreenshotUrl(url)
    } catch {
      toast.error('Не удалось загрузить скриншот. Продолжите без него.')
      setScreenshot(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await studentPay({ teacherId, amount: payAmount, method, screenshotUrl: screenshotUrl || undefined })
      setDone(true)
      toast.success('Оплата записана! Преподаватель получит уведомление.')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка записи оплаты')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto">
        <BackLink />
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <div className="text-slate-900 font-semibold text-lg mb-1">Готово!</div>
          <div className="text-sm text-slate-600">Мы записали вашу оплату {fmt(payAmount)} преподавателю {teacherName}.</div>
          <Button className="mt-5" onClick={() => navigate('/payments')}>К финансам</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto">
      <BackLink />
      <h1 className="text-2xl font-semibold text-slate-900 mt-4 mb-1">Оплата занятий</h1>
      <p className="text-sm text-slate-500 mb-6">Преподаватель: <span className="font-medium text-slate-700">{teacherName}</span></p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Левая колонка: реквизиты */}
        <div className="space-y-4">
          {!hasPaymentMethods ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 text-sm">
              Преподаватель пока не заполнил реквизиты. Напишите ему напрямую, чтобы узнать, как оплатить.
            </div>
          ) : (
            <>
              {/* IBAN */}
              {pd.iban && (
                <PayCard title="Банковский перевод" Icon={Landmark}>
                  <PayRow label="IBAN" value={pd.iban} copy />
                  {pd.bic && <PayRow label="BIC / SWIFT" value={pd.bic} copy />}
                  {pd.bankName && <PayRow label="Банк" value={pd.bankName} />}
                  <PayRow label="Получатель" value={teacherName} />
                  <PayRow label="Назначение" value="Оплата занятий" />
                </PayCard>
              )}
              {/* BLIK */}
              {pd.blik && (
                <PayCard title="BLIK" Icon={Smartphone}>
                  <PayRow label="Номер телефона" value={pd.blik} copy />
                  <p className="text-xs text-slate-400 mt-1">Откройте приложение банка → BLIK → «Перевод на номер телефона».</p>
                </PayCard>
              )}
              {/* PayPal */}
              {pd.paypal && (
                <PayCard title="PayPal" Icon={CreditCard}>
                  <PayRow label="PayPal email / ссылка" value={pd.paypal} copy />
                  <p className="text-xs text-slate-400 mt-1">Войдите в PayPal → «Отправить» → введите email преподавателя.</p>
                </PayCard>
              )}
              {/* Revolut */}
              {pd.revolut && (
                <PayCard title="Revolut" Icon={Globe}>
                  <PayRow label="Revolut tag / ссылка" value={pd.revolut} copy />
                  <p className="text-xs text-slate-400 mt-1">Откройте Revolut → «Отправить» → найдите по тегу или перейдите по ссылке.</p>
                </PayCard>
              )}
              {/* Кастомное */}
              {pd.customLabel && (
                <PayCard title={pd.customLabel} Icon={Globe}>
                  {pd.customValue && <PayRow label="Реквизиты" value={pd.customValue} copy />}
                </PayCard>
              )}
            </>
          )}
        </div>

        {/* Правая колонка: сумма + скриншот + кнопка */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-4 space-y-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">Записать оплату</div>

          {/* Сводка долга */}
          <div className="space-y-1.5 text-sm pb-3 border-b border-slate-100">
            <Row label="Начислено" value={fmt(row.charged)} />
            <Row label="Оплачено"  value={fmt(row.paid)} cls="text-emerald-600" />
            <Row label="Остаток"   value={fmt(balance)} bold />
          </div>

          <Input label="Сумма оплаты, zł" type="number" value={amount}
            placeholder={String(balance)} onChange={e => setAmount(e.target.value)} />

          {/* Способ */}
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1.5">Способ</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { k: 'transfer', l: 'Перевод' },
                { k: 'blik',    l: 'BLIK' },
                { k: 'paypal',  l: 'PayPal' },
                { k: 'revolut', l: 'Revolut' },
              ].map(({ k, l }) => (
                <button key={k} type="button" onClick={() => setMethod(k)}
                  className={`h-8 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    method === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Скриншот */}
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1.5">Скриншот подтверждения (необязательно)</div>
            {screenshot ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{screenshot.name}</span>
                <button onClick={() => { setScreenshot(null); setScreenshotUrl('') }} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
              </div>
            ) : (
              <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Загрузка...' : 'Прикрепить скриншот'}
                <input type="file" accept="image/*" className="sr-only" onChange={handleScreenshotChange} disabled={uploading} />
              </label>
            )}
            <p className="text-[10px] text-slate-400 mt-1">Помогает преподавателю сверить оплату быстрее.</p>
          </div>

          <Button className="w-full" disabled={!canSubmit || uploading} loading={submitting} onClick={handleSubmit}>
            Записать оплату {canSubmit ? fmt(payAmount) : ''}
          </Button>

          <p className="text-[10px] text-center text-slate-400">
            Деньги идут напрямую преподавателю. Запись появится в «Финансах».
          </p>
        </div>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/payments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
      <ArrowLeft className="w-4 h-4" /> Назад к финансам
    </Link>
  )
}

function Row({ label, value, cls = 'text-slate-900', bold }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${cls} tabular-nums`}>{value}</span>
    </div>
  )
}

function PayCard({ title, Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-900">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PayRow({ label, value, copy }) {
  const handleCopy = () => { navigator.clipboard.writeText(value); toast.success('Скопировано') }
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-slate-900 font-mono text-xs break-all text-right">{value}</span>
        {copy && (
          <button onClick={handleCopy} className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
