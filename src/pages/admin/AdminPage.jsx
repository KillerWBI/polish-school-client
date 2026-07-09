import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Users, GraduationCap, LayoutGrid, DollarSign, Search, Shield, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getAdminStats, getAdminUsers, deactivateUser, activateUser, setUserRole, setUserPlan } from '../../api/admin.api'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const ROLE_LABEL  = { teacher: 'Учитель', student: 'Ученик', admin: 'Администратор' }
const ROLE_COLOR  = { teacher: 'bg-blue-100 text-blue-700', student: 'bg-emerald-100 text-emerald-700', admin: 'bg-purple-100 text-purple-700' }
const PLAN_LABEL  = { free: 'Free', pro: 'Pro', school: 'School' }
const PLAN_COLOR  = { free: 'bg-slate-100 text-slate-600', pro: 'bg-amber-100 text-amber-700', school: 'bg-indigo-100 text-indigo-700' }

export default function AdminPage() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Панель администратора</h1>
          <p className="text-sm text-slate-500">Управление платформой LinguaFlow</p>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[['overview', 'Обзор'], ['users', 'Пользователи']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'users'    && <UsersTab />}
    </div>
  )
}

// ─── Обзор ──────────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => toast.error('Не удалось загрузить статистику'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-40 flex items-center justify-center text-sm text-slate-400">Загрузка…</div>
  if (!stats)  return null

  const cards = [
    { icon: GraduationCap, label: 'Учителей',     value: stats.teachers, color: 'bg-blue-50 text-blue-600' },
    { icon: Users,          label: 'Учеников',     value: stats.students, color: 'bg-emerald-50 text-emerald-600' },
    { icon: LayoutGrid,     label: 'Групп',        value: stats.groups,   color: 'bg-amber-50 text-amber-600' },
    { icon: DollarSign,     label: 'Оплачено, zł', value: stats.revenue.toFixed(0), color: 'bg-purple-50 text-purple-600' },
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
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Как создать администратора</h2>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>Пользователь регистрируется обычным способом (учитель или студент)</li>
          <li>Вы открываете вкладку «Пользователи», находите этого человека по email/нику</li>
          <li>В меню «Действия» выбираете «Сменить роль» → Admin</li>
          <li>Пользователь перелогинивается — видит панель администратора</li>
        </ol>
        <p className="text-xs text-slate-400 mt-3">
          Первый admin задаётся через <code className="bg-slate-100 px-1 rounded">ADMIN_EMAIL</code> в env Railway — при старте сервера тот юзер автоматически повышается.
        </p>
      </div>
    </div>
  )
}

// ─── Пользователи ───────────────────────────────────────────────────────────

