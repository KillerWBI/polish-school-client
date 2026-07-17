import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { TrendingUp, Users, CalendarCheck, Award } from 'lucide-react'
import { getTeacherAnalytics, getStudentAnalytics } from '../../api/analytics.api'

const tip = {
  contentStyle: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' },
  labelStyle: { color: '#64748B', fontWeight: 600, marginBottom: 2 },
  cursor: { fill: 'rgba(59,130,246,0.06)' },
}
const AX = { stroke: '#CBD5E1', fontSize: 11, tickLine: false, axisLine: false }

function Shell({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="px-3 sm:px-4 pt-5 pb-3">{children}</div>
    </div>
  )
}
function Seg({ value, onChange }) {
  const { t } = useTranslation('app')
  return (
    <div className="flex p-0.5 rounded-lg bg-slate-100">
      {[['day', t('analytics.segDay')], ['week', t('analytics.segWeek')], ['month', t('analytics.segMonth')]].map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`px-2.5 h-7 text-xs rounded-md transition-colors cursor-pointer ${value === k ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}>{l}</button>
      ))}
    </div>
  )
}
function Skeleton() { return <div className="h-[220px] animate-pulse bg-slate-50 rounded-xl" /> }
function Blank({ text }) { return <div className="h-[220px] flex items-center justify-center text-center text-sm text-slate-400">{text}</div> }
function Stat({ Icon, cls, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-4">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls}`}><Icon className="w-5 h-5" /></span>
      <div>
        <div className="text-[22px] font-semibold text-slate-900 leading-none">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{label}</div>
      </div>
    </div>
  )
}

function ProfitCard({ pp, loading }) {
  const { t } = useTranslation('app')
  const p = pp ?? { paid: 0, owed: 0, potential: 0 }
  const total = p.paid + p.owed + p.potential
  const parts = [
    { key: 'paid', label: t('analytics.paid'),    hint: t('analytics.paidHint'),      value: p.paid,      dot: 'bg-emerald-500', text: 'text-emerald-600' },
    { key: 'owed', label: t('analytics.owedNeg'), hint: t('analytics.owedHint'),      value: p.owed,      dot: 'bg-amber-500',   text: 'text-amber-600' },
    { key: 'pot',  label: t('analytics.potential'), hint: t('analytics.potentialHint'), value: p.potential, dot: 'bg-blue-500',    text: 'text-blue-600' },
  ]
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900">{t('analytics.profitTitle')}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('analytics.profitSubtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
        {parts.map(x => (
          <div key={x.key}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className={`w-2 h-2 rounded-full ${x.dot}`} />{x.label}</div>
            <div className={`mt-1 text-[22px] font-semibold ${x.text}`}>{x.value} <span className="text-sm text-slate-400 font-normal">zł</span></div>
            <div className="text-[11px] text-slate-400">{x.hint}</div>
          </div>
        ))}
      </div>

      {total > 0 ? (
        <>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
            {parts.map(x => x.value > 0 && <div key={x.key} className={x.dot} style={{ width: `${(x.value / total) * 100}%` }} />)}
          </div>
          <p className="text-xs text-slate-400 mt-2">{t('analytics.totalPossible')} <b className="text-slate-700 font-semibold">{total} zł</b></p>
        </>
      ) : (
        <p className="text-xs text-slate-400">{loading ? t('analytics.loading') : t('analytics.noData')}</p>
      )}
    </div>
  )
}

export default function AnalyticsChart({ isTeacher, userId }) {
  const { t } = useTranslation('app')
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-[18px] h-[18px] text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('analytics.heading')}</h2>
      </div>
      {isTeacher ? <TeacherAnalytics userId={userId} /> : <StudentAnalytics userId={userId} />}
    </div>
  )
}

