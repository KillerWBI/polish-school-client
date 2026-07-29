import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast, errMsg } from '../../utils/toast'
import { Target, Sparkles, Share2 } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getMyStudents, getTrackInsights, generateTargetedQuiz, createStudent, getStudentOverview } from '../../api/students.api'
import { getInvitations, cancelInvitation } from '../../api/invitations.api'
import { SkeletonCards } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import {
  IconStudents, IconAdd, IconInvite, IconIndividual, IconNext, IconPending,
  IconSearch, IconInfo, IconProfile, IconGroups,
} from '../../components/ui/icons'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Tooltip from '../../components/ui/Tooltip'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'

// Ключ слабого места (тема+подтема) — для выбора чекбоксами
const spotKey = (s) => `${s.topicId}::${s.stepTitle}`

const PAGE_SIZE = 12

export default function StudentsPage() {
  const { t } = useTranslation('teacher')
  const { data: students, loading, reload } = useApiQuery(['my-students'], getMyStudents)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(null) // null | 'pick' | 'placeholder'
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students || []
    return (students || []).filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [students, search])

  // Страница не «уезжает» за пределы найденного — считаем прямо при отрисовке,
  // без сброса через эффект (он вызывал лишний повторный рендер).
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const addBtn = (
    <Tooltip text={t('students.addHint')} side="left">
      <Button size="sm" onClick={() => setAdding('pick')}>
        <IconAdd size={15} /> {t('students.addBtn')}
      </Button>
    </Tooltip>
  )

  return (
    <PageContainer>
      <PageHeader title={t('students.title')} subtitle={t('students.subtitle')} actions={addBtn} />

      <SentInvitations />

      {loading ? (
        <SkeletonCards />
      ) : !students?.length ? (
        <>
          <EmptyState icon={IconStudents} title={t('students.emptyTitle')}
            text={t('students.emptyText')} action={addBtn} />
          <HowStudentsAppear />
        </>
      ) : (
        <div>
          {/* Поиск + счётчик */}
          <div className="flex items-center gap-3 mb-4 max-w-md">
            <div className="relative flex-1">
              <IconSearch size={16} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder={t('students.searchPlaceholder')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow"
              />
            </div>
            <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
              {filtered.length}{filtered.length !== students.length && ` / ${students.length}`}
            </span>
          </div>

          {/* Ростер — сетка карточек */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              {t('students.notFound')}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {paged.map(s => <StudentCard key={s.id} s={s} />)}
              </div>
              <Pagination page={safePage} pages={pages} onChange={setPage} />
            </>
          )}

          <div className="mt-8"><HowStudentsAppear /></div>
        </div>
      )}

      {/* Шаг 1 — каким способом добавляем */}
      <Modal open={adding === 'pick'} onClose={() => setAdding(null)}
        title={t('students.addTitle')} subtitle={t('students.addHint')}>
        <div className="space-y-2">
          <AddOption
            icon={IconInvite}
            title={t('students.addByInvite')}
            hint={t('students.addByInviteHint')}
            onClick={() => { setAdding(null); navigate('/lessons') }}
          />
          <AddOption
            icon={IconIndividual}
            title={t('students.addWithoutAccount')}
            hint={t('students.addWithoutAccountHint')}
            onClick={() => setAdding('placeholder')}
          />
        </div>
      </Modal>

      {/* Шаг 2 — карточка ученика без аккаунта */}
      {adding === 'placeholder' && (
        <AddStudentModal onClose={() => setAdding(null)} onAdded={() => { setAdding(null); reload() }} />
      )}
    </PageContainer>
  )
}

function AddOption({ icon: Icon, title, hint, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer">
      <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
      <IconNext size={16} className="text-slate-300 shrink-0" />
    </button>
  )
}

