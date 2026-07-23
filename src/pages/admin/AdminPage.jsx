import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Users, GraduationCap, LayoutGrid, DollarSign, Search, Shield, ChevronLeft, ChevronRight, RefreshCw, LifeBuoy } from 'lucide-react'
import { getAdminStats, getAdminUsers, deactivateUser, activateUser, setUserRole, setUserPlan, getSupportTickets, replySupportTicket } from '../../api/admin.api'
import useApiQuery from '../../hooks/useApiQuery'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

// Ключи лейблов ролей/статусов; цвета — в коде. Резолвятся t() при рендере.
const ROLE_KEY    = { teacher: 'admin.roleTeacher', student: 'admin.roleStudent', admin: 'admin.roleAdmin' }
const ROLE_COLOR  = { teacher: 'bg-blue-100 text-blue-700', student: 'bg-emerald-100 text-emerald-700', admin: 'bg-purple-100 text-purple-700' }
const PLAN_LABEL  = { free: 'Free', pro: 'Pro', school: 'School' }
const PLAN_COLOR  = { free: 'bg-slate-100 text-slate-600', pro: 'bg-amber-100 text-amber-700', school: 'bg-indigo-100 text-indigo-700' }

export default function AdminPage() {
  const { t } = useTranslation('teacher')
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('admin.title')}</h1>
          <p className="text-sm text-slate-500">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[['overview', t('admin.tabOverview')], ['users', t('admin.tabUsers')], ['support', t('admin.tabSupport')]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'users'    && <UsersTab />}
      {tab === 'support'  && <SupportTab />}
    </div>
  )
}

// ─── Обзор ──────────────────────────────────────────────────────────────────

function OverviewTab() {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: stats, loading } = useApiQuery(['admin-stats'], getAdminStats)

  if (loading) return <div className="h-40 flex items-center justify-center text-sm text-slate-400">{tc('loading')}</div>
  if (!stats)  return null

  const cards = [
    { icon: GraduationCap, label: t('admin.cardTeachers'), value: stats.teachers, color: 'bg-blue-50 text-blue-600' },
    { icon: Users,          label: t('admin.cardStudents'), value: stats.students, color: 'bg-emerald-50 text-emerald-600' },
    { icon: LayoutGrid,     label: t('admin.cardGroups'),   value: stats.groups,   color: 'bg-amber-50 text-amber-600' },
    { icon: DollarSign,     label: t('admin.cardRevenue'),  value: stats.revenue.toFixed(0), color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">{t('admin.howToTitle')}</h2>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>{t('admin.howStep1')}</li>
          <li>{t('admin.howStep2')}</li>
          <li>{t('admin.howStep3')}</li>
          <li>{t('admin.howStep4')}</li>
        </ol>
        <p className="text-xs text-slate-400 mt-3">
          {t('admin.envNotePre')} <code className="bg-slate-100 px-1 rounded">ADMIN_EMAIL</code> {t('admin.envNotePost')}
        </p>
      </div>
    </div>
  )
}

// ─── Пользователи ───────────────────────────────────────────────────────────