/* ══════════ УЧИТЕЛЬ ══════════ */
function TeacherAnalytics({ userId }) {
  const { t } = useTranslation('app')
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getTeacherAnalytics(userId, period).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [userId, period])

  const rev = data?.revenueByPeriod || []
  const students = data?.studentsByMonth || []
  const revHas = rev.some(r => (r.paid || 0) + (r.owed || 0) + (r.potential || 0) > 0)
  const stuHas = students.some(s => s.count > 0)
  const months = t('analytics.months', { returnObjects: true })
  const weekPrefix = t('analytics.weekPrefix')
  const fmtX = (v) => xLabel(v, months, weekPrefix)

  return (
    <div className="space-y-4">
      <ProfitCard pp={data?.profitTotal} loading={loading} />

      <div className="grid grid-cols-2 gap-4">
        <Stat Icon={CalendarCheck} cls="bg-emerald-50 text-emerald-600" label={t('analytics.avgAttendance')} value={`${data?.avgAttendance ?? 0}%`} />
        <Stat Icon={Users}         cls="bg-violet-50 text-violet-600"   label={t('analytics.activeStudents')} value={lastCount(students)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Shell title={t('analytics.revenueTitle')} subtitle={rangeHint(period, t)} right={<Seg value={period} onChange={setPeriod} />}>
          {loading ? <Skeleton /> : !revHas ? <Blank text={t('analytics.noPeriodData')} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rev} barGap={2} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="bucket" {...AX} tickFormatter={fmtX} minTickGap={4} /><YAxis {...AX} width={40} />
                <Tooltip {...tip} labelFormatter={fmtX} formatter={(v, n) => [`${v} zł`, n]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <Bar dataKey="paid"      name={t('analytics.paid')}      fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="owed"      name={t('analytics.owed')}      fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="potential" name={t('analytics.potential')} fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Shell>

        <Shell title={t('analytics.studentsTitle')} subtitle={t('analytics.byMonth')}>
          {loading ? <Skeleton /> : !stuHas ? <Blank text={t('analytics.noStudentData')} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={students}>
                <defs><linearGradient id="stg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="bucket" {...AX} /><YAxis {...AX} width={30} allowDecimals={false} />
                <Tooltip {...tip} formatter={(v) => [v, t('analytics.students')]} />
                <Area type="monotone" dataKey="count" name={t('analytics.students')} stroke="#8B5CF6" strokeWidth={2.5} fill="url(#stg)" dot={{ r: 3, fill: '#8B5CF6' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Shell>
      </div>
    </div>
  )
}

/* ══════════ УЧЕНИК ══════════ */
function StudentAnalytics({ userId }) {
  const { t, i18n } = useTranslation('app')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getStudentAnalytics(userId).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [userId])

  const att = data?.attendanceByMonth || []
  const grades = [...(data?.grades || [])].reverse().map(g => ({
    date: new Date(g.at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }), grade: g.grade, hw: g.homework,
  }))
  const attHas = att.length > 0

  const hs = data?.homeworkStats
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Stat Icon={CalendarCheck} cls="bg-emerald-50 text-emerald-600" label={t('analytics.avgAttendance')} value={`${avg(att, 'percent')}%`} />
        <Stat Icon={Award}         cls="bg-amber-50 text-amber-600"     label={t('analytics.hwDone')} value={`${hs?.percent ?? 0}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Shell title={t('analytics.myAttendance')} subtitle={t('analytics.percentByMonth')}>
          {loading ? <Skeleton /> : !attHas ? <Blank text={t('analytics.noMarkedLessons')} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={att}>
                <defs><linearGradient id="atg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="bucket" {...AX} /><YAxis {...AX} width={36} domain={[0, 100]} unit="%" />
                <Tooltip {...tip} formatter={(v) => [`${v}%`, t('analytics.attended')]} />
                <Area type="monotone" dataKey="percent" name={t('analytics.attended')} stroke="#10B981" strokeWidth={2.5} fill="url(#atg)" dot={{ r: 3, fill: '#10B981' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Shell>

        <Shell title={t('analytics.grades')} subtitle={t('analytics.recentHw')}>
          {loading ? <Skeleton /> : grades.length === 0 ? <Blank text={t('analytics.noGrades')} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={grades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="date" {...AX} /><YAxis {...AX} width={34} domain={[0, 100]} />
                <Tooltip {...tip} labelFormatter={(_, p) => p?.[0]?.payload?.hw || ''} formatter={(v) => [`${v}/100`, t('analytics.grade')]} />
                <Line type="monotone" dataKey="grade" name={t('analytics.grade')} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Shell>
      </div>

      {/* Выполнение ДЗ */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">{t('analytics.hwCompletion')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t('analytics.hwCompletionHint')}</p>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{hs?.percent ?? 0}%</div>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all" style={{ width: `${hs?.percent ?? 0}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{t('analytics.submittedOf', { done: hs?.submitted ?? 0, total: hs?.total ?? 0 })}</p>
      </div>
    </div>
  )
}

/* утилиты */
function lastCount(rows) { return rows.length ? rows[rows.length - 1].count : 0 }
function xLabel(v, months, weekPrefix) {
  if (typeof v !== 'string') return v
  if (v.includes('-W')) return weekPrefix + v.split('-W')[1]        // 2026-W27 → н27
  const m = v.match(/^(\d{4})-(\d{2})$/); if (m) return months[+m[2] - 1]
  const d = v.match(/^\d{4}-(\d{2})-(\d{2})$/); if (d) return `${d[2]}.${d[1]}` // 2026-07-02 → 02.07
  return v
}
function rangeHint(p, t) { return p === 'day' ? t('analytics.rangeDay') : p === 'week' ? t('analytics.rangeWeek') : t('analytics.rangeMonth') }
function avg(rows, key) { if (!rows.length) return 0; return Math.round(rows.reduce((s, r) => s + (r[key] || 0), 0) / rows.length) }
