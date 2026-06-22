import { useState, lazy, Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import useAuth from '../../hooks/useAuth'
import useFetch from '../../hooks/useFetch'
import { getPublicProfile } from '../../api/profile.api'
import { followUser, unfollowUser } from '../../api/follow.api'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Tabs from './components/Tabs'
import LanguagesEditor from './components/LanguagesEditor'
import RequestModal from './components/RequestModal'

// Графики — тяжёлый recharts, грузим только при открытии таба «Аналитика»
const TeacherCharts = lazy(() => import('./components/TeacherCharts'))
const StudentCharts = lazy(() => import('./components/StudentCharts'))

export default function UserProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const { data: profile, loading, error } = useFetch(() => getPublicProfile(username), [username])

  // Свой профиль → редактируемая версия (избегаем двух страниц одного юзера)
  if (user?.username === username) return <Navigate to="/profile" replace />

  if (loading) return <PageSpinner />
  if (error || !profile) {
    return <EmptyState emoji="🔍" title="Профиль не найден" text="Проверьте ссылку — возможно, такого пользователя нет." />
  }

  return <ProfileView profile={profile} viewer={user} />
}

/* ═══════════════════════════════════════════════════════════
   Сам профиль (read-only)
   ═══════════════════════════════════════════════════════════ */
function ProfileView({ profile, viewer }) {
  const vc = profile.viewerContext || {}
  const isTeacher = profile.role === 'teacher'
  const viewerIsStudent = viewer?.role === 'student'

  const [following, setFollowing]       = useState(vc.isFollowing)
  const [followers, setFollowers]       = useState(profile.followersCount ?? 0)
  const [requestStatus, setRequestStatus] = useState(vc.requestStatus)
  const [modalOpen, setModalOpen]       = useState(false)
  const [tab, setTab]                   = useState('profile')
  const [busy, setBusy]                 = useState(false) // запрос follow/unfollow в полёте

  // Подписка — оптимистично (мгновенно меняем UI, откат при ошибке).
  // busy-гард: пока запрос не завершён, повторный клик игнорируется → нет гонки follow/unfollow.
  const toggleFollow = async () => {
    if (busy) return
    setBusy(true)
    const next = !following
    setFollowing(next)
    setFollowers(c => c + (next ? 1 : -1))
    try {
      next ? await followUser(profile.id) : await unfollowUser(profile.id)
    } catch {
      setFollowing(!next)
      setFollowers(c => c + (next ? -1 : 1))
      toast.error('Не удалось обновить подписку')
    } finally {
      setBusy(false)
    }
  }

  // Аналитика: у учителя публичная; у студента — только его учитель (isMyStudent)
  const showAnalytics = isTeacher || vc.isMyStudent
  const tabs = [{ id: 'profile', label: 'Профиль' }]
  if (showAnalytics) tabs.push({ id: 'analytics', label: 'Аналитика' })

  const isMyTeacher = vc.isMyTeacher || requestStatus === 'accepted'
  const contacts = buildContacts(profile)

  return (
    <div className="min-h-full pb-12">
      {/* Обложка */}
      <div className="max-w-4xl mx-auto sm:px-8 sm:pt-6">
        <div className="h-40 sm:h-52 sm:rounded-2xl overflow-hidden bg-gradient-to-br from-brand-900/40 to-pink-accent/10 border-b sm:border border-white/[0.06]">
          {profile.coverImage && <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Аватар + имя + кнопки */}
        <div className="-mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
          <Avatar url={profile.avatar} name={profile.name} />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">{profile.name}</h1>
            <p className="text-xs text-slate-400">@{profile.username}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px]">
              <span className="text-brand-300">{isTeacher ? 'Преподаватель' : 'Студент'}</span>
              <span className="text-slate-500">{followers} подписчиков</span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 pb-1">
            <Button variant={following ? 'secondary' : 'primary'} size="sm" onClick={toggleFollow} disabled={busy}>
              {following ? 'Вы подписаны' : 'Подписаться'}
            </Button>
            {isTeacher && viewerIsStudent && (
              <RequestButton status={isMyTeacher ? 'accepted' : requestStatus} onClick={() => setModalOpen(true)} />
            )}
          </div>
        </div>

        {/* Табы */}
        <div className="mt-6">
          <Tabs items={tabs} active={tab} onChange={setTab} />
          <div className="mt-6">
            {tab === 'profile' && (
              <ProfileTabContent profile={profile} contacts={contacts} />
            )}
            {tab === 'analytics' && (
              <Suspense fallback={<PageSpinner />}>
                {isTeacher
                  ? <TeacherCharts userId={profile.id} />
                  : <StudentCharts studentId={profile.id} />}
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <RequestModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          teacher={profile}
          onSent={() => setRequestStatus('pending')}
        />
      )}
    </div>
  )
}

