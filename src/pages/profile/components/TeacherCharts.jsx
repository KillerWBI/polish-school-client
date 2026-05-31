import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { getTeacherAnalytics } from '../../../api/analytics.api'
import { PageSpinner } from '../../../components/ui/Spinner'

export default function TeacherCharts({ userId }) {
  const [period,  setPeriod]  = useState('month')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Перезагружаем при смене периода
  useEffect(() => {
    setLoading(true)
    getTeacherAnalytics(userId, period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [userId, period])

  if (loading && !data) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Шапка с фильтром периода */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Финансы и активность</h2>
        <PeriodSwitcher value={period} onChange={setPeriod} />
      </div>

      {/* Revenue: 2 линии — paid (cash) + charged (оборот) */}
      <ChartPanel title="Доход" subtitle="Оплачено vs начислено">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data?.revenueByPeriod || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip {...tooltipStyle} formatter={(v) => `${v} zł`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="paid"    name="Оплачено"  stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="charged" name="Начислено" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* Рост студентов по месяцам */}
      <ChartPanel title="Активные студенты" subtitle="Последние 6 месяцев">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data?.studentsByMonth || []}>
            <defs>
              <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="count" name="Студентов" stroke="#8b5cf6" fill="url(#studentsGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* avgAttendance — большой плашкой */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Средняя посещаемость</div>
          <div className="text-3xl font-bold text-white">{data?.avgAttendance ?? 0}%</div>
        </div>
        <div className="text-5xl">📊</div>
      </div>
    </div>
  )
}

/* ─── Сегментный селектор day / week / month ─────────────────── */
function PeriodSwitcher({ value, onChange }) {
  const items = [
    { id: 'day',   label: 'День'   },
    { id: 'week',  label: 'Неделя' },
    { id: 'month', label: 'Месяц'  },
  ]
  return (
    <div className="inline-flex p-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            value === it.id
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Карточка-контейнер для графика ──────────────────────────── */
function ChartPanel({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// Единый стиль тултипа Recharts на тёмной теме
const tooltipStyle = {
  contentStyle: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: '#94a3b8' },
}
