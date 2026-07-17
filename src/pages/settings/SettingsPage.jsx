import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('teacher')
  const { user, isTeacher, updateUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile')

  if (!user) return null

  const tabs = [
    { id: 'profile',  label: t('settings.tabProfile'), Icon: User },
    ...(isTeacher ? [{ id: 'payment', label: t('settings.tabPayment'), Icon: CreditCard }] : []),
    { id: 'security', label: t('settings.tabSecurity'), Icon: Shield },
  ]

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('settings.title')}</h1>
          <p className="text-sm text-slate-500">{t('settings.subtitle')}</p>
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
const ROLE_KEY  = { teacher: 'settings.roleTeacher', student: 'settings.roleStudent' }

/* ═══════════════════════════════════════════════════════════
   Вкладка «Личные данные» — чистая форма, без обложек
   ═══════════════════════════════════════════════════════════ */
function PersonalTab({ user, isTeacher, updateUser }) {
  const { t } = useTranslation('teacher')
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
      toast.success(t('settings.dataSaved'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('settings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Неизменяемые данные аккаунта */}
      <Section title={t('settings.accountData')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <ReadField label={t('settings.email')} value={user.email} />
          <ReadField label={t('settings.role')} value={ROLE_KEY[user.role] ? t(ROLE_KEY[user.role]) : user.role} />
          {isTeacher && <ReadField label={t('settings.plan')} value={PLAN_NAME[user.plan] ?? user.plan} />}
          <ReadField label={t('settings.emailStatus')} value={user.emailVerified ? t('settings.verified') : t('settings.notVerified')} accent={user.emailVerified ? 'text-emerald-600' : 'text-amber-600'} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">{t('settings.emailRoleNote')}</p>
      </Section>

      {/* Изменяемые: имя, username, телефон */}
      <Section title={t('settings.nameContacts')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label={t('settings.fullName')} value={form.name} onChange={e => set({ name: e.target.value })} />
          <div>
            <Input label={t('settings.usernameLabel')} value={form.username} onChange={e => set({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} />
            <p className="text-[11px] text-slate-400 mt-1">{t('settings.usernameNote')} <span className="font-mono text-blue-600">@{form.username || '—'}</span></p>
          </div>
        </div>
        <div className="mt-3">
          <Input label={t('settings.phoneLabel')} placeholder="+48 123 456 789" value={form.phone} onChange={e => set({ phone: e.target.value })} />
        </div>
      </Section>

      {/* О себе */}
      <Section title={t('settings.about')}>
        <textarea value={form.bio} onChange={e => set({ bio: e.target.value.slice(0, 300) })} rows={3}
          placeholder={isTeacher ? t('settings.bioTeacherPh') : t('settings.bioStudentPh')}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none" />
        <div className="text-right text-[11px] text-slate-400 mt-1">{form.bio.length} / 300</div>
      </Section>

      {/* Мессенджеры */}
      <Section title={t('settings.messengers')}>
        <SocialsEditor values={{ socialTelegram: form.socialTelegram, socialWhatsApp: form.socialWhatsApp, socialLinkedIn: form.socialLinkedIn }} onChange={set} />
      </Section>

      {/* Языки */}
      <Section title={isTeacher ? t('settings.langTeacher') : t('settings.langStudent')}>
        <LanguagesEditor value={form.languages} onChange={arr => set({ languages: arr })} withLevel={!isTeacher} />
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty} loading={saving}>
          {dirty ? t('settings.saveChanges') : t('settings.noChanges')}
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
  const { t } = useTranslation('teacher')
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
      toast.success(t('settings.reqsSaved'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('settings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Подсказка */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {t('settings.payHint')}
      </div>

      {!hasAny && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('settings.noReqs')}
        </div>
      )}

      {/* IBAN / Bank Transfer */}
      <Section title={t('settings.bankTransfer')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label={t('settings.ibanLabel')} placeholder="PL61 1090 1014 0000 0712 1981 2874" value={form.iban} onChange={e => set({ iban: e.target.value })} />
          <Input label={t('settings.bicLabel')} placeholder="WBKPPLPP" value={form.bic} onChange={e => set({ bic: e.target.value })} />
        </div>
        <Input label={t('settings.bankNameLabel')} placeholder="PKO Bank Polski" value={form.bankName} onChange={e => set({ bankName: e.target.value })} className="mt-3" />
        <p className="text-[11px] text-slate-400 mt-1.5">{t('settings.bankNote')}</p>
      </Section>

      {/* BLIK */}
      <Section title={t('settings.blikTitle')}>
        <Input label={t('settings.blikPhone')} placeholder="+48 123 456 789" value={form.blik} onChange={e => set({ blik: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">{t('settings.blikNote')}</p>
      </Section>

      {/* PayPal */}
      <Section title={t('settings.paypalTitle')}>
        <Input label={t('settings.paypalLabel')} placeholder="teacher@gmail.com" value={form.paypal} onChange={e => set({ paypal: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">{t('settings.paypalNote')}</p>
      </Section>

      {/* Revolut */}
      <Section title={t('settings.revolutTitle')}>
        <Input label={t('settings.revolutLabel')} placeholder="@teacher_name" value={form.revolut} onChange={e => set({ revolut: e.target.value })} />
        <p className="text-[11px] text-slate-400 mt-1.5">{t('settings.revolutNote')}</p>
      </Section>

      {/* Своё поле */}
      <Section title={t('settings.otherTitle')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label={t('settings.otherName')} placeholder="Wise, Venmo…" value={form.customLabel} onChange={e => set({ customLabel: e.target.value })} />
          <Input label={t('settings.otherValue')} placeholder="wise.com/pay/..." value={form.customValue} onChange={e => set({ customValue: e.target.value })} />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty} loading={saving}>
          {dirty ? t('settings.saveReqs') : t('settings.noChanges')}
        </Button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Вкладка «Безопасность»
   ═══════════════════════════════════════════════════════════ */
function SecurityTab() {
  const { t } = useTranslation('teacher')
  const [form, setForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current || !form.next) return toast.error(t('settings.fillBoth'))
    if (form.next.length < 6)        return toast.error(t('settings.pwdMinChars'))
    if (form.next !== form.confirm)  return toast.error(t('settings.pwdMismatch'))
    setSaving(true)
    try {
      await changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      toast.success(t('settings.pwdChanged'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('settings.pwdError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 max-w-md">
      <h2 className="text-sm font-medium text-slate-600 mb-1">{t('settings.changePasswordTitle')}</h2>
      <Input label={t('settings.currentPwd')} type="password" value={form.current} onChange={e => set('current', e.target.value)} />
      <Input label={t('settings.newPwd')}     type="password" value={form.next}    onChange={e => set('next',    e.target.value)} />
      <Input label={t('settings.repeatPwd')}  type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
      <Button type="submit" loading={saving}>{t('settings.changePwdBtn')}</Button>
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