function UsersTab() {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [users, setUsers]     = useState([])
  const [meta, setMeta]       = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage]       = useState(1)

  // Модальные состояния
  const [roleModal, setRoleModal]     = useState(null)  // { user, newRole }
  const [planModal, setPlanModal]     = useState(null)  // { user, newPlan }
  const [confirmDe, setConfirmDe]     = useState(null)  // user to deactivate
  const [confirmAc, setConfirmAc]     = useState(null)  // user to activate
  const [busy, setBusy]               = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (roleFilter) params.role = roleFilter
      const res = await getAdminUsers(params)
      // Фильтруем по поиску локально (search по name/email/username)
      const q = search.toLowerCase()
      const filtered = q
        ? res.data.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q))
        : res.data
      setUsers(filtered)
      setMeta(res.meta)
    } catch {
      toast.error(t('admin.usersError'))
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search, t])

  useEffect(() => { load() }, [load])

  // ── Действия ──

  const doDeactivate = async () => {
    if (!confirmDe) return
    setBusy(true)
    try {
      await deactivateUser(confirmDe.id)
      toast.success(t('admin.deactivatedToast', { name: confirmDe.name }))
      setConfirmDe(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
    } finally { setBusy(false) }
  }

  const doActivate = async () => {
    if (!confirmAc) return
    setBusy(true)
    try {
      await activateUser(confirmAc.id)
      toast.success(t('admin.activatedToast', { name: confirmAc.name }))
      setConfirmAc(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
    } finally { setBusy(false) }
  }

  const doSetRole = async () => {
    if (!roleModal) return
    setBusy(true)
    try {
      await setUserRole(roleModal.user.id, roleModal.newRole)
      toast.success(t('admin.roleChanged', { name: roleModal.user.name, role: t(ROLE_KEY[roleModal.newRole]) }))
      setRoleModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
    } finally { setBusy(false) }
  }

  const doSetPlan = async () => {
    if (!planModal) return
    setBusy(true)
    try {
      await setUserPlan(planModal.user.id, planModal.newPlan)
      toast.success(t('admin.planChanged', { name: planModal.user.name, plan: PLAN_LABEL[planModal.newPlan] }))
      setPlanModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
    } finally { setBusy(false) }
  }

  return (
    <div>
      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder={t('admin.searchPlaceholder')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500">
          <option value="">{t('admin.allRoles')}</option>
          <option value="teacher">{t('admin.teachers')}</option>
          <option value="student">{t('admin.students')}</option>
          <option value="admin">{t('admin.admins')}</option>
        </select>
        <button type="button" onClick={load}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Счётчик */}
      <p className="text-xs text-slate-400 mb-3">{t('admin.found', { n: users.length })} {!search && meta.total > 20 ? t('admin.ofTotal', { total: meta.total }) : ''}</p>

      {/* Таблица */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-sm text-slate-400">{tc('loading')}</div>
      ) : users.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-slate-400">{t('admin.usersNotFound')}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-slate-500">{t('admin.colUser')}</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">{t('admin.colRole')}</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">{t('admin.colPlan')}</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">{t('admin.colStatus')}</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">{t('admin.colRegDate')}</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 text-right">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <UserRow key={u.id} user={u}
                  onDeactivate={() => setConfirmDe(u)}
                  onActivate={()   => setConfirmAc(u)}
                  onRole={(newRole) => setRoleModal({ user: u, newRole })}
                  onPlan={(newPlan) => setPlanModal({ user: u, newPlan })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {!search && meta.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600">{page} / {meta.pages}</span>
          <button type="button" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Диалоги ── */}

      <ConfirmDialog
        open={!!confirmDe}
        onClose={() => setConfirmDe(null)}
        onConfirm={doDeactivate}
        title={t('admin.deactivateTitle')}
        message={t('admin.deactivateMsg', { name: confirmDe?.name })}
        confirmLabel={t('admin.deactivate')}
      />
      <ConfirmDialog
        open={!!confirmAc}
        onClose={() => setConfirmAc(null)}
        onConfirm={doActivate}
        title={t('admin.activateTitle')}
        message={t('admin.activateMsg', { name: confirmAc?.name })}
        confirmLabel={t('admin.activate')}
      />

      {/* Модалка смены роли */}
      {roleModal && (
        <RoleModal
          user={roleModal.user}
          currentRole={roleModal.newRole}
          onSelect={(r) => setRoleModal(m => ({ ...m, newRole: r }))}
          onConfirm={doSetRole}
          onClose={() => setRoleModal(null)}
          busy={busy}
        />
      )}

      {/* Модалка смены тарифа */}
      {planModal && (
        <PlanModal
          user={planModal.user}
          currentPlan={planModal.newPlan}
          onSelect={(p) => setPlanModal(m => ({ ...m, newPlan: p }))}
          onConfirm={doSetPlan}
          onClose={() => setPlanModal(null)}
          busy={busy}
        />
      )}
    </div>
  )
}

// ─── Строка таблицы ─────────────────────────────────────────────────────────

function UserRow({ user, onDeactivate, onActivate, onRole, onPlan }) {
  const { t, i18n } = useTranslation('teacher')
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const dropW = 208  // w-52
      const dropH = 288  // max-h-72
      // Координаты относительно документа (viewport + прокрутка страницы)
      const pageTop = rect.bottom + window.scrollY
      const pageLeft = Math.max(8, rect.right + window.scrollX - dropW)
      // Если снизу не хватает места — открыть вверх
      const top = (window.innerHeight - rect.bottom) >= dropH
        ? pageTop + 4
        : rect.top + window.scrollY - dropH - 4
      setDropPos({ top, left: pageLeft })
    }
    setOpen(v => !v)
  }

  const regDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '—'

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Пользователь */}
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{user.name}</div>
        <div className="text-xs text-slate-400">{user.email}</div>
        {user.username && <div className="text-xs text-slate-400">@{user.username}</div>}
      </td>

      {/* Роль */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
          {ROLE_KEY[user.role] ? t(ROLE_KEY[user.role]) : user.role}
        </span>
      </td>

      {/* Тариф (только у учителей) */}
      <td className="px-4 py-3">
        {user.role === 'teacher' || user.role === 'admin' ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLOR[user.plan] ?? 'bg-slate-100 text-slate-600'}`}>
            {PLAN_LABEL[user.plan] ?? user.plan ?? '—'}
          </span>
        ) : <span className="text-slate-300 text-xs">—</span>}
      </td>

      {/* Статус */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs ${user.active ? 'text-emerald-600' : 'text-red-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {user.active ? t('admin.statusActive') : t('admin.statusBlocked')}
        </span>
        {!user.emailVerified && <div className="text-xs text-amber-500 mt-0.5">{t('admin.emailNotVerified')}</div>}
      </td>

      {/* Дата */}
      <td className="px-4 py-3 text-xs text-slate-500">{regDate}</td>

      {/* Действия */}
      <td className="px-4 py-3 text-right">
        <button ref={btnRef} type="button" onClick={handleOpen}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          {t('admin.actionsBtn')}
        </button>

        {/* Portal — рендерим в document.body, вне overflow-hidden таблицы */}
        {open && createPortal(
          <>
            {/* Прозрачный оверлей — закрывает по клику вне */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            {/* Дропдаун: absolute по координатам страницы, скроллится вместе с ней */}
            <div
              style={{ position: 'absolute', top: dropPos.top, left: dropPos.left, width: 208 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl z-[9999] py-1 text-left max-h-72 overflow-y-auto"
            >
              <MenuSection label={t('admin.menuRole')}>
                {['teacher', 'student', 'admin'].map(r => (
                  <MenuBtn key={r} active={user.role === r}
                    onClick={() => { setOpen(false); onRole(r) }}>
                    {t(ROLE_KEY[r])}
                  </MenuBtn>
                ))}
              </MenuSection>

              {(user.role === 'teacher' || user.role === 'admin') && (
                <MenuSection label={t('admin.menuPlan')}>
                  {['free', 'pro', 'school'].map(p => (
                    <MenuBtn key={p} active={user.plan === p}
                      onClick={() => { setOpen(false); onPlan(p) }}>
                      {PLAN_LABEL[p]}
                    </MenuBtn>
                  ))}
                </MenuSection>
              )}

              <div className="border-t border-slate-100 mt-1 pt-1">
                {user.active ? (
                  <MenuBtn danger onClick={() => { setOpen(false); onDeactivate() }}>{t('admin.menuDeactivate')}</MenuBtn>
                ) : (
                  <MenuBtn onClick={() => { setOpen(false); onActivate() }}>{t('admin.menuRestore')}</MenuBtn>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
      </td>
    </tr>
  )
}

function MenuSection({ label, children }) {
  return (
    <div className="px-2 pt-1.5 pb-1">
      <p className="text-xs font-medium text-slate-400 px-2 mb-1">{label}</p>
      {children}
    </div>
  )
}

function MenuBtn({ children, onClick, active, danger }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between
        ${active ? 'bg-blue-50 text-blue-700 font-medium' : danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>
      {children}
      {active && <span className="text-blue-500">✓</span>}
    </button>
  )
}

// ─── Модалка смены роли ──────────────────────────────────────────────────────

function RoleModal({ user, currentRole, onSelect, onConfirm, onClose, busy }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('admin.roleModalTitle')}</h3>
        <p className="text-sm text-slate-500 mb-4">{t('admin.userLabel')} <b className="text-slate-800">{user.name}</b></p>

        <div className="space-y-2 mb-6">
          {[['teacher', t('admin.roleTeacher'), t('admin.roleTeacherDesc')],
            ['student', t('admin.roleStudent'), t('admin.roleStudentDesc')],
            ['admin',   t('admin.roleAdmin'), t('admin.roleAdminDesc')]
          ].map(([r, label, desc]) => (
            <button key={r} type="button" onClick={() => onSelect(r)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${currentRole === r ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="font-medium text-sm text-slate-900">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            {tc('cancel')}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy || currentRole === user.role}
            className="flex-1 h-10 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {t('admin.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Поддержка ───────────────────────────────────────────────────────────────

const TICKET_STATUS = {
  open:        { key: 'admin.ticketOpen',       cls: 'bg-amber-100 text-amber-700' },
  in_progress: { key: 'admin.ticketInProgress', cls: 'bg-blue-100 text-blue-700' },
  resolved:    { key: 'admin.ticketResolved',   cls: 'bg-emerald-100 text-emerald-700' },
}
const TICKET_CATEGORY_KEY = {
  question: 'admin.catQuestion',
  problem:  'admin.catProblem',
  billing:  'admin.catBilling',
}

function SupportTab() {
  const { t, i18n } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [tickets, setTickets] = useState([])
  const [counts, setCounts]   = useState({ open: 0, in_progress: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [active, setActive]   = useState(null) // тикет в модалке

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSupportTickets(statusFilter ? { status: statusFilter } : {})
      setTickets(res.data)
      setCounts(res.meta?.counts ?? { open: 0, in_progress: 0, resolved: 0 })
    } catch {
      toast.error(t('admin.ticketsError'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, t])

  useEffect(() => { load() }, [load])

  const filters = [
    ['', t('admin.fAll')],
    ['open', t('admin.fOpen', { n: counts.open })],
    ['in_progress', t('admin.fInProgress', { n: counts.in_progress })],
    ['resolved', t('admin.fResolved', { n: counts.resolved })],
  ]

  return (
    <div>
      {/* Фильтры по статусу */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === key ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
        <button type="button" onClick={load}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors ml-auto">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-sm text-slate-400">{tc('loading')}</div>
      ) : tickets.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
          <LifeBuoy className="w-8 h-8" />
          <span className="text-sm">{t('admin.noTickets')}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(tk => (
            <button key={tk.id} type="button" onClick={() => setActive(tk)}
              className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 truncate">{tk.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TICKET_STATUS[tk.status]?.cls}`}>{TICKET_STATUS[tk.status] ? t(TICKET_STATUS[tk.status].key) : tk.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{TICKET_CATEGORY_KEY[tk.category] ? t(TICKET_CATEGORY_KEY[tk.category]) : tk.category}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1 line-clamp-1">{tk.message}</div>
                  <div className="text-xs text-slate-400 mt-1">{tk.name} · {tk.email}</div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {new Date(tk.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <TicketModal ticket={active} onClose={() => setActive(null)} onSaved={() => { setActive(null); load() }} />
      )}
    </div>
  )
}

