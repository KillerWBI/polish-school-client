import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { getTeacherAnalytics } from '../../../api/analytics.api'
import useApiQuery from '../../../hooks/useApiQuery'
import { PageSpinner } from '../../../components/ui/Spinner'

export default function TeacherCharts({ userId }) {
  const { t } = useTranslation('teacher')
  const [period,  setPeriod]  = useState('month')
  const { data, loading } = useApiQuery(
    ['teacher-analytics', userId, period],
    () => getTeacherAnalytics(userId, period),
    { enabled: !!userId },
  )

  if (loading && !data) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Шапка с фильтром периода */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600">{t('profile.financeTitle')}</h2>
        <PeriodSwitcher value={period} onChange={setPeriod} />
      </div>

      {/* Revenue: 2 линии — paid (cash) + charged (оборот) */}
      <ChartPanel title={t('profile.income')} subtitle={t('profile.incomeSub')}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data?.revenueByPeriod || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip {...tooltipStyle} formatter={(v) => `${v} zł`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="paid"    name={t('profile.paid')}  stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="charged" name={t('profile.charged')} stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* Рост студентов по месяцам */}
      <ChartPanel title={t('profile.activeStudents')} subtitle={t('profile.last6')}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data?.studentsByMonth || []}>
            <defs>
              <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="count" name={t('profile.students')} stroke="#2563EB" fill="url(#studentsGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* avgAttendance — большой плашкой */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">{t('profile.avgAttendance')}</div>
          <div className="text-3xl font-bold text-slate-900">{data?.avgAttendance ?? 0}%</div>
        </div>
        <div className="text-5xl">📊</div>
      </div>
    </div>
  )
}

/* ─── Сегментный селектор day / week / month ─────────────────── */
function PeriodSwitcher({ value, onChange }) {
  const { t } = useTranslation('teacher')
  const items = [
    { id: 'day',   label: t('profile.perDay')   },
    { id: 'week',  label: t('profile.perWeek') },
    { id: 'month', label: t('profile.perMonth')  },
  ]
  return (
    <div className="inline-flex p-0.5 rounded-lg border border-slate-200 bg-white">
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            value === it.id
              ? 'bg-blue-600 text-white'
              : 'text-slate-500 hover:text-slate-900'
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// Единый стиль тултипа Recharts на тёмной теме
const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#64748b" },
}
