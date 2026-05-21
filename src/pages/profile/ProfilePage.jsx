import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { updateUserName, changePassword } from '../../api/auth.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ProfilePage() {
  const { user, isTeacher, updateUser } = useAuth()

  if (!user) return null

  return (
    <div className="p-5 sm:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Профиль</h1>
        <p className="text-sm text-slate-400 mt-0.5">Личные данные и безопасность</p>
      </div>

      {/* Карточка пользователя */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center text-white text-xl font-semibold shrink-0">
          {user.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-white">{user.name}</div>
          <div className="text-sm text-slate-400 truncate">{user.email}</div>
          <div className="text-xs text-brand-300 mt-0.5">
            {isTeacher ? 'Преподаватель' : 'Студент'}
          </div>
        </div>
      </div>

      <NameSection user={user} onUpdated={(name) => updateUser({ name })} />
      <PasswordSection />
    </div>
  )
}

/* ── Смена имени ───────────────────────────────────────────── */
function NameSection({ user, onUpdated }) {
  const [name,    setName]    = useState(user.name)
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState(false)
  const [error,   setError]   = useState('')

  const dirty = name.trim() && name.trim() !== user.name

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dirty) return
    setSaving(true); setError(''); setOk(false)
    try {
      await updateUserName(user.id, name.trim())
      onUpdated(name.trim())
      setOk(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 mb-6 space-y-3">
      <h2 className="text-sm font-medium text-slate-300">Имя</h2>
      <Input label="Имя" value={name} onChange={e => setName(e.target.value)} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {ok    && <p className="text-sm text-green-400">✓ Сохранено</p>}
      <Button type="submit" loading={saving} disabled={!dirty}>Сохранить имя</Button>
    </form>
  )
}

/* ── Смена пароля ──────────────────────────────────────────── */
function PasswordSection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [ok,     setOk]     = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current || !form.next) return setError('Заполните оба пароля')
    if (form.next.length < 6)        return setError('Новый пароль минимум 6 символов')
    if (form.next !== form.confirm)  return setError('Пароли не совпадают')
    setSaving(true); setError(''); setOk(false)
    try {
      await changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      setOk(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка смены пароля')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
      <h2 className="text-sm font-medium text-slate-300">Сменить пароль</h2>
      <Input label="Текущий пароль" type="password" value={form.current}
        onChange={e => set('current', e.target.value)} />
      <Input label="Новый пароль (минимум 6 символов)" type="password" value={form.next}
        onChange={e => set('next', e.target.value)} />
      <Input label="Повторите новый пароль" type="password" value={form.confirm}
        onChange={e => set('confirm', e.target.value)} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {ok    && <p className="text-sm text-green-400">✓ Пароль изменён</p>}
      <Button type="submit" loading={saving}>Сменить пароль</Button>
    </form>
  )
}
