import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Settings2, User, CreditCard, Shield } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { fetchMe, changePassword } from '../../api/auth.api'
import { updateMyProfile } from '../../api/profile.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

import LanguagesEditor from '../profile/components/LanguagesEditor'
import SocialsEditor   from '../profile/components/SocialsEditor'

/* ═══════════════════════════════════════════════════════════
   Страница Настройки (заменяет Профиль)
   Табы: Личные данные | Способы оплаты (учитель) | Безопасность
   ═══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user, isTeacher, updateUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile')

  if (!user) return null

  const tabs = [
    { id: 'profile',  label: 'Личные данные', Icon: User },
    ...(isTeacher ? [{ id: 'payment', label: 'Способы оплаты', Icon: CreditCard }] : []),
    { id: 'security', label: 'Безопасность', Icon: Shield },
  ]

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Настройки</h1>
          <p className="text-sm text-slate-500">Профиль, реквизиты оплаты и безопасность</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer ${
              tab === id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'profile'  && <PersonalTab  user={user} isTeacher={isTeacher} updateUser={updateUser} />}
        {tab === 'payment'  && isTeacher && <PaymentMethodsTab user={user} updateUser={updateUser} />}
        {tab === 'security' && <SecurityTab />}
      </div>
    </div>
  )
}

const PLAN_NAME = { free: 'Free', pro: 'Pro', school: 'School' }
const ROLE_NAME = { teacher: 'Преподаватель', student: 'Студент' }

/* ═══════════════════════════════════════════════════════════
   Вкладка «Личные данные» — чистая форма, без обложек
   ═══════════════════════════════════════════════════════════ */
