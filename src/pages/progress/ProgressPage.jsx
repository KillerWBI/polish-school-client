import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts'
import { Flame, CalendarCheck, Award, BookMarked, Clock } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { getMyProgress } from '../../api/progress.api'
import { getStudentAnalytics } from '../../api/analytics.api'
import { SkeletonDashboard } from '../../components/ui/Skeleton'

const tip = {
  contentStyle: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' },
  labelStyle: { color: '#64748B', fontWeight: 600, marginBottom: 2 },
}
const AX = { stroke: '#CBD5E1', fontSize: 11, tickLine: false, axisLine: false }

export default function ProgressPage() {
  const { user } = useAuth()
  const [progress, setProgress]   = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([
      getMyProgress().catch(() => null),
      user?.id ? getStudentAnalytics(user.id).catch(() => null) : Promise.resolve(null),
    ]).then(([p, a]) => {
      if (!alive) return
      setProgress(p); setAnalytics(a); setLoading(false)
    })
    return () => { alive = false }
  }, [user?.id])

  if (loading) return <div className="p-5 sm:p-8"><SkeletonDashboard /></div>

  const streak    = progress?.streak ?? 0
  const attended  = analytics?.totals?.lessonsAttended ?? 0
  const gradesAvg = analytics?.totals?.gradesAvg ?? 0
  const extHours  = progress?.external?.hours ?? 0

  return (
    <div className="p-5 sm:p-8 max-w-[1100px]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Мой прогресс</h1>
        <p className="text-sm text-slate-500 mt-0.5">Учёба, посещаемость, оценки и активность в одном месте</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat Icon={Flame}        cls="bg-orange-50 text-orange-600"   value={`${streak} дн`}  label="Streak активности" />
        <Stat Icon={CalendarCheck} cls="bg-emerald-50 text-emerald-600" value={attended}         label="Уроков посещено" />
        <Stat Icon={Award}        cls="bg-blue-50 text-blue-600"        value={gradesAvg || '—'} label="Средняя оценка" />
        <Stat Icon={Clock}        cls="bg-violet-50 text-violet-600"    value={`${extHours} ч`}  label="Внешних занятий" />
      </div>

      {/* Heatmap активности */}
      <Card title="Активность за последние ~17 недель" subtitle="Уроки, ДЗ, словарь и занятия">
        <Heatmap days={progress?.activityByDay ?? []} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Посещаемость */}
        <Card title="Посещаемость по месяцам">
          {analytics?.attendanceByMonth?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.attendanceByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="bucket" {...AX} />
                <YAxis {...AX} domain={[0, 100]} />
                <Tooltip {...tip} formatter={(v) => [`${v}%`, 'Посещаемость']} />
                <Area type="monotone" dataKey="percent" stroke="#10b981" strokeWidth={2} fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Blank />}
        </Card>

        {/* Оценки */}
        <Card title="Динамика оценок">
          {analytics?.grades?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...analytics.grades].reverse()} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="at" {...AX} tickFormatter={(v) => new Date(v).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} />
                <YAxis {...AX} domain={[0, 100]} />
                <Tooltip {...tip} labelFormatter={(v) => new Date(v).toLocaleDateString('ru-RU')} formatter={(v) => [v, 'Оценка']} />
                <Line type="monotone" dataKey="grade" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Blank />}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* ДЗ */}
        <Card title="Домашние задания">
          <HwProgress stats={analytics?.homeworkStats} />
        </Card>

        {/* Словарь */}
        <Card title="Словарь">
          <VocabBar vocab={progress?.vocab} />
        </Card>
      </div>
    </div>
  )
}

function Stat({ Icon, cls, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls}`}><Icon className="w-5 h-5" /></span>
      <div>
        <div className="text-xl font-semibold text-slate-900 leading-none">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{label}</div>
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Blank() {
  return <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">Пока нет данных</div>
}

/* ── Heatmap (GitHub-style) ── */
function Heatmap({ days }) {
  const map = new Map(days.map(d => [d.date, d.count]))
  const WEEKS = 17
  const total = WEEKS * 7
  const cells = []
  const today = new Date()
  // Начинаем с (total-1) дней назад, идём до сегодня
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ key, count: map.get(key) || 0 })
  }
  const level = (c) => c === 0 ? 'bg-slate-100' : c === 1 ? 'bg-emerald-200' : c <= 3 ? 'bg-emerald-400' : 'bg-emerald-600'

  // Разбиваем на колонки-недели (по 7)
  const columns = []
  for (let w = 0; w < WEEKS; w++) columns.push(cells.slice(w * 7, w * 7 + 7))

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div key={cell.key} title={`${cell.key}: ${cell.count} активностей`}
                className={`w-3.5 h-3.5 rounded-sm ${level(cell.count)}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <span>меньше</span>
        <span className="w-3 h-3 rounded-sm bg-slate-100" />
        <span className="w-3 h-3 rounded-sm bg-emerald-200" />
        <span className="w-3 h-3 rounded-sm bg-emerald-400" />
        <span className="w-3 h-3 rounded-sm bg-emerald-600" />
        <span>больше</span>
      </div>
    </div>
  )
}

function HwProgress({ stats }) {
  const s = stats ?? { submitted: 0, total: 0, percent: 0 }
  return (
    <div className="py-4">
      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-bold text-slate-900">{s.percent}%</span>
        <span className="text-sm text-slate-400">{s.submitted} из {s.total} сдано</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${s.percent}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-2">Учитываются задания с прошедшим дедлайном</p>
    </div>
  )
}

function VocabBar({ vocab }) {
  const v = vocab ?? { new: 0, learning: 0, known: 0, total: 0 }
  if (!v.total) return <div className="py-6 text-center text-sm text-slate-400">Словарь пуст — добавьте слова</div>
  const seg = [
    { label: 'Новые', value: v.new, cls: 'bg-slate-300' },
    { label: 'Учу', value: v.learning, cls: 'bg-amber-400' },
    { label: 'Знаю', value: v.known, cls: 'bg-emerald-500' },
  ]
  return (
    <div className="py-4">
      <div className="flex items-center gap-1 mb-3">
        <BookMarked className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-600">{v.total} слов</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex">
        {seg.map(s => s.value > 0 && (
          <div key={s.label} className={s.cls} style={{ width: `${(s.value / v.total) * 100}%` }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        {seg.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2.5 h-2.5 rounded-sm ${s.cls}`} /> {s.label}: {s.value}
          </div>
        ))}
      </div>
    </div>
  )
}
