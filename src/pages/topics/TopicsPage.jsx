import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Target, Plus, Trash2, ChevronRight, Lightbulb, Map } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getTopics, createTopic, deleteTopic } from '../../api/topics.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import PageContainer from '../../components/ui/PageContainer'
import IdeasModal from './IdeasModal'

// Цвет прогресса обладания темой
const masteryColor = (m) => m >= 70 ? 'bg-emerald-500' : m >= 40 ? 'bg-blue-500' : 'bg-amber-500'
const masteryText  = (m) => m >= 70 ? 'text-emerald-600' : m >= 40 ? 'text-blue-600' : 'text-amber-600'

export default function TopicsPage() {
  const { t } = useTranslation('student')
  const { data: topics, loading, reload } = useApiQuery(['topics'], getTopics)
  const [createOpen, setCreateOpen] = useState(false)
  const [ideasOpen, setIdeasOpen]   = useState(false)

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t('topics.title')}</h1>
            <p className="text-sm text-slate-500">{t('topics.subtitle')}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> {t('topics.addTopic')}</Button>
      </div>

      <button onClick={() => setIdeasOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-6 transition-colors">
        <Lightbulb className="w-4 h-4" /> {t('topics.whatToStudy')}
      </button>

      {loading ? (
        <SkeletonList />
      ) : !topics?.length ? (
        <EmptyState emoji="🎯" title={t('topics.emptyTitle')}
          text={t('topics.emptyText')}
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>{t('topics.createTrack')}</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map(t => <TopicCard key={t.id} topic={t} onDeleted={reload} />)}
        </div>
      )}

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); reload() }} />}
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
            <div className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{topic.title}</div>
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
        <Button size="sm" className="flex-1" onClick={() => navigate(`/topics/${topic.id}`)}>
          {t('topics.openTrack')} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
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

function CreateModal({ onClose, onCreated }) {
  const { t } = useTranslation('student')
  const [title, setTitle]     = useState('')
  const [subject, setSubject] = useState('')
  const [busy, setBusy]       = useState(false)

  const submit = async () => {
    if (!title.trim()) { toast.error(t('topics.enterTopic')); return }
    setBusy(true)
    try {
      await createTopic({ title, subject: subject || null })
      toast.success(t('topics.trackCreated'))
      onCreated()
    } catch (e) {
      toast.error(e.response?.data?.error || t('common:error'))
    } finally { setBusy(false) }
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
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>{t('common:cancel')}</Button>
          <Button className="flex-1" onClick={submit} loading={busy}>{t('common:create')}</Button>
        </div>
      </div>
    </Modal>
  )
}
