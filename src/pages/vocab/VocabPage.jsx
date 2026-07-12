import { useState } from 'react'
import { toast } from 'sonner'
import { BookMarked, Plus, Check, X, Trash2 } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { getVocab, getDueVocab, addVocab, reviewVocab, deleteVocab } from '../../api/vocab.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const STATUS = {
  new:      { label: 'Новое',   cls: 'bg-slate-100 text-slate-600' },
  learning: { label: 'Учу',     cls: 'bg-amber-100 text-amber-700' },
  known:    { label: 'Знаю',    cls: 'bg-emerald-100 text-emerald-700' },
}

export default function VocabPage() {
  const [tab, setTab] = useState('review')

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Словарь</h1>
          <p className="text-sm text-slate-500">Слова, термины и понятия — карточками с повторением</p>
        </div>
      </div>

      <div className="inline-flex p-0.5 mb-6 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'review'} onClick={() => setTab('review')}>Повторить</TabBtn>
        <TabBtn active={tab === 'all'}    onClick={() => setTab('all')}>Все слова</TabBtn>
        <TabBtn active={tab === 'add'}    onClick={() => setTab('add')}>Добавить</TabBtn>
      </div>

      {tab === 'review' && <ReviewTab onEmptyAdd={() => setTab('add')} />}
      {tab === 'all'    && <AllTab />}
      {tab === 'add'    && <AddTab onAdded={() => setTab('all')} />}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

/* ── Повторение (флеш-карточки) ── */
function ReviewTab({ onEmptyAdd }) {
  const { data: due, loading, reload } = useFetch(getDueVocab)
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [done, setDone]       = useState(0)

  const answer = async (correct) => {
    const item = due[idx]
    setBusy(true)
    try {
      await reviewVocab(item.id, correct)
      setDone(d => d + 1)
      setFlipped(false)
      if (idx + 1 < due.length) setIdx(idx + 1)
      else { toast.success('Повторение завершено!'); reload(); setIdx(0); setDone(0) }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  if (loading) return <SkeletonList count={1} />
  if (!due?.length) {
    return (
      <EmptyState emoji="🎉" title="На сегодня всё повторено"
        text="Новые слова появятся здесь по расписанию. Добавьте ещё слов для изучения."
        action={<Button size="sm" onClick={onEmptyAdd}>Добавить слово</Button>} />
    )
  }

  const item = due[idx]
  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
        <span>Осталось: {due.length - idx}</span>
        <span>Пройдено: {done}</span>
      </div>

      <button onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center hover:border-slate-300 transition-colors cursor-pointer">
        <div className="text-2xl font-semibold text-slate-900">{item.word}</div>
        {flipped ? (
          <>
            <div className="w-full border-t border-slate-100 my-4" />
            <div className="text-xl text-blue-700">{item.translation}</div>
            {item.example && <div className="text-sm text-slate-400 mt-3 italic">{item.example}</div>}
          </>
        ) : (
          <div className="text-xs text-slate-400 mt-4">Нажмите, чтобы увидеть перевод</div>
        )}
      </button>

      {flipped && (
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => answer(false)} loading={busy}>
            <X className="w-4 h-4 mr-1" /> Не знаю
          </Button>
          <Button className="flex-1" onClick={() => answer(true)} loading={busy}>
            <Check className="w-4 h-4 mr-1" /> Знаю
          </Button>
        </div>
      )}
    </div>
  )
}

/* ── Все слова ── */
function AllTab() {
  const { data, loading, reload } = useFetch(() => getVocab({ limit: 200 }), [])
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const items  = data?.data ?? []
  const counts = data?.meta?.counts ?? { new: 0, learning: 0, known: 0 }

  const doDelete = async () => {
    setBusy(true)
    try {
      await deleteVocab(confirmDel.id)
      setConfirmDel(null)
      reload()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  if (loading) return <SkeletonList />
  if (!items.length) return <EmptyState emoji="📖" title="Словарь пуст" text="Добавьте первые слова во вкладке «Добавить»." />

  return (
    <div>
      {/* Прогресс по статусам */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {['new', 'learning', 'known'].map(s => (
          <div key={s} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{counts[s]}</div>
            <div className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${STATUS[s].cls}`}>{STATUS[s].label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
        {items.map(v => (
          <div key={v.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-900 truncate">{v.word}</div>
              <div className="text-sm text-slate-500 truncate">{v.translation}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS[v.status].cls}`}>{STATUS[v.status].label}</span>
            <button onClick={() => setConfirmDel(v)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title="Удалить слово?"
        message={`«${confirmDel?.word}» будет удалено из словаря.`}
        confirmLabel="Удалить"
        busy={busy}
      />
    </div>
  )
}

/* ── Добавить ── */
function AddTab({ onAdded }) {
  const [word, setWord]         = useState('')
  const [translation, setTr]    = useState('')
  const [example, setExample]   = useState('')
  const [busy, setBusy]         = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!word.trim() || !translation.trim()) { toast.error('Заполните слово и перевод'); return }
    setBusy(true)
    try {
      await addVocab({ word, translation, example: example || null })
      toast.success('Слово добавлено')
      setWord(''); setTr(''); setExample('')
      onAdded?.()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 max-w-md">
      <Input label="Слово / термин" value={word} onChange={e => setWord(e.target.value)} placeholder="слово, термин или понятие" />
      <Input label="Перевод / определение" value={translation} onChange={e => setTr(e.target.value)} placeholder="перевод или определение" />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Пример (необязательно)</label>
        <textarea value={example} onChange={e => setExample(e.target.value)} rows={2}
          placeholder="пример использования"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
      </div>
      <Button type="submit" loading={busy} className="w-full">
        <Plus className="w-4 h-4 mr-1" /> Добавить в словарь
      </Button>
    </form>
  )
}