/* ── Ученик без аккаунта: имя и контакт ── */
function AddStudentModal({ onClose, onAdded }) {
  const { t } = useTranslation('teacher')
  const { t: tc } = useTranslation('common')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError(t('groupDetail.enterName'))
    setSaving(true); setError('')
    try {
      await createStudent({ name: name.trim(), contact: contact.trim() || undefined })
      onAdded()
    } catch (e) {
      setError(errMsg(e, t('groupDetail.addError')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose}
      title={t('groupDetail.addPlaceholderTitle')} subtitle={t('groupDetail.placeholderHint')}>
      <form onSubmit={submit} className="space-y-3">
        <Input label={t('groupDetail.nameLabel')} value={name}
          onChange={e => { setName(e.target.value); setError('') }} error={error} />
        <Input label={t('groupDetail.contactLabel')} value={contact}
          onChange={e => setContact(e.target.value)} placeholder={t('groupDetail.contactPlaceholder')} />
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{tc('cancel')}</Button>
          <Button type="submit" loading={saving} className="flex-1">{t('groupDetail.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Отправленные приглашения: видно, кто ещё не ответил, и можно отозвать ── */
function SentInvitations() {
  const { t } = useTranslation('teacher')
  const { data: invites, reload } = useApiQuery(['invitations', 'sent'], () => getInvitations('pending'))
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!invites?.length) return null

  const doCancel = async () => {
    setBusy(true)
    try {
      await cancelInvitation(cancelling.id)
      toast.success(t('invites.cancelled'))
      setCancelling(null)
      reload()
    } catch (e) {
      toast.error(errMsg(e, t('common:error')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
      <h2 className="text-sm font-semibold text-blue-800">{t('invites.title')}</h2>
      <p className="text-xs text-blue-700/80 mt-0.5 mb-3">{t('invites.subtitle')}</p>

      <div className="space-y-2">
        {invites.map(inv => (
          <div key={inv.id} className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2.5">
            <Avatar url={inv.invitee?.avatar} name={inv.invitee?.name} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-slate-900 truncate">{inv.invitee?.name}</div>
              <div className="text-xs text-slate-400 truncate">
                {inv.invitee?.username && `@${inv.invitee.username} · `}
                {t('invites.toGroup', { group: inv.Group?.name ?? '—' })}
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <IconPending size={11} /> {t('invites.pending')}
            </span>
            <Button size="sm" variant="secondary" onClick={() => setCancelling(inv)}>
              {t('invites.cancel')}
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={doCancel}
        title={t('invites.cancelTitle')}
        message={cancelling ? t('invites.cancelMsg', { name: cancelling.invitee?.name ?? '' }) : ''}
        confirmLabel={t('invites.cancel')}
        busy={busy}
      />
    </div>
  )
}

/* ── Откуда на этой странице берутся ученики ── */
function HowStudentsAppear() {
  const { t } = useTranslation('teacher')
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
        <IconInfo size={15} className="text-slate-400" /> {t('students.howTitle')}
      </h2>
      <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
        <p>{t('students.howInvited')}</p>
        <p>{t('students.howIndividual')}</p>
        <p>{t('students.howManual')}</p>
        <p className="text-slate-500">{t('students.howScope')}</p>
      </div>
    </div>
  )
}

function StudentCard({ s }) {
  const { t } = useTranslation('teacher')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <Avatar url={s.avatar} name={s.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 truncate">{s.name}</span>
            {s.isPlaceholder && (
              <Tooltip text={t('students.tipPlaceholder')} side="top">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0 cursor-help">
                  {t('students.placeholder')}
                </span>
              </Tooltip>
            )}
          </div>
          {s.username && <div className="text-xs text-slate-400 truncate">@{s.username}</div>}
          {(s.email || s.contact) && (
            <div className="text-xs text-slate-500 truncate mt-0.5">{s.email || s.contact}</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button onClick={() => setCardOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
          <IconProfile size={14} /> {t('students.openCard')}
        </button>

        {/* Слабые места из самообучения — только у тех, кто занимается в приложении */}
        {!s.isPlaceholder && (
          <Tooltip text={t('students.tipWeakSpots')} side="top">
            <button onClick={() => setInsightsOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
              <Target className="w-3.5 h-3.5" /> {t('students.weakBtn')}
            </button>
          </Tooltip>
        )}
      </div>

      {cardOpen && <StudentOverviewModal student={s} onClose={() => setCardOpen(false)} />}
      {insightsOpen && <WeakSpotsModal student={s} onClose={() => setInsightsOpen(false)} />}
    </div>
  )
}

/* ── Карточка ученика: всё, что связано с этим учителем ── */
function StudentOverviewModal({ student, onClose }) {
  const { t, i18n } = useTranslation('teacher')
  const { data, loading, error } = useApiQuery(
    ['student-overview', student.id],
    (signal) => getStudentOverview(student.id, signal),
  )

  const fmtMoney = (n) => `${Math.round(Number(n) || 0)} zł`
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const noLessons = data && data.attendance.total === 0 && data.homework.assigned === 0

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title={student.name}
      subtitle={data ? t('students.cardSince', { date: fmtDate(data.since) }) : undefined}>
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">{t('common:loading')}</div>
      ) : error || !data ? (
        <div className="py-16 text-center text-sm text-red-600">{t('students.loadError')}</div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto -mx-1 px-1">
          {/* Кто это */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {data.username && <Chip>@{data.username}</Chip>}
            {data.email && <Chip>{data.email}</Chip>}
            {data.contact && <Chip>{t('students.cardContact')}: {data.contact}</Chip>}
            {data.isPlaceholder && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {t('students.placeholder')}
              </span>
            )}
          </div>

          {noLessons ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {t('students.cardNoData')}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label={t('students.cardAttendance')} value={`${data.attendance.percent}%`}
                hint={t('students.cardAttendanceValue', { present: data.attendance.present, total: data.attendance.total })} />
              <Stat label={t('students.cardHomework')} value={`${data.homework.submitted}/${data.homework.assigned}`}
                hint={t('students.cardHomeworkValue', { submitted: data.homework.submitted, assigned: data.homework.assigned })} />
              <Stat label={t('students.cardAvgGrade')} value={data.homework.graded ? data.homework.avgGrade : '—'} />
              <Stat label={t('students.cardDebt')} value={fmtMoney(data.finance.debt)}
                accent={data.finance.debt > 0 ? 'text-amber-600' : 'text-emerald-600'} />
            </div>
          )}

          {/* Где занимается */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('students.cardGroups')}</h4>
              {data.groups.length ? (
                <ul className="space-y-1.5">
                  {data.groups.map(g => (
                    <li key={g.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <IconGroups size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{g.name}</span>
                      <span className="ml-auto text-xs text-slate-400 shrink-0">{fmtMoney(g.pricePerLesson)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-400">{t('students.cardNoGroups')}</p>}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('students.cardCourses')}</h4>
              {data.courses.length ? (
                <ul className="space-y-1.5">
                  {data.courses.map(c => (
                    <li key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <IconIndividual size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{c.name || student.name}</span>
                      <span className="ml-auto text-xs text-slate-400 shrink-0">{fmtMoney(c.pricePerLesson)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-400">{t('students.cardNoCourses')}</p>}
            </div>
          </div>

          {/* Деньги */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">{t('students.cardCharged')}: <span className="text-slate-900 font-medium">{fmtMoney(data.finance.charged)}</span></span>
            <span className="text-slate-500">{t('students.cardPaid')}: <span className="text-emerald-600 font-medium">{fmtMoney(data.finance.paid)}</span></span>
            <span className="text-slate-500">{t('students.cardDebt')}: <span className="text-amber-600 font-medium">{fmtMoney(data.finance.debt)}</span></span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{t('students.cardScopeNote')}</p>
        </div>
      )}
    </Modal>
  )
}

function Chip({ children }) {
  return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-full">{children}</span>
}

function Stat({ label, value, hint, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-semibold mt-0.5 tabular-nums ${accent}`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  )
}

/* ── Слабые места ученика (из расшаренных треков) + генерация адресного теста ── */
function WeakSpotsModal({ student, onClose }) {
  const { t } = useTranslation('teacher')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [gen, setGen]         = useState(false)
  const [quiz, setQuiz]       = useState(null)

  useEffect(() => {
    let alive = true
    getTrackInsights(student.id)
      .then((d) => { if (alive) { setData(d); setSelected(new Set((d.spots || []).map(spotKey))) } })
      .catch((e) => { if (alive) toast.error(e.response?.data?.error || t('students.loadError')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [student.id])

  const spots = data?.spots || []
  const meta  = data?.meta || {}
  const toggle = (s) => setSelected((prev) => {
    const n = new Set(prev); const k = spotKey(s); n.has(k) ? n.delete(k) : n.add(k); return n
  })
  const chosen = spots.filter((s) => selected.has(spotKey(s)))

  const generate = async () => {
    setGen(true)
    try {
      const q = await generateTargetedQuiz(student.id, chosen.map((s) => ({ topicId: s.topicId, stepTitle: s.stepTitle })))
      setQuiz(q)
      toast.success(t('students.quizCreated'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('students.quizFail'))
    } finally { setGen(false) }
  }

  const barColor = (m) => m >= 40 ? 'bg-blue-500' : 'bg-amber-500'

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> {t('students.weakTitle')} · {student.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4">{t('students.weakSub')}</p>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">{t('common:loading')}</div>
        ) : quiz ? (
          <div className="text-center py-6">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">{t('students.quizReadyTitle')}</p>
            <p className="text-xs text-slate-500 mb-4">{t('students.quizReadyText', { topic: quiz.topic, n: quiz.questions?.length || 0 })}</p>
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 text-left">
              {t('students.quizReadyHint')}
            </p>
            <Button variant="secondary" className="w-full" onClick={onClose}>{t('common:close')}</Button>
          </div>
        ) : !meta.sharing ? (
          <div className="text-center py-8">
            <Share2 className="w-6 h-6 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {meta.totalTracks > 0
                ? t('students.notSharedTracks', { n: meta.totalTracks })
                : t('students.noTracks')}
            </p>
            <p className="text-xs text-slate-400 mt-2">{t('students.shareHint')}</p>
          </div>
        ) : !spots.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600">{t('students.noWeak', { n: meta.sharedCount })}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[46vh] overflow-y-auto -mx-1 px-1 mb-4">
              {spots.map((s) => {
                const k = spotKey(s)
                return (
                  <label key={k} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-blue-300 transition-colors">
                    <input type="checkbox" checked={selected.has(k)} onChange={() => toggle(s)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-900 truncate">{s.stepTitle}</div>
                      <div className="text-xs text-slate-400 truncate">{s.topicTitle}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(s.mastery)}`} style={{ width: `${s.mastery}%` }} />
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-600 shrink-0 tabular-nums">{s.mastery}%</div>
                  </label>
                )
              })}
            </div>
            <Button className="w-full" onClick={generate} loading={gen} disabled={!chosen.length}>
              <Sparkles className="w-4 h-4 mr-1" /> {t('students.generateBtn')}{chosen.length ? ` (${chosen.length})` : ''}
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

function Avatar({ url, name }) {
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  )
}
