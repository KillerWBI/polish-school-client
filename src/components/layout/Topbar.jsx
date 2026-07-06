import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Users, FileText, Wallet, UserPlus, X, HelpCircle } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { getGroups } from '../../api/groups.api'
import { getMyStudents } from '../../api/students.api'
import { getInvitations } from '../../api/invitations.api'
import { getDashboard } from '../../api/dashboard.api'
import { helpSectionFor } from '../../utils/helpSection'

export default function Topbar() {
  const { user, isTeacher } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const helpSection = helpSectionFor(pathname)
  return (
    <header className="hidden lg:flex items-center gap-4 h-16 px-6 bg-white border-b border-slate-200">
      <SearchBox isTeacher={isTeacher} navigate={navigate} />
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate(`/help${helpSection ? `#${helpSection}` : ''}`)}
          title="Помощь по этой странице"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer">
          <HelpCircle size={18} />
        </button>
        <NotifBell isTeacher={isTeacher} navigate={navigate} />
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 h-10 pl-1 pr-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name?.[0]?.toUpperCase() ?? '?')}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs font-medium text-slate-900 max-w-[110px] truncate">{user?.name?.split(' ')[0] ?? '—'}</span>
            <span className="block text-[10px] text-slate-400">{isTeacher ? 'Преподаватель' : 'Студент'}</span>
          </span>
        </button>
      </div>
    </header>
  )
}

/* ── Рабочий поиск: группы + ученики ── */
export function SearchBox({ isTeacher, navigate }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState(null)
  const [students, setStudents] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ленивая загрузка справочника при первом фокусе
  const load = () => {
    if (groups !== null) return
    getGroups().then(setGroups).catch(() => setGroups([]))
    if (isTeacher) getMyStudents().then(setStudents).catch(() => setStudents([]))
  }

  const query = q.trim().toLowerCase()
  const gMatch = (groups || []).filter(g => g.name?.toLowerCase().includes(query)).slice(0, 5)
  const sMatch = (students || []).filter(s => s.name?.toLowerCase().includes(query) || s.username?.toLowerCase().includes(query)).slice(0, 5)
  const empty = query && groups !== null && gMatch.length === 0 && sMatch.length === 0

  const go = (to) => { navigate(to); setOpen(false); setQ('') }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
      <input
        value={q}
        onFocus={() => { setOpen(true); load() }}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        placeholder="Поиск: группа или ученик…"
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition"
      />
      {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>}

      {open && query.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden py-1 max-h-[380px] overflow-y-auto">
          {groups === null && <div className="px-4 py-3 text-sm text-slate-400">Загрузка…</div>}
          {empty && <div className="px-4 py-3 text-sm text-slate-400">Ничего не найдено по «{q}»</div>}

          {gMatch.length > 0 && <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Группы</div>}
          {gMatch.map(g => (
            <button key={g.id} onClick={() => go(`/groups/${g.id}`)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer text-left">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-3.5 h-3.5" /></span>
              <span className="truncate">{g.name}</span>
            </button>
          ))}

          {sMatch.length > 0 && <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ученики</div>}
          {sMatch.map(s => (
            <button key={s.id} onClick={() => go('/students')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer text-left">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-semibold">{s.name?.[0]?.toUpperCase() ?? '?'}</span>
              <span className="truncate flex-1">{s.name}{s.username && <span className="text-slate-400"> · @{s.username}</span>}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Рабочие уведомления ── */
export function NotifBell({ isTeacher, navigate }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    let alive = true
    Promise.all([
      getDashboard().catch(() => null),
      getInvitations('pending').catch(() => []),
    ]).then(([dash, invites]) => {
      if (!alive) return
      const k = dash?.kpi ?? {}
      const list = []
      if (isTeacher) {
        if (k.ungradedSubmissions > 0) list.push({ Icon: FileText, cls: 'bg-amber-50 text-amber-600', text: `${k.ungradedSubmissions} ДЗ ждут проверки`, to: '/homework' })
        if (k.totalDebt > 0)           list.push({ Icon: Wallet,   cls: 'bg-slate-100 text-slate-500', text: `Долг учеников: ${k.totalDebt} zł`, to: '/payments' })
        if (invites?.length)           list.push({ Icon: UserPlus, cls: 'bg-blue-50 text-blue-600', text: `${invites.length} приглашений ждут ответа`, to: '/groups' })
      } else {
        if (invites?.length)           list.push({ Icon: UserPlus, cls: 'bg-blue-50 text-blue-600', text: `${invites.length} приглашение в группу`, to: '/groups' })
        if (k.pendingHomework > 0)     list.push({ Icon: FileText, cls: 'bg-amber-50 text-amber-600', text: `${k.pendingHomework} ДЗ к сдаче`, to: '/homework' })
        if (k.myDebt > 0)              list.push({ Icon: Wallet,   cls: 'bg-slate-100 text-slate-500', text: `Ваш долг: ${k.myDebt} zł`, to: '/payments' })
      }
      setItems(list)
    })
    return () => { alive = false }
  }, [isTeacher])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.9} />
        {items.length > 0 && <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">{items.length}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Уведомления</span>
            {items.length > 0 && <span className="text-[11px] text-slate-400">{items.length} новых</span>}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <span className="inline-flex w-10 h-10 rounded-xl bg-slate-100 text-slate-400 items-center justify-center mb-2"><Bell className="w-5 h-5" /></span>
              <p className="text-sm text-slate-400">Новых уведомлений нет</p>
            </div>
          ) : (
            <div className="py-1">
              {items.map((it, i) => (
                <button key={i} onClick={() => { navigate(it.to); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-left">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${it.cls}`}><it.Icon className="w-4 h-4" /></span>
                  <span className="text-sm text-slate-700 flex-1">{it.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
