import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, CreditCard, Smartphone, Landmark, ShieldCheck, Lock } from 'lucide-react'
import { getDebt } from '../../api/payments.api'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

const METHODS = [
  { key: 'card',     label: 'Карта',   Icon: CreditCard },
  { key: 'blik',     label: 'BLIK',    Icon: Smartphone },
  { key: 'transfer', label: 'Перевод', Icon: Landmark },
]

// Страница оплаты (UI). Реальное списание/запись — через платёжку (Stripe Connect/BLIK) позже,
// деньги пойдут напрямую преподавателю; сейчас кнопка «Оплатить» — демо (без списания).
export default function PayPage() {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const { data, loading } = useFetch(getDebt)

  const [method, setMethod] = useState('card')
  const [amount, setAmount] = useState('')

  if (loading) return <PageSpinner />

  const row = (data || []).find((r) => r.teacher?.id === teacherId)
  if (!row) {
    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto">
        <BackLink />
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-4xl mb-3">🤷</div>
          <div className="text-slate-900 font-medium mb-1">Счёт не найден</div>
          <div className="text-sm text-slate-500">Похоже, у вас нет начислений от этого преподавателя.</div>
          <Button className="mt-5" onClick={() => navigate('/payments')}>К финансам</Button>
        </div>
      </div>
    )
  }

  const balance   = Math.max(0, Number(row.balance) || 0)
  const payAmount = amount === '' ? balance : Number(amount)
  const canPay    = payAmount > 0 && !Number.isNaN(payAmount)

  const pay = () => {
    // Пока без реального шлюза — не создаём запись оплаты (не выдумываем деньги).
    toast('Онлайн-оплата скоро подключится — платёж пойдёт напрямую преподавателю')
  }

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto">
      <BackLink />
      <h1 className="text-2xl font-semibold text-slate-900 mt-4 mb-1">Оплата занятий</h1>
      <p className="text-sm text-slate-500 mb-6">Преподаватель: <span className="font-medium text-slate-700">{row.teacher?.name}</span></p>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Левая колонка: способ + форма */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {/* Демо-плашка */}
          <div className="flex items-start gap-2 mb-5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
            <span className="text-base leading-none mt-0.5">🚧</span>
            <p className="text-xs text-amber-800">Демо-режим: онлайн-оплата подключается. Пока преподаватель отмечает оплату вручную.</p>
          </div>

          <div className="text-sm font-medium text-slate-700 mb-2">Способ оплаты</div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {METHODS.map(({ key, label, Icon }) => (
              <button key={key} type="button" onClick={() => setMethod(key)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  method === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}>
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {method === 'card' && <CardForm />}
          {method === 'blik' && <BlikForm />}
          {method === 'transfer' && <TransferInfo teacher={row.teacher?.name} />}
        </div>

        {/* Правая колонка: сводка + оплата */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-4">
          <div className="text-sm font-semibold text-slate-900 mb-4">К оплате</div>

          <div className="space-y-2 text-sm mb-4">
            <Row label="Начислено" value={fmt(row.charged)} />
            <Row label="Оплачено"  value={fmt(row.paid)} valueCls="text-emerald-600" />
            <div className="h-px bg-slate-100 my-1" />
            <Row label="Остаток" value={fmt(balance)} bold />
          </div>

          <Input label="Сумма к оплате, zł" type="number" value={amount}
            placeholder={String(balance)}
            onChange={(e) => setAmount(e.target.value)} />

          <Button className="w-full mt-4" disabled={!canPay} onClick={pay}>
            Оплатить {fmt(payAmount)}
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" /> Безопасный платёж
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Деньги идут напрямую преподавателю
          </div>
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

function Row({ label, value, valueCls = 'text-slate-900', bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${valueCls} tabular-nums`}>{value}</span>
    </div>
  )
}

function CardForm() {
  return (
    <div className="space-y-3">
      <Input label="Номер карты" placeholder="0000 0000 0000 0000" inputMode="numeric" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Срок" placeholder="ММ/ГГ" />
        <Input label="CVC" placeholder="123" inputMode="numeric" />
      </div>
      <Input label="Имя на карте" placeholder="IMIE NAZWISKO" />
    </div>
  )
}

function BlikForm() {
  return (
    <div>
      <Input label="Код BLIK" placeholder="6 цифр" inputMode="numeric" maxLength={6} />
      <p className="text-xs text-slate-400 mt-2">Откройте приложение банка и введите 6-значный код BLIK.</p>
    </div>
  )
}

function TransferInfo({ teacher }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <InfoLine label="Получатель" value={teacher || '—'} />
      <InfoLine label="Счёт (IBAN)" value="PL00 0000 0000 0000 0000 0000 0000" />
      <InfoLine label="Назначение" value="Оплата занятий" />
      <p className="text-xs text-slate-400 mt-3">Переведите сумму по этим реквизитам — преподаватель отметит оплату.</p>
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 text-right break-all">{value}</span>
    </div>
  )
}