function TicketModal({ ticket, onClose, onSaved }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [reply, setReply]   = useState(ticket.adminReply || '')
  const [status, setStatus] = useState(ticket.status)
  const [busy, setBusy]     = useState(false)

  const save = async (withReply) => {
    setBusy(true)
    try {
      const payload = { status }
      if (withReply) payload.adminReply = reply
      await replySupportTicket(ticket.id, payload)
      toast.success(withReply ? t('admin.replySent') : t('admin.statusUpdated'))
      onSaved()
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
        <p className="text-xs text-slate-400 mb-4">
          {ticket.name} · {ticket.email} · {TICKET_CATEGORY_KEY[ticket.category] ? t(TICKET_CATEGORY_KEY[ticket.category]) : ticket.category}
          {ticket.author && <> · <span className="text-slate-500">{ROLE_KEY[ticket.author.role] ? t(ROLE_KEY[ticket.author.role]) : ticket.author.role}</span></>}
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 whitespace-pre-wrap mb-4">
          {ticket.message}
        </div>

        <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.statusLabel')}</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="w-full h-10 px-3 mb-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500">
          <option value="open">{t('admin.ticketOpen')}</option>
          <option value="in_progress">{t('admin.ticketInProgress')}</option>
          <option value="resolved">{t('admin.ticketResolved')}</option>
        </select>

        <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.replyLabel', { email: ticket.email })}</label>
        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
          placeholder={t('admin.replyPlaceholder')}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-none mb-4" />

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => save(false)} loading={busy}>
            {t('admin.onlyStatus')}
          </Button>
          <Button className="flex-1" onClick={() => save(true)} loading={busy} disabled={!reply.trim()}>
            {t('admin.replyAndClose')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Модалка смены тарифа ────────────────────────────────────────────────────

function PlanModal({ user, currentPlan, onSelect, onConfirm, onClose, busy }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('admin.planModalTitle')}</h3>
        <p className="text-sm text-slate-500 mb-4">{t('admin.userLabel')} <b className="text-slate-800">{user.name}</b></p>

        <div className="space-y-2 mb-6">
          {[['free', 'Free', t('admin.freeDesc')],
            ['pro',  'Pro',  t('admin.proDesc')],
            ['school', 'School', t('admin.schoolDesc')]
          ].map(([p, label, desc]) => (
            <button key={p} type="button" onClick={() => onSelect(p)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${currentPlan === p ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="font-medium text-sm text-slate-900">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            {tc('cancel')}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy || currentPlan === user.plan}
            className="flex-1 h-10 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {t('admin.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}
