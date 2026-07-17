import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import { getSession, reviewItem, getWeakSpots } from '../../api/study.api'
import CardReview from '../topics/CardReview'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import PageContainer from '../../components/ui/PageContainer'
import { CalendarCheck, Layers, BookMarked, AlertTriangle, ChevronRight } from 'lucide-react'

const weakColor = (m) => m >= 40 ? 'text-blue-600' : 'text-amber-600'

// Ежедневная 5-мин сессия: карточки со всех треков + словарь, которым пора на повторение.
export default function DailySessionPage() {
  const navigate = useNavigate()
  const { data, loading, reload } = useFetch(getSession)
  const { data: weak } = useFetch(getWeakSpots)
  const [started, setStarted] = useState(false)

  const items = data?.data || []
  const meta  = data?.meta || { cards: 0, vocab: 0, total: 0 }

  if (loading) return <PageContainer width="form"><SkeletonList /></PageContainer>

  return (
    <PageContainer width="form">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <CalendarCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ежедневная сессия</h1>
          <p className="text-sm text-slate-500">Повторение того, что пора повторить — со всех треков и словаря</p>
        </div>
      </div>

      {!items.length ? (
        <EmptyState emoji="🎉" title="На сегодня всё повторено"
          text="Возвращайтесь позже — карточки появятся здесь по расписанию. Добавляйте новые на шагах треков и в словаре." />
      ) : !started ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center max-w-xl mx-auto">
          <div className="text-4xl mb-3">🗂️</div>
          <div className="text-lg font-semibold text-slate-900 mb-1">К повторению: {meta.total}</div>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-5">
            <span className="inline-flex items-center gap-1.5"><Layers className="w-4 h-4" /> Треки: {meta.cards}</span>
            <span className="inline-flex items-center gap-1.5"><BookMarked className="w-4 h-4" /> Словарь: {meta.vocab}</span>
          </div>
          <Button onClick={() => setStarted(true)}>Начать повторение</Button>
        </div>
      ) : (
        <CardReview
          cards={items}
          onReview={(card, correct) => reviewItem(card.kind, card.id, correct)}
          onDone={() => { setStarted(false); reload() }}
          hint="Вспомните ответ, затем переверните карточку"
        />
      )}

      {/* Слабые места — практикованные шаги с низким обладанием */}
      {!started && weak?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Слабые места
          </h2>
          <p className="text-xs text-slate-500 mb-3">Подтемы, где обладание пока низкое — стоит вернуться и попрактиковать.</p>
          <div className="space-y-2">
            {weak.map((w) => (
              <button key={`${w.topicId}-${w.stepId}`} onClick={() => navigate(`/topics/${w.topicId}`)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 hover:border-amber-300 transition-colors flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-900 truncate">{w.stepTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{w.topicTitle} · {w.attempts} практик</div>
                </div>
                <span className={`text-sm font-semibold shrink-0 tabular-nums ${weakColor(w.mastery)}`}>{w.mastery}%</span>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
