import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts'
import { getStudentAnalytics } from '../../../api/analytics.api'
import { PageSpinner } from '../../../components/ui/Spinner'

export default function StudentCharts({ studentId }) {
  const { t, i18n } = useTranslation('teacher')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getStudentAnalytics(studentId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <PageSpinner />
  if (!data)  return <p className="text-sm text-slate-500">{t('profile.noData')}</p>

  // grades: бэк отдаёт массив от новых к старым → разворачиваем для timeline слева-направо
  const gradesChart = [...(data.grades || [])].reverse().map(g => ({
    date: new Date(g.at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
    grade: g.grade,
    hw: g.homework,
  }))

  return (
    <div className="space-y-6">
      {/* Посещаемость по месяцам (area) */}
      <ChartPanel title={t('profile.myAttendance')} subtitle={t('profile.last6')}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.attendanceByMonth || []}>
            <defs>
              <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
            <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
            <Area type="monotone" dataKey="percent" name={t('profile.attended')} stroke="#10b981" fill="url(#attGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* Динамика оценок (line) */}
      <ChartPanel title={t('profile.grades')} subtitle={t('profile.last10hw')}>
        {gradesChart.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">{t('profile.noGrades')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gradesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 5]} allowDecimals={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(_, p) => p?.[0]?.payload?.hw || ''} />
              <Line type="monotone" dataKey="grade" name={t('profile.grade')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartPanel>

      {/* ДЗ — горизонтальный progress bar (вручную, без Recharts) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{t('profile.hwCompletion')}</h3>
            <p className="text-xs text-slate-500">{t('profile.hwCompletionHint')}</p>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.homeworkStats?.percent ?? 0}%</div>
        </div>
        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
            style={{ width: `${data.homeworkStats?.percent ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {t('profile.submittedOf', { done: data.homeworkStats?.submitted ?? 0, total: data.homeworkStats?.total ?? 0 })}
        </p>
      </div>
    </div>
  )
}

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

const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#64748b" },
}
