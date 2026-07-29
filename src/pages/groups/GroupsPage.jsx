import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useApiQuery from '../../hooks/useApiQuery'
import useAuth from '../../hooks/useAuth'
import { getGroups, createGroup, generateLessons } from '../../api/groups.api'
import { getInvitations, respondInvitation } from '../../api/invitations.api'
import { toast } from '../../utils/toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { SkeletonCards } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { IconGroups, IconAdd, IconNext, IconDelete, IconCalendar, IconMoney } from '../../components/ui/icons'
import Pagination from '../../components/ui/Pagination'
import Tooltip from '../../components/ui/Tooltip'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'

const PAGE_SIZE = 12

// value = номер дня (0=Вс..6=Сб); порядок отображения Пн→Вс
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]

// embedded — страница показана вкладкой внутри «Занятий», свою шапку не рисует.
export default function GroupsPage({ embedded = false }) {
  const navigate = useNavigate()
  const { t } = useTranslation('teacher')
  const { isTeacher } = useAuth()
  const { data: groups, loading, reload } = useApiQuery(['groups'], getGroups)
  const [modal, setModal] = useState(false)
  const [page, setPage] = useState(1)

  const pages = Math.ceil((groups?.length || 0) / PAGE_SIZE)
  const paged = useMemo(
    () => (groups || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [groups, page]
  )

  const createBtn = isTeacher && (
    <Tooltip text={t('groups.tipCreate')} side="left">
      <Button size="sm" onClick={() => setModal(true)}>
        <IconAdd size={15} /> {t('groups.createBtn')}
      </Button>
    </Tooltip>
  )

  const body = (
    <>
      {!isTeacher && <StudentInvitations onAccepted={reload} />}

      {loading ? <SkeletonCards /> : (
        !groups?.length ? (
          <EmptyState
            icon={IconGroups}
            title={isTeacher ? t('groups.emptyTeacherTitle') : t('groups.emptyStudentTitle')}
            text={isTeacher ? t('groups.emptyTeacherText') : t('groups.emptyStudentText')}
            action={isTeacher
              ? <Button size="sm" onClick={() => setModal(true)}>{t('groups.createShort')}</Button>
              : null}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paged.map(g => (
                <GroupCard key={g.id} group={g} onClick={() => navigate(`/groups/${g.id}`)} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )
      )}

      {isTeacher && (
        <CreateGroupModal open={modal} onClose={() => setModal(false)} onCreated={reload} />
      )}
    </>
  )

  if (embedded) return <div className="space-y-4"><div className="flex justify-end">{createBtn}</div>{body}</div>

  return (
    <PageContainer>
      <PageHeader
        title={isTeacher ? t('groups.titleTeacher') : t('groups.titleStudent')}
        subtitle={isTeacher ? t('groups.subtitleTeacher') : t('groups.subtitleStudent')}
        actions={createBtn}
      />
      {body}
    </PageContainer>
  )
}

/* ── Входящие приглашения ученика (C3) ─────────────────────── */
function StudentInvitations({ onAccepted }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const { data: invites, loading, reload } = useApiQuery(['invitations', 'pending'], () => getInvitations('pending'))
  const [busy, setBusy] = useState(null) // id обрабатываемого приглашения

  const respond = async (inv, status) => {
    setBusy(inv.id)
    try {
      await respondInvitation(inv.id, status)
      toast.success(status === 'accepted' ? t('groups.joinedToast') : t('groups.declinedToast'))
      reload()
      if (status === 'accepted') onAccepted() // обновляем список групп — появится новая
    } catch (e) {
      toast.error(e.response?.data?.error || tc('error'))
      setBusy(null)
    }
  }

  if (loading || !invites?.length) return null

  return (
    <div className="mb-6 p-4 rounded-2xl border border-blue-200 bg-blue-600/10">
      <h2 className="text-sm font-semibold text-blue-600 mb-3">
        {t('groups.invitesTitle', { n: invites.length })}
      </h2>
      <div className="space-y-2">
        {invites.map(inv => (
          <div key={inv.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-900 truncate">
                <span className="font-medium">{inv.Group?.name || t('groups.groupFallback')}</span>
              </div>
              <div className="text-xs text-slate-400 truncate">
                {t('groups.from')} {inv.teacher?.name || t('groups.teacherFallback')}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="secondary" loading={busy === inv.id}
                onClick={() => respond(inv, 'declined')}>{t('groups.decline')}</Button>
              <Button size="sm" loading={busy === inv.id}
                onClick={() => respond(inv, 'accepted')}>{t('groups.accept')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupCard({ group, onClick }) {
  const { t } = useTranslation('teacher')
  const weekdays = t('groups.weekdays', { returnObjects: true })
  const schedule = (group.schedule || [])
    .map(s => `${weekdays[s.day] ?? ''} ${s.time}`)
    .join(', ')

  return (
    <Tooltip text={t('groups.tipCard')} side="top" className="w-full">
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
          {group.name}
        </h3>
        <IconNext size={16} className="text-slate-400 group-hover:text-blue-700 mt-0.5" />
      </div>
      {schedule && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <IconCalendar size={13} className="text-slate-400" /> {schedule}
        </p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <IconMoney size={13} className="text-slate-400" /> {group.pricePerLesson} {t('groups.perLesson')}
      </p>
    </button>
    </Tooltip>
  )
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const weekdays = t('groups.weekdays', { returnObjects: true })
  const [form, setForm]       = useState({ name: '', pricePerLesson: '', lessonLink: '', chatLink: '' })
  const [schedule, setSchedule] = useState([]) // [{day, time}]
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSlot = () => setSchedule(s => [...s, { day: 1, time: '18:00' }])
  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) =>
    setSchedule(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: key === 'day' ? Number(val) : val } : sl))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError(t('groups.enterName'))
    setSaving(true)
    setError('')
    try {
      const newGroup = await createGroup({
        name: form.name.trim(),
        schedule,
        lessonLink: form.lessonLink.trim() || null,
        chatLink: form.chatLink.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || 0,
      })

      // Если задано расписание — автоматически генерируем уроки на 3 месяца вперёд
      if (schedule.length > 0 && newGroup?.id) {
        const today = new Date().toISOString().slice(0, 10)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 3)
        const to = endDate.toISOString().slice(0, 10)
        await generateLessons(newGroup.id, today, to)
      }

      onCreated()
      onClose()
      setForm({ name: '', pricePerLesson: '', lessonLink: '', chatLink: '' })
      setSchedule([])
    } catch (e) {
      setError(e.response?.data?.error || t('groups.createError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md" title={t('groups.modalTitle')}>
      <div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label={t('groups.fName')} value={form.name}
            onChange={e => set('name', e.target.value)} />
          <Input label={t('groups.fPrice')} type="number" value={form.pricePerLesson}
            onChange={e => set('pricePerLesson', e.target.value)} />
          <Input label={t('groups.fLessonLink')} value={form.lessonLink}
            onChange={e => set('lessonLink', e.target.value)} />
          <Input label={t('groups.fChatLink')} value={form.chatLink}
            onChange={e => set('chatLink', e.target.value)} />

          {/* Расписание */}
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs font-medium text-slate-600">{t('groups.scheduleLabel')}</span>
              <button type="button" onClick={addSlot}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer shrink-0">
                <IconAdd size={13} /> {t('groups.addSlot')}
              </button>
            </div>
            <div className="space-y-2">
              {schedule.map((sl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={sl.day}
                    onChange={e => updateSlot(i, 'day', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
                  >
                    {DAY_VALUES.map(v => <option key={v} value={v}>{weekdays[v]}</option>)}
                  </select>
                  <input
                    type="time"
                    value={sl.time}
                    onChange={e => updateSlot(i, 'time', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500"
                  />
                  <button type="button" onClick={() => removeSlot(i)} aria-label={tc('delete')}
                    className="text-slate-400 hover:text-red-600 cursor-pointer p-1.5">
                    <IconDelete size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{tc('create')}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
