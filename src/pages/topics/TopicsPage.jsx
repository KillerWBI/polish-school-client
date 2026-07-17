import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Target, Plus, Trash2, ChevronRight, Lightbulb, Map } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
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
  const { data: topics, loading, reload } = useFetch(getTopics)
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
            <h1 className="text-2xl font-semibold text-slate-900">Учебные треки</h1>
            <p className="text-sm text-slate-500">Самообучение по любой теме — с роадмапом и адаптивными тестами</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> Тема</Button>
      </div>

      <button onClick={() => setIdeasOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-6 transition-colors">
        <Lightbulb className="w-4 h-4" /> Что можно изучать?
      </button>

      {loading ? (
        <SkeletonList />
      ) : !topics?.length ? (
        <EmptyState emoji="🎯" title="Треков пока нет"
          text="Добавьте тему по любому предмету — платформа разобьёт её на шаги и подберёт тесты под ваш уровень."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Создать трек</Button>} />
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
  const navigate = useNavigate()
  const [confirmDel, setConfirmDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const m = Math.round(topic.masteryPercent || 0)
  const steps = Array.isArray(topic.roadmap) ? topic.roadmap.length : 0

  const doDelete = async () => {
    setBusy(true)
    try { await deleteTopic(topic.id); onDeleted() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
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
              <Map className="w-3 h-3" /> {steps} {plural(steps, 'шаг', 'шага', 'шагов')} · {topic.attempts} практик
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
          Открыть трек <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <button onClick={() => setConfirmDel(true)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={doDelete}
        title="Удалить тему?"
        message={`«${topic.title}» и вся история практик будут удалены.`}
        confirmLabel="Удалить"
        busy={busy}
      />
    </div>
  )
}

function CreateModal({ onClose, onCreated }) {
  const [title, setTitle]     = useState('')
  const [subject, setSubject] = useState('')
  const [busy, setBusy]       = useState(false)

  const submit = async () => {
    if (!title.trim()) { toast.error('Укажите тему'); return }
    setBusy(true)
    try {
      await createTopic({ title, subject: subject || null })
      toast.success('Трек создан')
      onCreated()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Новый учебный трек</h3>
        <p className="text-xs text-slate-500 mb-4">Разобьём тему на шаги и подберём тесты под ваш уровень.</p>
        <div className="space-y-3">
          <Input label="Тема" value={title} onChange={e => setTitle(e.target.value)} placeholder="напр. Present Perfect, Дроби, Клеточное дыхание" />
          <Input label="Предмет (необязательно)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="английский, математика, биология…" />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>Отмена</Button>
          <Button className="flex-1" onClick={submit} loading={busy}>Создать</Button>
        </div>
      </div>
    </Modal>
  )
}

// Русская плюрализация числительных
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}
