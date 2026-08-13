import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast, errMsg } from '../../utils/toast'
import { User, CreditCard, Shield } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { fetchMe, changePassword } from '../../api/auth.api'
import { updateMyProfile } from '../../api/profile.api'
import { getCalendarSubscription, resetCalendarSubscription } from '../../api/calendar.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import {
  IconAdd, IconEdit, IconDelete, IconNext, IconPayments, IconLocked,
  IconBank, IconBlik, IconPaypal, IconRevolut, IconWebsite,
} from '../../components/ui/icons'

import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
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
    { key: 'profile',  label: t('settings.tabProfile'), icon: User },
    ...(isTeacher ? [{ key: 'payment', label: t('settings.tabPayment'), icon: CreditCard }] : []),
    { key: 'security', label: t('settings.tabSecurity'), icon: Shield },
  ]

  return (
    <PageContainer width="form">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Tabs className="mb-6" items={tabs} value={tab} onChange={setTab} />

      <div>
        {tab === 'profile'  && <PersonalTab  user={user} isTeacher={isTeacher} updateUser={updateUser} />}
        {tab === 'payment'  && isTeacher && <PaymentMethodsTab user={user} updateUser={updateUser} />}
        {tab === 'security' && <SecurityTab />}
      </div>
    </PageContainer>
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
    currency:       user.currency       || 'PLN',
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

      {/* Валюта: в ней хранятся и считаются все суммы преподавателя */}
      <Section title={t('settings.currencyTitle')}>
        <CurrencyPicker
          value={form.currency}
          hasHistory={Boolean(user.paymentDetails)}
          onChange={(code) => set({ currency: code })}
        />
      </Section>

      {/* Подписка на календарь — уроки уезжают в Google/Apple и обновляются сами */}
      <Section title={t('settings.calTitle')}>
        <CalendarSubscription />
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

// Поле, которое нельзя изменить. Специально приглушено и с замочком —
// чтобы сразу отличалось от полей, которые редактируются. Размеры совпадают с Input.
function ReadField({ label, value, accent = 'text-slate-500' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className={`h-11 px-3.5 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 text-sm cursor-default ${accent}`}>
        <IconLocked size={13} className="text-slate-400" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Вкладка «Способы оплаты» (только учитель)
   Единый приём: список добавленного + «+» → модалка с выбором и заполнением.
   ═══════════════════════════════════════════════════════════ */

// Описание способов: какие поля хранит каждый и как показать его в списке.
// Ключи полей совпадают с тем, что лежит в user.paymentDetails — формат хранения не меняется.
const PAY_METHODS = [
  { id: 'bank',    icon: IconBank,    titleKey: 'settings.bankTransfer', noteKey: 'settings.bankNote',
    fields: [
      { name: 'iban',     labelKey: 'settings.ibanLabel',     ph: 'PL61 1090 1014 0000 0712 1981 2874', required: true },
      { name: 'bic',      labelKey: 'settings.bicLabel',      ph: 'WBKPPLPP' },
      { name: 'bankName', labelKey: 'settings.bankNameLabel', ph: 'PKO Bank Polski' },
    ] },
  { id: 'blik',    icon: IconBlik,    titleKey: 'settings.blikTitle',    noteKey: 'settings.blikNote',
    fields: [{ name: 'blik', labelKey: 'settings.blikPhone', ph: '+48 123 456 789', required: true }] },
  { id: 'paypal',  icon: IconPaypal,  titleKey: 'settings.paypalTitle',  noteKey: 'settings.paypalNote',
    fields: [{ name: 'paypal', labelKey: 'settings.paypalLabel', ph: 'teacher@gmail.com', required: true }] },
  { id: 'revolut', icon: IconRevolut, titleKey: 'settings.revolutTitle', noteKey: 'settings.revolutNote',
    fields: [{ name: 'revolut', labelKey: 'settings.revolutLabel', ph: '@teacher_name', required: true }] },
  { id: 'custom',  icon: IconWebsite, titleKey: 'settings.otherTitle',
    fields: [
      { name: 'customLabel', labelKey: 'settings.otherName',  ph: 'Wise, Venmo…',     required: true },
      { name: 'customValue', labelKey: 'settings.otherValue', ph: 'wise.com/pay/...', required: true },
    ] },
]

const isFilled = (method, data) => method.fields.some(f => (data[f.name] || '').trim())

function PaymentMethodsTab({ user, updateUser }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [details, setDetails] = useState(() => user.paymentDetails || {})
  const [editing, setEditing] = useState(null)   // способ, который добавляем/меняем
  const [picking, setPicking] = useState(false)  // открыт выбор способа
  const [removing, setRemoving] = useState(null) // способ, ждущий подтверждения удаления
  const [busy, setBusy] = useState(false)

  const added   = PAY_METHODS.filter(m => isFilled(m, details))
  const notYet  = PAY_METHODS.filter(m => !isFilled(m, details))

  // Сохраняем сразу: модалка закрылась — реквизиты уже у ученика.
  const persist = async (next, okMsg) => {
    setBusy(true)
    try {
      const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => (v || '').trim()))
      await updateMyProfile({ paymentDetails: Object.keys(clean).length ? clean : null })
      updateUser(await fetchMe())
      setDetails(clean)
      toast.success(okMsg)
      return true
    } catch (e) {
      toast.error(errMsg(e, t('settings.saveError')))
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    const next = { ...details }
    removing.fields.forEach(f => delete next[f.name])
    if (await persist(next, t('settings.payMethodRemoved'))) setRemoving(null)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {t('settings.payHint')}
      </div>

      {added.length === 0 ? (
        <EmptyState
          icon={IconPayments}
          title={t('settings.noReqsTitle')}
          text={t('settings.noReqs')}
          action={<Button size="sm" onClick={() => setPicking(true)}><IconAdd size={15} /> {t('settings.addPayMethod')}</Button>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {added.map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <m.icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{t(m.titleKey)}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {m.fields.map(f => details[f.name]).filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button onClick={() => setEditing(m)} aria-label={tc('edit')}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer">
                  <IconEdit size={16} />
                </button>
                <button onClick={() => setRemoving(m)} aria-label={tc('delete')}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                  <IconDelete size={16} />
                </button>
              </div>
            ))}
          </div>

          {notYet.length > 0 && (
            <Button variant="secondary" onClick={() => setPicking(true)}>
              <IconAdd size={15} /> {t('settings.addPayMethod')}
            </Button>
          )}
        </>
      )}

      {/* Шаг 1 — какой способ добавляем */}
      <Modal open={picking} onClose={() => setPicking(false)}
        title={t('settings.choosePayMethod')} subtitle={t('settings.choosePayMethodHint')}>
        <div className="space-y-2">
          {notYet.map(m => (
            <button key={m.id} onClick={() => { setPicking(false); setEditing(m) }}
              className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer">
              <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <m.icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">{t(m.titleKey)}</span>
                {m.noteKey && <span className="block text-xs text-slate-500">{t(m.noteKey)}</span>}
              </span>
              <IconNext size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </Modal>

      {/* Шаг 2 — заполнение полей выбранного способа */}
      {editing && (
        <PayMethodModal
          method={editing}
          details={details}
          busy={busy}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            if (await persist({ ...details, ...patch }, t('settings.payMethodSaved'))) setEditing(null)
          }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        title={t('settings.removePayMethodTitle')}
        message={removing ? t('settings.removePayMethodMsg', { method: t(removing.titleKey) }) : ''}
        confirmLabel={tc('delete')}
        busy={busy}
      />
    </div>
  )
}

// Форма одного способа оплаты. Обязательные поля проверяются на месте, без тостов.
function PayMethodModal({ method, details, busy, onClose, onSave }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [form, setForm] = useState(() =>
    Object.fromEntries(method.fields.map(f => [f.name, details[f.name] || ''])))
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    method.fields.forEach(f => { if (f.required && !form[f.name].trim()) next[f.name] = t('settings.fieldRequired') })
    setErrors(next)
    if (Object.keys(next).length) return
    onSave(Object.fromEntries(method.fields.map(f => [f.name, form[f.name].trim()])))
  }

  return (
    <Modal open onClose={onClose} title={t(method.titleKey)} subtitle={method.noteKey ? t(method.noteKey) : undefined}>
      <form onSubmit={submit} className="space-y-3">
        {method.fields.map(f => (
          <Input
            key={f.name}
            label={t(f.labelKey)}
            placeholder={f.ph}
            value={form[f.name]}
            error={errors[f.name]}
            onChange={e => setForm(s => ({ ...s, [f.name]: e.target.value }))}
          />
        ))}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
          <Button type="submit" loading={busy} className="flex-1">{tc('save')}</Button>
        </div>
      </form>
    </Modal>
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

/* ═══════════════════════════════════════════════════════════
   Выбор валюты преподавателя.

   Валюта — это ЯРЛЫК к суммам, а не пересчёт: все цены и долги хранятся числом
   без валюты, и она лишь подписывает их. Поэтому смена валюты у преподавателя,
   у которого уже есть история, не конвертирует старые суммы — 500 просто начнёт
   показываться как 500 EUR вместо 500 PLN. Молча это допускать нельзя, поэтому
   при наличии истории спрашиваем подтверждение и прямо называем последствие.
   ═══════════════════════════════════════════════════════════ */
const CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP', 'CZK', 'UAH', 'CHF', 'SEK', 'NOK', 'DKK', 'HUF', 'RON', 'BGN', 'KZT', 'GEL', 'TRY']

function CurrencyPicker({ value, hasHistory, onChange }) {
  const { t, i18n } = useTranslation('teacher')
  const [pending, setPending] = useState(null) // валюта, ждущая подтверждения

  // Intl сам знает символ и название валюты в языке интерфейса — свой справочник не нужен
  const label = (code) => {
    try {
      const name = new Intl.DisplayNames([i18n.language], { type: 'currency' }).of(code)
      return `${code} — ${name}`
    } catch { return code }
  }

  const apply = (code) => {
    if (code === value) return
    // Истории нет — менять безопасно, спрашивать не о чем
    if (!hasHistory) return onChange(code)
    setPending(code)
  }

  return (
    <>
      <div className="max-w-xs">
        <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('settings.currencyLabel')}</label>
        <select
          value={value}
          onChange={(e) => apply(e.target.value)}
          className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-blue-500">
          {CURRENCIES.map(code => <option key={code} value={code}>{label(code)}</option>)}
        </select>
        <p className="text-[11px] text-slate-400 mt-1.5">{t('settings.currencyHint')}</p>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => { onChange(pending); setPending(null) }}
        title={t('settings.currencyConfirmTitle')}
        message={t('settings.currencyConfirmText', { from: value, to: pending })}
        confirmLabel={t('settings.currencyConfirmCta')}
      />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   Подписка на календарь (.ics).

   Не «экспорт файла», а именно подписка: календарь Google/Apple сам ходит по
   ссылке раз в час и подтягивает изменения. Поэтому ссылку не скачивают, а
   отдают своему календарю один раз.

   Ссылка = секрет: за файлом приходит сервер Google, без куки, и единственная
   защита — что 48-символьный токен в пути никто не угадает. Отсюда кнопка
   «Выпустить новую»: если ссылка утекла, старая должна перестать работать.
   ═══════════════════════════════════════════════════════════ */
function CalendarSubscription() {
  const { t } = useTranslation('teacher')
  const [sub, setSub] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  // Ссылку запрашиваем по кнопке, а не при открытии страницы: запрос создаёт
  // токен, и делать это тем, кто просто зашёл в настройки, незачем.
  const load = async () => {
    setBusy(true)
    try { setSub(await getCalendarSubscription()) }
    catch (e) { toast.error(errMsg(e, t('settings.calFail'))) }
    finally { setBusy(false) }
  }

  const reset = async () => {
    setBusy(true)
    try {
      const fresh = await resetCalendarSubscription()
      setSub(s => ({ ...s, ...fresh, url: s.url.replace(s.token, fresh.token), webcalUrl: s.webcalUrl.replace(s.token, fresh.token) }))
      toast.success(t('settings.calReset'))
    } catch (e) { toast.error(errMsg(e, t('settings.calFail'))) }
    finally { setBusy(false); setConfirmReset(false) }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(sub.url); toast.success(t('settings.calCopied')) }
    catch { toast.error(t('settings.calFail')) }
  }

  if (!sub) {
    return (
      <>
        <p className="text-sm text-slate-500 mb-3">{t('settings.calIntro')}</p>
        <Button onClick={load} loading={busy}>{t('settings.calGet')}</Button>
      </>
    )
  }

  return (
    <>
      <p className="text-sm text-slate-500 mb-3">{t('settings.calReady')}</p>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* webcal:// — операционная система сама предложит добавить в календарь */}
        <a href={sub.webcalUrl} className="h-10 px-4 inline-flex items-center rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          {t('settings.calAdd')}
        </a>
        <Button variant="secondary" size="sm" onClick={copy}>{t('settings.calCopy')}</Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)} disabled={busy}>{t('settings.calNewLink')}</Button>
      </div>
      <code className="block text-[11px] text-slate-400 break-all">{sub.url}</code>
      <p className="text-[11px] text-slate-400 mt-2">{t('settings.calHint')}</p>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={reset}
        title={t('settings.calResetTitle')}
        message={t('settings.calResetText')}
        confirmLabel={t('settings.calNewLink')}
        busy={busy}
      />
    </>
  )
}
