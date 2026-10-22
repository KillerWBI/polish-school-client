import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from '../../utils/toast'
import { Plus, Trash2, ChevronRight, Lightbulb, Map, Loader2 } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getTopics, createTopic, deleteTopic } from '../../api/topics.api'

// Обрыв связи при создании ≠ ошибка: сервер дорабатывает трек и сохраняет его. Ждём, пока новый трек
// с этим названием появится в списке (до 2 минут), — и только если не появился, говорим об ошибке.
const waitForNewTopic = async (title, knownIds) => {
  for (let i = 0; i < 24; i++) {
    await new Promise((ok) => setTimeout(ok, 5000))
    try {
      const list = await getTopics()
      if (list.some((x) => !knownIds.has(x.id) && x.title === title)) return true
    } catch { /* сервер ещё недоступен — пробуем дальше */ }
  }
  return false
}
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { IconTopics } from '../../components/ui/icons'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tooltip from '../../components/ui/Tooltip'
import IdeasModal from './IdeasModal'

// Цвет прогресса обладания темой
const masteryColor = (m) => m >= 70 ? 'bg-emerald-500' : m >= 40 ? 'bg-teal-500' : 'bg-amber-500'
const masteryText  = (m) => m >= 70 ? 'text-emerald-600' : m >= 40 ? 'text-teal-600' : 'text-amber-600'

export default function TopicsPage() {
  const { t } = useTranslation('student')
  const { data: topics, loading, reload } = useApiQuery(['topics'], getTopics)
  const [createOpen, setCreateOpen] = useState(false)
  const [ideasOpen, setIdeasOpen]   = useState(false)
  const [pending, setPending]       = useState([]) // треки, которые сейчас создаются: [{ key, title, subject }]

  // Модалка закрывается сразу, в списке крутится карточка «Создаём трек…», пока трек не появится
  const startCreate = async ({ title, subject }) => {
    setCreateOpen(false)
    const key = Date.now()
    setPending((p) => [...p, { key, title, subject }])
    const knownIds = new Set((topics || []).map((x) => x.id))
    try {
      await createTopic({ title, subject })
      toast.success(t('topics.trackCreated'))
    } catch (e) {
      if (e.response) toast.error(e.response.data?.error || t('common:error')) // настоящий ответ сервера: лимит, ИИ и т.п.
      else if (await waitForNewTopic(title, knownIds)) toast.success(t('topics.trackCreated'))
      else toast.error(t('topics.createLost'))
    } finally {
      setPending((p) => p.filter((x) => x.key !== key))
      reload()
    }
  }

  return (
    <PageContainer>
      <PageHeader
        className="mb-2"
        title={t('topics.title')}
        subtitle={t('topics.subtitle')}
        actions={
          <Tooltip text={t('topics.tipCreate')} side="left">
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> {t('topics.addTopic')}</Button>
          </Tooltip>
        }
      />

      <button onClick={() => setIdeasOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 mb-6 transition-colors">
        <Lightbulb className="w-4 h-4" /> {t('topics.whatToStudy')}
      </button>

      {loading ? (
        <SkeletonList />
      ) : !topics?.length && !pending.length ? (
        <EmptyState icon={IconTopics} title={t('topics.emptyTitle')}
          text={t('topics.emptyText')}
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>{t('topics.createTrack')}</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pending.map((p) => <PendingCard key={p.key} title={p.title} subject={p.subject} />)}
          {(topics || []).map(t => <TopicCard key={t.id} topic={t} onDeleted={reload} />)}
        </div>
      )}

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onSubmit={startCreate} />}
      {ideasOpen && <IdeasModal onClose={() => setIdeasOpen(false)} />}
    </PageContainer>
  )
}

function TopicCard({ topic, onDeleted }) {
  const { t } = useTranslation('student')
  const navigate = useNavigate()
  const [confirmDel, setConfirmDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const m = Math.round(topic.masteryPercent || 0)
  const steps = Array.isArray(topic.roadmap) ? topic.roadmap.length : 0

  const doDelete = async () => {
    setBusy(true)
    try { await deleteTopic(topic.id); onDeleted() }
    catch (e) { toast.error(e.response?.data?.error || t('common:error')) }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      <button onClick={() => navigate(`/topics/${topic.id}`)} className="w-full text-left group">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 truncate group-hover:text-teal-600 transition-colors">{topic.title}</div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              {topic.subject ? `${topic.subject} · ` : ''}
              <Map className="w-3 h-3" /> {steps} {t('topics.steps', { count: steps })} · {topic.attempts} {t('topics.practices', { count: topic.attempts })}
            </div>
          </div>
          <div className={`text-lg font-bold shrink-0 tabular-nums ${masteryText(m)}`}>{m}%</div>
        </div>

        <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${masteryColor(m)}`} style={{ width: `${m}%` }} />
        </div>
      </button>

      <div className="flex items-center gap-2 mt-3">
        <Tooltip text={t('topics.tipCard')} side="top" className="flex-1">
          <Button size="sm" className="w-full" onClick={() => navigate(`/topics/${topic.id}`)}>
            {t('topics.openTrack')} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Tooltip>
        <button onClick={() => setConfirmDel(true)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={doDelete}
        title={t('topics.deleteTitle')}
        message={t('topics.deleteMsg', { title: topic.title })}
        confirmLabel={t('common:delete')}
        busy={busy}
      />
    </div>
  )
}

// Трек, который сейчас создаётся: ИИ составляет план и подбирает источники
function PendingCard({ title, subject }) {
  const { t } = useTranslation('student')
  return (
    <div className="rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="w-5 h-5 mt-0.5 shrink-0 text-teal-500 animate-spin" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900 truncate">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{subject ? `${subject} · ` : ''}{t('topics.creating')}</div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">{t('topics.creatingHint')}</p>
    </div>
  )
}

function CreateModal({ onClose, onSubmit }) {
  const { t } = useTranslation('student')
  const [title, setTitle]     = useState('')
  const [subject, setSubject] = useState('')

  const submit = () => {
    if (!title.trim()) { toast.error(t('topics.enterTopic')); return }
    onSubmit({ title: title.trim(), subject: subject.trim() || null })
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('topics.newTrack')}</h3>
        <p className="text-xs text-slate-500 mb-4">{t('topics.newTrackSub')}</p>
        <div className="space-y-3">
          <Input label={t('topics.topicLabel')} value={title} onChange={e => setTitle(e.target.value)} placeholder={t('topics.topicPh')} />
          <Input label={t('topics.subjectLabel')} value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('topics.subjectPh')} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>{t('common:cancel')}</Button>
          <Button className="flex-1" onClick={submit}>{t('common:create')}</Button>
        </div>
      </div>
    </Modal>
  )
}