function PersonalTab({ user, isTeacher, updateUser }) {
  const initial = useMemo(() => ({
    name:           user.name           || '',
    username:       user.username       || '',
    phone:          user.phone          || '',
    bio:            user.bio            || '',
    socialTelegram: user.socialTelegram || '',
    socialWhatsApp: user.socialWhatsApp || '',
    socialLinkedIn: user.socialLinkedIn || '',
    languages:      user.languages      || [],
  }), [user])

  const [form, setForm]     = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const set   = (patch) => setForm(f => ({ ...f, ...patch }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMyProfile(form)
      const fresh = await fetchMe()
      updateUser(fresh)
      toast.success('Данные сохранены')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Неизменяемые данные аккаунта */}
      <Section title="Данные аккаунта">
        <div className="grid sm:grid-cols-2 gap-3">
          <ReadField label="Email" value={user.email} />
          <ReadField label="Роль" value={ROLE_NAME[user.role] ?? user.role} />
          {isTeacher && <ReadField label="Тариф" value={PLAN_NAME[user.plan] ?? user.plan} />}
          <ReadField label="Статус email" value={user.emailVerified ? 'Подтверждён ✓' : 'Не подтверждён'} accent={user.emailVerified ? 'text-emerald-600' : 'text-amber-600'} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Email и роль нельзя изменить самостоятельно — обратитесь в поддержку.</p>
      </Section>

      {/* Изменяемые: имя, username, телефон */}
      <Section title="Имя и контакты">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Полное имя" value={form.name} onChange={e => set({ name: e.target.value })} />
          <div>
            <Input label="Username" value={form.username} onChange={e => set({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} />
            <p className="text-[11px] text-slate-400 mt-1">По нику вас находят для приглашений: <span className="font-mono text-blue-600">@{form.username || '—'}</span></p>
          </div>
        </div>
        <div className="mt-3">
          <Input label="Телефон" placeholder="+48 123 456 789" value={form.phone} onChange={e => set({ phone: e.target.value })} />
        </div>
      </Section>

      {/* О себе */}
      <Section title="О себе">
        <textarea value={form.bio} onChange={e => set({ bio: e.target.value.slice(0, 300) })} rows={3}
          placeholder={isTeacher ? 'Опыт, специализация, методика...' : 'Расскажите о себе...'}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none" />
        <div className="text-right text-[11px] text-slate-400 mt-1">{form.bio.length} / 300</div>
      </Section>

      {/* Мессенджеры */}
      <Section title="Мессенджеры">
        <SocialsEditor values={{ socialTelegram: form.socialTelegram, socialWhatsApp: form.socialWhatsApp, socialLinkedIn: form.socialLinkedIn }} onChange={set} />
      </Section>

      {/* Языки */}
      <Section title={isTeacher ? 'Преподаваемые языки' : 'Изучаемые языки'}>
        <LanguagesEditor value={form.languages} onChange={arr => set({ languages: arr })} withLevel={!isTeacher} />
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty} loading={saving}>
          {dirty ? 'Сохранить изменения' : 'Нет изменений'}
        </Button>
      </div>
    </div>
  )
}

function ReadField({ label, value, accent = 'text-slate-900' }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className={`h-9 px-3 flex items-center rounded-lg bg-slate-50 border border-slate-200 text-sm ${accent}`}>{value}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Вкладка «Способы оплаты» (только учитель)
   ═══════════════════════════════════════════════════════════ */
function PaymentMethodsTab({ user, updateUser }) {
  const pd = user.paymentDetails || {}
  const initial = useMemo(() => ({
    iban:        pd.iban        || '',
    bic:         pd.bic         || '',
    bankName:    pd.bankName    || '',
    paypal:      pd.paypal      || '',
    revolut:     pd.revolut     || '',
    blik:        pd.blik        || '',
    customLabel: pd.customLabel || '',
    customValue: pd.customValue || '',
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm]   = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const set   = (patch) => setForm(f => ({ ...f, ...patch }))

  const hasAny = Object.values(form).some(v => v.trim())

  const handleSave = async () => {
    setSaving(true)
    try {
      // Сохраняем только непустые поля
      const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim()))
      await updateMyProfile({ paymentDetails: Object.keys(clean).length ? clean : null })
      const fresh = await fetchMe()
      updateUser(fresh)
      toast.success('Реквизиты сохранены')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Подсказка */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Заполните хотя бы один способ — ученики увидят реквизиты на странице оплаты и смогут перевести деньги напрямую вам. Оставьте пустыми те, которые не используете.
      </div>

      {!hasAny && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Реквизиты не заполнены. Ученики не смогут самостоятельно оплатить занятие.
        </div>
      )}

      {/* IBAN / Bank Transfer */}
      <Section title="Банковский перевод (IBAN)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="IBAN" placeholder="PL61 1090 1014 0000 0712 1981 2874" value={form.iban} onChange={e => set({ iban: e.target.value })} />
          <Input label="BIC / SWIFT" placeholder="WBKPPLPP" value={form.bic} onChange={e => set({ bic: e.target.value })} />
        </div>
        <Input label="Название банка" placeholder="PKO Bank Polski" value={form.bankName} onChange={e => set({ bankName: e.target.value })} className="mt-3" />
        <p className="text-[11px] text-slate-400 mt-1.5">Универсальный вариант — работает для переводов из любой страны.</p>
      </Section>

      {/* BLIK */}
      <Section title="BLIK (Польша)">
        <Input label="Номер телефона" placeholder="+48 123 456 789" value={form.blik} onChange={e => set({ blik: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">Для польских учеников — самый быстрый способ.</p>
      </Section>

      {/* PayPal */}
      <Section title="PayPal">
        <Input label="Email или ссылка на PayPal" placeholder="teacher@gmail.com" value={form.paypal} onChange={e => set({ paypal: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">Работает в 200+ странах. Ученик переводит на ваш PayPal-email.</p>
      </Section>

      {/* Revolut */}
      <Section title="Revolut">
        <Input label="@username или ссылка на Revolut" placeholder="@teacher_name" value={form.revolut} onChange={e => set({ revolut: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">Популярно в Европе. Ваш Revolut-тег или revtag.io/ссылка.</p>
      </Section>

      {/* Своё поле */}
      <Section title="Другой способ (Wise, Venmo, CashApp…)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Название" placeholder="Wise, Venmo…" value={form.customLabel} onChange={e => set({ customLabel: e.target.value })} />
          <Input label="Реквизиты / ссылка" placeholder="wise.com/pay/..." value={form.customValue} onChange={e => set({ customValue: e.target.value })} />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty} loading={saving}>
          {dirty ? 'Сохранить реквизиты' : 'Нет изменений'}
        </Button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Вкладка «Безопасность»
   ═══════════════════════════════════════════════════════════ */
function SecurityTab() {
  const [form, setForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current || !form.next) return toast.error('Заполните оба пароля')
    if (form.next.length < 6)        return toast.error('Новый пароль — минимум 6 символов')
    if (form.next !== form.confirm)  return toast.error('Пароли не совпадают')
    setSaving(true)
    try {
      await changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      toast.success('Пароль изменён')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка смены пароля')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 max-w-md">
      <h2 className="text-sm font-medium text-slate-600 mb-1">Смена пароля</h2>
      <Input label="Текущий пароль"            type="password" value={form.current} onChange={e => set('current', e.target.value)} />
      <Input label="Новый пароль (от 6 симв.)" type="password" value={form.next}    onChange={e => set('next',    e.target.value)} />
      <Input label="Повторите новый пароль"    type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
      <Button type="submit" loading={saving}>Сменить пароль</Button>
    </form>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-medium text-slate-600 mb-3">{title}</h2>
      {children}
    </div>
  )
}