/* ── Контент таба «Профиль» ─────────────────────────────────── */
function ProfileTabContent({ profile, contacts }) {
  return (
    <div className="space-y-5">
      {profile.bio && (
        <Card title="О себе">
          <p className="text-sm text-slate-300 whitespace-pre-line">{profile.bio}</p>
        </Card>
      )}

      <Card title={profile.role === 'teacher' ? 'Преподаёт' : 'Изучает'}>
        <LanguagesEditor value={profile.languages || []} readOnly />
      </Card>

      <Card title="Контакты">
        {contacts.length === 0
          ? <span className="text-xs text-slate-600">Контакты не указаны</span>
          : (
            <div className="flex flex-wrap gap-2">
              {contacts.map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.10] text-xs text-slate-200 hover:border-brand-400/50 transition-colors">
                  <span className="text-slate-500">{c.label}:</span> {c.value}
                </a>
              ))}
            </div>
          )}
      </Card>

      {/* Заглушка до ленты постов (§2.5.4) */}
      <Card title="Публикации">
        <p className="text-xs text-slate-600">Лента публикаций появится позже.</p>
      </Card>
    </div>
  )
}

/* ── Кнопка заявки (состояния) ──────────────────────────────── */
function RequestButton({ status, onClick }) {
  if (status === 'accepted') {
    return <Button variant="secondary" size="sm" disabled>Вы ученик</Button>
  }
  if (status === 'pending') {
    return <Button variant="secondary" size="sm" disabled>Заявка отправлена</Button>
  }
  return <Button size="sm" onClick={onClick}>Записаться на занятия</Button>
}

/* ── Мелочи ─────────────────────────────────────────────────── */
function Avatar({ url, name }) {
  return (
    <div className="w-28 h-28 rounded-full border-4 border-[#0F1629] bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center overflow-hidden shrink-0">
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover" />
        : <span className="text-white text-3xl font-semibold">{name?.[0]?.toUpperCase() ?? '?'}</span>}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <h2 className="text-sm font-medium text-slate-300 mb-3">{title}</h2>
      {children}
    </div>
  )
}

// Строим список контактов из полей профиля + правильные ссылки
function buildContacts(p) {
  const tg = (v) => `https://t.me/${String(v).replace(/^@/, '')}`
  const wa = (v) => `https://wa.me/${String(v).replace(/[^\d]/g, '')}`
  const ig = (v) => `https://instagram.com/${String(v).replace(/^@/, '')}`
  return [
    p.socialTelegram  && { label: 'Telegram',  value: p.socialTelegram,  href: tg(p.socialTelegram) },
    p.socialWhatsApp  && { label: 'WhatsApp',  value: p.socialWhatsApp,  href: wa(p.socialWhatsApp) },
    p.socialInstagram && { label: 'Instagram', value: p.socialInstagram, href: ig(p.socialInstagram) },
    p.socialLinkedIn  && { label: 'LinkedIn',  value: p.socialLinkedIn,  href: p.socialLinkedIn },
    p.phone           && { label: 'Телефон',   value: p.phone,           href: `tel:${p.phone}` },
  ].filter(Boolean)
}