function UsersTab() {
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
      toast.error('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search])

  useEffect(() => { load() }, [load])

  // ── Действия ──

  const doDeactivate = async () => {
    if (!confirmDe) return
    setBusy(true)
    try {
      await deactivateUser(confirmDe.id)
      toast.success(`${confirmDe.name} деактивирован`)
      setConfirmDe(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  const doActivate = async () => {
    if (!confirmAc) return
    setBusy(true)
    try {
      await activateUser(confirmAc.id)
      toast.success(`${confirmAc.name} активирован`)
      setConfirmAc(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  const doSetRole = async () => {
    if (!roleModal) return
    setBusy(true)
    try {
      await setUserRole(roleModal.user.id, roleModal.newRole)
      toast.success(`Роль изменена: ${roleModal.user.name} → ${ROLE_LABEL[roleModal.newRole]}`)
      setRoleModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  const doSetPlan = async () => {
    if (!planModal) return
    setBusy(true)
    try {
      await setUserPlan(planModal.user.id, planModal.newPlan)
      toast.success(`Тариф изменён: ${planModal.user.name} → ${PLAN_LABEL[planModal.newPlan]}`)
      setPlanModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <div>
      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Имя, email или ник…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500">
          <option value="">Все роли</option>
          <option value="teacher">Учителя</option>
          <option value="student">Ученики</option>
          <option value="admin">Администраторы</option>
        </select>
        <button type="button" onClick={load}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Счётчик */}
      <p className="text-xs text-slate-400 mb-3">Найдено: {users.length} {!search && meta.total > 20 ? `из ${meta.total}` : ''}</p>

      {/* Таблица */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-sm text-slate-400">Загрузка…</div>
      ) : users.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-slate-400">Пользователи не найдены</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-slate-500">Пользователь</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">Роль</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">Тариф</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">Статус</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500">Дата регистрации</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 text-right">Действия</th>
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
        title="Деактивировать аккаунт?"
        message={`${confirmDe?.name} потеряет доступ к платформе. Данные сохранятся. Можно восстановить.`}
        confirmLabel="Деактивировать"
      />
      <ConfirmDialog
        open={!!confirmAc}
        onClose={() => setConfirmAc(null)}
        onConfirm={doActivate}
        title="Восстановить аккаунт?"
        message={`${confirmAc?.name} снова получит доступ к платформе.`}
        confirmLabel="Восстановить"
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
  const [open, setOpen] = useState(false)

  const regDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
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
          {ROLE_LABEL[user.role] ?? user.role}
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
          {user.active ? 'Активен' : 'Заблокирован'}
        </span>
        {!user.emailVerified && <div className="text-xs text-amber-500 mt-0.5">Email не верифицирован</div>}
      </td>

      {/* Дата */}
      <td className="px-4 py-3 text-xs text-slate-500">{regDate}</td>

      {/* Действия */}
      <td className="px-4 py-3 text-right relative">
        <button type="button" onClick={() => setOpen(v => !v)}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          Действия ▾
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-4 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-1 text-left">
              <MenuSection label="Роль">
                {['teacher', 'student', 'admin'].map(r => (
                  <MenuBtn key={r} active={user.role === r}
                    onClick={() => { setOpen(false); onRole(r) }}>
                    {ROLE_LABEL[r]}
                  </MenuBtn>
                ))}
              </MenuSection>

              {(user.role === 'teacher' || user.role === 'admin') && (
                <MenuSection label="Тариф">
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
                  <MenuBtn danger onClick={() => { setOpen(false); onDeactivate() }}>Деактивировать</MenuBtn>
                ) : (
                  <MenuBtn onClick={() => { setOpen(false); onActivate() }}>Восстановить доступ</MenuBtn>
                )}
              </div>
            </div>
          </>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Сменить роль</h3>
        <p className="text-sm text-slate-500 mb-4">Пользователь: <b className="text-slate-800">{user.name}</b></p>

        <div className="space-y-2 mb-6">
          {[['teacher', 'Учитель', 'Создаёт группы, уроки, ДЗ, ведёт посещаемость'],
            ['student', 'Ученик', 'Видит своё расписание, ДЗ, оценки, может оплачивать'],
            ['admin',   'Администратор', 'Полный доступ к платформе, управление пользователями']
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
            Отмена
          </button>
          <button type="button" onClick={onConfirm} disabled={busy || currentRole === user.role}
            className="flex-1 h-10 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Модалка смены тарифа ────────────────────────────────────────────────────

function PlanModal({ user, currentPlan, onSelect, onConfirm, onClose, busy }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Сменить тариф</h3>
        <p className="text-sm text-slate-500 mb-4">Пользователь: <b className="text-slate-800">{user.name}</b></p>

        <div className="space-y-2 mb-6">
          {[['free', 'Free', 'Базовый — бесплатно'],
            ['pro',  'Pro',  'Расширенный — 49 zł/мес'],
            ['school', 'School', 'Школьный — несколько учителей']
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
            Отмена
          </button>
          <button type="button" onClick={onConfirm} disabled={busy || currentPlan === user.plan}
            className="flex-1 h-10 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}
