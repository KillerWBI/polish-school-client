import { useState, useMemo, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import useAuth from '../../hooks/useAuth'
import { fetchMe, changePassword } from '../../api/auth.api'
import { updateMyProfile } from '../../api/profile.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

import Tabs              from './components/Tabs'
import AvatarUpload      from './components/AvatarUpload'
import CoverUpload       from './components/CoverUpload'
import LanguagesEditor   from './components/LanguagesEditor'
import SocialsEditor     from './components/SocialsEditor'

// Recharts (большая зависимость) — грузим только когда открыли таб «Аналитика».
// Это снижает initial bundle и изолирует возможные ошибки recharts от остального UI.
const TeacherCharts = lazy(() => import('./components/TeacherCharts'))
const StudentCharts = lazy(() => import('./components/StudentCharts'))

/* ═══════════════════════════════════════════════════════════
   Главный компонент
   ═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { t } = useTranslation('teacher')
  const { user, isTeacher, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')

  if (!user) return null

  return (
    <div className="min-h-full pb-12">
      <ProfileHeader user={user} isTeacher={isTeacher} updateUser={updateUser} />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 mt-6">
        <Tabs
          items={[
            { id: 'profile',   label: t('profile.tabProfile')    },
            { id: 'analytics', label: t('profile.tabAnalytics')  },
            { id: 'security',  label: t('profile.tabSecurity')},
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="mt-6">
          {tab === 'profile'   && <ProfileTab user={user} isTeacher={isTeacher} updateUser={updateUser} />}
          {tab === 'analytics' && <AnalyticsTab user={user} isTeacher={isTeacher} />}
          {tab === 'security'  && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Header: обложка + аватар + имя + статы
   ═══════════════════════════════════════════════════════════
   Загрузки avatar/cover — мгновенно отправляются на бэк (не дожидаясь
   нажатия «Сохранить»), потому что это атомарные действия.
*/
function ProfileHeader({ user, isTeacher, updateUser }) {
  const { t } = useTranslation('teacher')
  const handleAvatar = async (url) => {
    try {
      const updated = await updateMyProfile({ avatar: url })
      updateUser({ avatar: updated.avatar })
      toast.success(t('profile.avatarUpdated'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('profile.uploadError'))
    }
  }

  const handleCover = async (url) => {
    try {
      const updated = await updateMyProfile({ coverImage: url })
      updateUser({ coverImage: updated.coverImage })
      toast.success(t('profile.coverUpdated'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('profile.uploadError'))
    }
  }

  return (
    <div className="relative max-w-4xl mx-auto px-0 sm:px-8 pt-0 sm:pt-6">
      <CoverUpload url={user.coverImage} editable onChange={handleCover} />

      {/* Аватар наезжает на обложку. negative margin top */}
      <div className="px-5 sm:px-0 -mt-16 sm:-mt-20 flex items-end gap-4">
        <AvatarUpload url={user.avatar} name={user.name} editable onChange={handleAvatar} size={120} />
        <div className="pb-3 flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">{user.name}</h1>
          <p className="text-xs text-slate-400">@{user.username}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">{isTeacher ? t('settings.roleTeacher') : t('settings.roleStudent')}</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Таб «Профиль» — редактирование bio/socials/languages/username/name
   ═══════════════════════════════════════════════════════════
   Логика:
   - Состояние формы локальное (form). Меняется без удара по бэку.
   - Кнопка «Сохранить» активна только если есть изменения (dirty).
   - При успешном сохранении — обновляем глобальный user через updateUser.
*/
function ProfileTab({ user, isTeacher, updateUser }) {
  const { t } = useTranslation('teacher')
  const initial = useMemo(() => ({
    name:           user.name           || '',
    username:       user.username       || '',
    bio:            user.bio            || '',
    socialTelegram: user.socialTelegram || '',
    socialWhatsApp: user.socialWhatsApp || '',
    socialLinkedIn: user.socialLinkedIn || '',
    languages:      user.languages      || [],
  }), [user])

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  // Профиль «грязный» если хоть одно поле отличается от изначального.
  // JSON.stringify — простой способ глубокого сравнения, для маленького объекта это ок.
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMyProfile(form)
      // Подтягиваем свежий /auth/me чтобы синхронизировать ВСЕ поля (avatar, coverImage и тд)
      const fresh = await fetchMe()
      updateUser(fresh)
      toast.success(t('profile.profileSaved'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('settings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  // Прогресс заполнения — сколько из 7 полей заполнено
  const completed = [
    user.avatar, user.coverImage, user.bio,
    user.socialTelegram || user.socialWhatsApp || user.socialLinkedIn,
    user.languages?.length > 0,
    user.username,
    user.name,
  ].filter(Boolean).length
  const completionPercent = Math.round((completed / 7) * 100)

  return (
    <div className="space-y-6">
      {/* Прогресс заполнения */}
      <CompletionBar percent={completionPercent} />

      {/* Имя + username */}
      <Section title={t('profile.main')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label={t('profile.nameLabel')} value={form.name}     onChange={e => set({ name: e.target.value })} />
          <Input label={t('profile.usernameLabel')} value={form.username} onChange={e => set({ username: e.target.value.toLowerCase() })} />
        </div>
        <p className="text-[11px] text-slate-600 mt-2">
          {t('profile.usernameNote')} <code className="text-blue-600">@{form.username || t('profile.usernamePlaceholder')}</code>
        </p>
      </Section>

      {/* Bio */}
      <Section title={t('profile.about')}>
        <textarea
          value={form.bio}
          onChange={e => set({ bio: e.target.value.slice(0, 300) })}
          rows={4}
          placeholder={t('profile.bioPlaceholder')}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
        />
        <div className="text-right text-[11px] text-slate-600 mt-1">{form.bio.length} / 300</div>
      </Section>

      {/* Соцсети */}
      <Section title={t('profile.contacts')}>
        <SocialsEditor
          values={{
            socialTelegram: form.socialTelegram,
            socialWhatsApp: form.socialWhatsApp,
            socialLinkedIn: form.socialLinkedIn,
          }}
          onChange={(v) => set(v)}
        />
      </Section>

      {/* Языки */}
      <Section title={isTeacher ? t('profile.iTeach') : t('profile.iLearn')}>
        <LanguagesEditor
          value={form.languages}
          onChange={(arr) => set({ languages: arr })}
          withLevel={!isTeacher}
        />
      </Section>

      {/* Sticky-кнопка сохранить */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={!dirty} loading={saving}>
          {dirty ? t('settings.saveChanges') : t('settings.noChanges')}
        </Button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Таб «Аналитика» — для teacher: TeacherCharts, для student: StudentCharts
   ═══════════════════════════════════════════════════════════ */
function AnalyticsTab({ user, isTeacher }) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {isTeacher
        ? <TeacherCharts userId={user.id} />
        : <StudentCharts studentId={user.id} />}
    </Suspense>
  )
}

/* ═══════════════════════════════════════════════════════════
   Таб «Безопасность» — смена пароля (вынесли из старого ProfilePage)
   ═══════════════════════════════════════════════════════════ */
function SecurityTab() {
  const { t } = useTranslation('teacher')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
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
      <h2 className="text-sm font-medium text-slate-600">{t('settings.changePasswordTitle')}</h2>
      <Input label={t('settings.currentPwd')} type="password" value={form.current} onChange={e => set('current', e.target.value)} />
      <Input label={t('settings.newPwd')}     type="password" value={form.next}    onChange={e => set('next',    e.target.value)} />
      <Input label={t('settings.repeatPwd')}  type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
      <Button type="submit" loading={saving}>{t('settings.changePwdBtn')}</Button>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════════
   Вспомогательные мелочи
   ═══════════════════════════════════════════════════════════ */
function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-medium text-slate-600 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function CompletionBar({ percent }) {
  const { t } = useTranslation('teacher')
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-slate-600">{t('profile.completionTitle')}</h2>
        <span className="text-sm font-semibold text-slate-900">{percent}%</span>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent < 100 && (
        <p className="text-[11px] text-slate-500 mt-2">
          {t('profile.completionHint')}
        </p>
      )}
    </div>
  )
}
