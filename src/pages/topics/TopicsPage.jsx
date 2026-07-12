import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Target, Plus, Trash2, ArrowLeft, Sparkles } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { getTopics, createTopic, deleteTopic, nextTopicQuiz, submitTopicAttempt } from '../../api/topics.api'
import QuizRunner from '../quiz/QuizRunner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const DIFF = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }

// Цвет прогресса обладания темой
const masteryColor = (m) => m >= 70 ? 'bg-emerald-500' : m >= 40 ? 'bg-blue-500' : 'bg-amber-500'
const masteryText  = (m) => m >= 70 ? 'text-emerald-600' : m >= 40 ? 'text-blue-600' : 'text-amber-600'

export default function TopicsPage() {
  const { data: topics, loading, reload } = useFetch(getTopics)
  const [createOpen, setCreateOpen] = useState(false)
  const [practice, setPractice]     = useState(null) // тема, которую практикуем

  if (practice) {
    return <Practice topic={practice} onExit={() => { setPractice(null); reload() }} />
  }

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Мои темы</h1>
            <p className="text-sm text-slate-500">Практика тестами по любой теме — с ростом уровня</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> Тема</Button>
      </div>

      {loading ? (
        <SkeletonList />
      ) : !topics?.length ? (
        <EmptyState emoji="🎯" title="Тем пока нет"
          text="Добавьте тему по любому предмету — и практикуйтесь тестами, которые подстраиваются под ваш уровень."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Добавить тему</Button>} />
      ) : (
        <div className="space-y-3">
          {topics.map(t => <TopicCard key={t.id} topic={t} onPractice={() => setPractice(t)} onDeleted={reload} />)}
        </div>
      )}

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); reload() }} />}
    </div>
  )
}

function TopicCard({ topic, onPractice, onDeleted }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const m = Math.round(topic.masteryPercent || 0)

  const doDelete = async () => {
    setBusy(true)
    try { await deleteTopic(topic.id); onDeleted() }
    catch (e) { toast.error(e.response?.data?.error || 'Ошибка') }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900 truncate">{topic.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {topic.subject ? `${topic.subject} · ` : ''}{topic.attempts} практик
          </div>
        </div>
        <div className={`text-lg font-bold shrink-0 tabular-nums ${masteryText(m)}`}>{m}%</div>
      </div>

      {/* Прогресс обладания */}
      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${masteryColor(m)}`} style={{ width: `${m}%` }} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" className="flex-1" onClick={onPractice}>
          <Sparkles className="w-4 h-4 mr-1" /> Практика
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
      toast.success('Тема добавлена')
      onCreated()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Новая тема</h3>
        <div className="space-y-3">
          <Input label="Тема" value={title} onChange={e => setTitle(e.target.value)} placeholder="напр. Present Perfect, Дроби, Клеточное дыхание" />
          <Input label="Предмет (необязательно)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="английский, математика, биология…" />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>Отмена</Button>
          <Button className="flex-1" onClick={submit} loading={busy}>Добавить</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Практика по теме ── */
function Practice({ topic, onExit }) {
  const [quiz, setQuiz]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [mastery, setMastery] = useState(topic.masteryPercent || 0)
  const [runKey, setRunKey]   = useState(0) // сброс QuizRunner при новом тесте

  const load = useCallback(async () => {
    setLoading(true); setQuiz(null)
    try {
      const q = await nextTopicQuiz(topic.id)
      setQuiz(q); setRunKey(k => k + 1)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Не удалось сгенерировать тест')
    } finally { setLoading(false) }
  }, [topic.id])

  // Генерируем первый тест при входе
  useEffect(() => { load() }, [load])

  const onCheck = async (answers, score, total) => {
    if (score == null || total == null) return
    try {
      const updated = await submitTopicAttempt(topic.id, {
        questions: quiz.questions, answers, score, total, difficulty: quiz.difficulty,
      })
      setMastery(updated.masteryPercent)
      toast.success(`Результат: ${score}/${total} · обладание ${Math.round(updated.masteryPercent)}%`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка сохранения результата')
    }
  }

  const m = Math.round(mastery)

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <button onClick={onExit} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> К темам
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">{topic.title}</h1>
        <span className={`text-lg font-bold ${masteryText(m)}`}>{m}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${masteryColor(m)}`} style={{ width: `${m}%` }} />
      </div>
      {quiz && <p className="text-xs text-slate-400 mb-5">Сложность: {DIFF[quiz.difficulty] ?? quiz.difficulty} · тест подстраивается под ваш уровень</p>}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-blue-400 animate-pulse" />
          Генерируем тест по теме…
        </div>
      ) : quiz ? (
        <>
          <QuizRunner key={runKey} quiz={quiz} onCheck={onCheck} />
          <div className="flex gap-2 mt-5">
            <Button variant="secondary" className="flex-1" onClick={onExit}>Готово</Button>
            <Button className="flex-1" onClick={load}><Sparkles className="w-4 h-4 mr-1" /> Ещё тест</Button>
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-500 mb-4">Не удалось сгенерировать тест.</p>
          <Button onClick={load}>Повторить</Button>
        </div>
      )}
    </div>
  )
}
