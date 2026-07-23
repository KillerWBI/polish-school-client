import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Lightbulb, Lock, Check, History, Target, Layers, Repeat, PenLine, FileText, BookOpen, Link2, Grid3x3, Trash2, Share2 } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getTopic, nextTopicQuiz, submitTopicAttempt, gradeOpenAnswers, suggestSources, getSources, deleteSource, importCardsFromText, shareTopic } from '../../api/topics.api'
import { safeUrl } from '../../utils/safeUrl'
import { getCards, getDueCards, generateCards, reviewCard } from '../../api/topicCards.api'
import { getQuiz } from '../../api/quizzes.api'
import QuizRunner from '../quiz/QuizRunner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import PageContainer from '../../components/ui/PageContainer'
import IdeasModal from './IdeasModal'
import CardReview from './CardReview'

const DIFF_KEY = { easy: 'diffEasy', medium: 'diffMedium', hard: 'diffHard' }
const GATE = 50 // шаг открывается, когда предыдущий освоен на ≥50%

const masteryColor = (m) => m >= 70 ? 'bg-emerald-500' : m >= 40 ? 'bg-blue-500' : 'bg-amber-500'
const masteryText  = (m) => m >= 70 ? 'text-emerald-600' : m >= 40 ? 'text-blue-600' : 'text-amber-600'

const fmtDate = (d, locale) => new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) +
  ', ' + new Date(d).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

// Метка сложности через i18n (детекция ключа по значению из бэка)
const diffLabel = (t, d) => DIFF_KEY[d] ? t(`detail.${DIFF_KEY[d]}`) : d

export default function TopicDetailPage() {
  const { t, i18n } = useTranslation('student')
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApiQuery(['topic', id], (s) => getTopic(id, s))
  const { data: cardsData, reload: reloadCards } = useApiQuery(['topic-cards', id], (s) => getCards(id, undefined, s))
  const { data: allSources, reload: reloadSources } = useApiQuery(['topic-sources', id], (s) => getSources(id, undefined, s))
  const [practiceStep, setPracticeStep] = useState(null) // шаг роадмапа, который практикуем
  const [cardsStep, setCardsStep]       = useState(null) // шаг, чьи карточки смотрим
  const [trackReview, setTrackReview]   = useState(false) // повторение due-карточек всего трека
  const [ideasOpen, setIdeasOpen]       = useState(false)
  const [reviewId, setReviewId]         = useState(null) // id попытки для разбора
  const [sharing, setSharing]           = useState(false) // тоггл «поделиться с учителем»

  if (loading) return <PageContainer><SkeletonList /></PageContainer>
  if (error || !data?.topic) {
    return (
      <PageContainer>
        <BackLink onClick={() => navigate('/topics')} />
        <p className="text-sm text-slate-500 mt-4">{error || t('detail.notFound')}</p>
      </PageContainer>
    )
  }

  const { topic, attempts } = data
  const roadmap = (Array.isArray(topic.roadmap) ? topic.roadmap : []).slice().sort((a, b) => a.order - b.order)
  const m = Math.round(topic.masteryPercent || 0)

  // Поделиться треком с учителем — учитель увидит слабые места и сможет дать адресный тест
  const toggleShare = async () => {
    setSharing(true)
    try {
      const r = await shareTopic(topic.id, !topic.sharedWithTeacher)
      toast.success(r.sharedWithTeacher ? t('detail.shared') : t('detail.unshared'))
      reload()
    } catch (e) {
      toast.error(e.response?.data?.error || t('common:error'))
    } finally { setSharing(false) }
  }

  const dueCount   = cardsData?.meta?.dueCount ?? 0
  const totalCards = cardsData?.data?.length ?? 0

  // Источники, сгруппированные по шагу (видны прямо в роадмапе)
  const sourcesByStep = (allSources || []).reduce((acc, s) => {
    (acc[s.stepId] = acc[s.stepId] || []).push(s); return acc
  }, {})
  const suggestForStep = async (stepId, loose) => {
    const added = await suggestSources(topic.id, stepId, loose)
    if (added?.length) toast.success(t('detail.sourcesAdded', { count: added.length }))
    else toast(loose ? t('detail.noMore') : t('detail.noVerified'))
    reloadSources()
    return added
  }
  const delSource = async (sourceId) => {
    try { await deleteSource(topic.id, sourceId); reloadSources() }
    catch (e) { toast.error(e.response?.data?.error || t('common:error')) }
  }

  // Практика конкретного шага — заменяет содержимое страницы
  if (practiceStep) {
    return (
      <StepPractice
        topicId={topic.id}
        step={practiceStep}
        onBack={() => { setPracticeStep(null); reload() }}
      />
    )
  }

  // Карточки шага — генерация + обзор
  if (cardsStep) {
    return (
      <StepCards
        topicId={topic.id}
        step={cardsStep}
        onBack={() => { setCardsStep(null); reloadCards() }}
      />
    )
  }

  // Повторение due-карточек всего трека
  if (trackReview) {
    return (
      <TrackReview
        topicId={topic.id}
        onBack={() => { setTrackReview(false); reloadCards() }}
      />
    )
  }

  return (
    <PageContainer>
      <BackLink onClick={() => navigate('/topics')} />

      {/* Шапка трека */}
      <div className="flex items-start gap-3 mt-4 mb-1">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">{topic.title}</h1>
          {topic.subject && <p className="text-sm text-slate-500">{topic.subject}</p>}
        </div>
        <div className={`text-2xl font-bold shrink-0 tabular-nums ${masteryText(m)}`}>{m}%</div>
      </div>

      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all ${masteryColor(m)}`} style={{ width: `${m}%` }} />
      </div>

      {topic.goal && (
        <p className="text-sm text-slate-600 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2 mb-2">
          🎯 {topic.goal}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
        <button onClick={() => setIdeasOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors">
          <Lightbulb className="w-4 h-4" /> {t('topics.whatToStudy')}
        </button>
        <button onClick={toggleShare} disabled={sharing}
          className={`inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
            topic.sharedWithTeacher ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
          title={t('detail.shareTitle')}>
          <Share2 className="w-4 h-4" />
          {topic.sharedWithTeacher ? t('detail.shareOn') : t('detail.shareOff')}
        </button>
      </div>

      {/* Карта знаний — компактный heatmap обладания по шагам (экспериментально) */}
      <KnowledgeMap roadmap={roadmap} />

      {/* Две колонки: роадмап (основное) + история практик (сайд) */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Роадмап */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">{t('detail.roadmap')} · {roadmap.length} {t('topics.steps', { count: roadmap.length })}</h2>
          <div className="space-y-2.5">
            {roadmap.map((step, i) => {
              const prev = i === 0 ? null : roadmap[i - 1]
              const locked = prev ? (Number(prev.mastery) || 0) < GATE : false
              return <StepRow key={step.id} step={step} index={i} locked={locked}
                onPractice={() => setPracticeStep(step)} onCards={() => setCardsStep(step)}
                sources={sourcesByStep[step.id] || []}
                onSuggest={(loose) => suggestForStep(step.id, loose)}
                onDeleteSource={delSource} />
            })}
          </div>
        </div>

        <div className="space-y-6">
        {/* Повторение карточек */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
            <Repeat className="w-4 h-4" /> {t('detail.repeat')}
          </h2>
          {totalCards === 0 ? (
            <p className="text-xs text-slate-400">{t('detail.cardsHint')}</p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                {dueCount > 0
                  ? t('detail.dueNow', { count: dueCount, total: totalCards })
                  : t('detail.allReviewed', { total: totalCards })}
              </p>
              <Button size="sm" className="w-full" disabled={dueCount === 0} onClick={() => setTrackReview(true)}>
                <Repeat className="w-4 h-4 mr-1" /> {t('detail.repeatBtn')}{dueCount > 0 ? ` (${dueCount})` : ''}
              </Button>
            </>
          )}
        </div>

        {/* История попыток */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4" /> {t('detail.history')}
          </h2>
          {!attempts?.length ? (
            <p className="text-sm text-slate-400">{t('detail.historyEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {attempts.map((a) => {
                const step = roadmap.find((s) => s.id === a.stepId)
                return (
                  <button key={a.id} onClick={() => setReviewId(a.id)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-300 transition-colors flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-900 truncate">{step?.title || topic.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{fmtDate(a.createdAt, i18n.language)} · {diffLabel(t, a.difficulty)}</div>
                    </div>
                    {a.total != null && (
                      <div className="text-sm font-semibold text-slate-700 shrink-0 tabular-nums">{a.score}/{a.total}</div>
                    )}
                    <span className="text-xs text-blue-600 shrink-0">{t('detail.reviewAttempt')}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {ideasOpen && <IdeasModal onClose={() => setIdeasOpen(false)} />}
      {reviewId && <ReviewModal attemptId={reviewId} onClose={() => setReviewId(null)} />}
    </PageContainer>
  )
}

function BackLink({ onClick }) {
  const { t } = useTranslation('student')
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
      <ArrowLeft className="w-4 h-4" /> {t('detail.backToTracks')}
    </button>
  )
}

/* ── Карта знаний: heatmap обладания по шагам (экспериментально) ── */
function KnowledgeMap({ roadmap }) {
  const { t } = useTranslation('student')
  if (!roadmap?.length) return null
  const cell = (m) => m >= 70 ? 'bg-emerald-500' : m >= 40 ? 'bg-blue-500' : m > 0 ? 'bg-amber-400' : 'bg-slate-200'
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-2">
        <Grid3x3 className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">{t('detail.knowledgeMap')}</span>
        <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1">{t('detail.exp')}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {roadmap.map((s, i) => {
          const m = Math.round(Number(s.mastery) || 0)
          return (
            <div key={s.id} title={`${i + 1}. ${s.title} — ${m}%`}
              className={`w-7 h-7 rounded-md ${cell(m)} flex items-center justify-center text-[10px] font-semibold ${m >= 40 ? 'text-white' : 'text-slate-500'}`}>
              {i + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepRow({ step, index, locked, onPractice, onCards, sources = [], onSuggest, onDeleteSource }) {
  const { t } = useTranslation('student')
  const [unlocked, setUnlocked] = useState(false)
  const m = Math.round(Number(step.mastery) || 0)
  const done = m >= 70
  const isLocked = locked && !unlocked

  return (
    <div className={`rounded-xl border p-3.5 ${isLocked ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
          done ? 'bg-emerald-500 text-white' : isLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-700'
        }`}>
          {done ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${masteryColor(m)}`} style={{ width: `${m}%` }} />
          </div>
        </div>
        <div className={`text-sm font-semibold shrink-0 tabular-nums ${isLocked ? 'text-slate-400' : masteryText(m)}`}>{m}%</div>
      </div>

      <div className="mt-3">
        {isLocked ? (
          <button onClick={() => setUnlocked(true)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
            {t('detail.locked', { gate: GATE })}
          </button>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={done ? 'secondary' : 'primary'} onClick={onPractice}>
                <Sparkles className="w-4 h-4 mr-1" /> {step.attempts > 0 ? t('detail.practiceMore') : t('detail.practice')}
              </Button>
              <Button size="sm" variant="secondary" onClick={onCards}>
                <Layers className="w-4 h-4 mr-1" /> {t('detail.cards')}
              </Button>
            </div>
            <StepSourcesInline sources={sources} onSuggest={onSuggest} onDeleteSource={onDeleteSource} />
          </>
        )}
      </div>
    </div>
  )
}

/* ── Источники под шагом (видны прямо на странице трека) ── */
function StepSourcesInline({ sources, onSuggest, onDeleteSource }) {
  const { t } = useTranslation('student')
  const [busy, setBusy] = useState(false)
  const has = sources.length > 0

  const run = async (loose) => {
    setBusy(true)
    try { await onSuggest(loose) }
    catch (e) { toast.error(e.response?.data?.error || t('detail.suggestError')) }
    finally { setBusy(false) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-slate-500">
        <BookOpen className="w-3.5 h-3.5" /> {t('detail.sources')}{has ? ` · ${sources.length}` : ''}
      </div>

      {has && (
        <div className="space-y-1.5 mb-2">
          {sources.map((s) => (
            <div key={s.id} className="flex items-center gap-2 group">
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                {s.type === 'book' ? <BookOpen className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                {s.url ? (
                  <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-800 hover:text-blue-600 truncate block">{s.title}</a>
                ) : (
                  <span className="text-sm text-slate-800 truncate block">{s.title}</span>
                )}
                <div className="text-[11px] text-slate-400 truncate">
                  {s.author || (s.type === 'link' && s.url ? s.url.replace(/^https?:\/\//, '') : '')}
                  {!s.verified && <span className="ml-1 text-amber-500">· {t('detail.lessVerified')}</span>}
                </div>
              </div>
              <button onClick={() => onDeleteSource(s.id)} title={t('common:delete')}
                className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0 opacity-60 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button onClick={() => run(false)} disabled={busy}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors">
          {busy ? t('detail.picking') : has ? t('detail.suggestMore') : t('detail.suggest')}
        </button>
        {has && (
          <button onClick={() => run(true)} disabled={busy}
            className="text-xs text-slate-400 hover:text-slate-600 disabled:text-slate-300 transition-colors">
            {t('detail.lessVerifiedBtn')}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Карточки шага: генерация / импорт из текста / обзор + источники ── */
function StepCards({ topicId, step, onBack }) {
  const { t } = useTranslation('student')
  const { data, loading, reload } = useApiQuery(['topic-cards', topicId, step.id], (s) => getCards(topicId, step.id, s))
  const [gen, setGen]           = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const cards = data?.data || []

  const doGen = async () => {
    setGen(true)
    try { await generateCards(topicId, step.id); toast.success(t('detail.cardsCreated')); reload() }
    catch (e) { toast.error(e.response?.data?.error || t('detail.cardsGenError')) }
    finally { setGen(false) }
  }

  return (
    <PageContainer width="form">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('detail.backToRoadmap')}
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">{step.title}</h1>
      <p className="text-xs text-slate-400 mb-4">{t('detail.cardsSub')}</p>

      {/* Действия: сделать из текста */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
          <FileText className="w-4 h-4 mr-1" /> {t('detail.fromText')}
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400"><Layers className="w-6 h-6 mx-auto mb-2 text-blue-400 animate-pulse" /> {t('common:loading')}</div>
      ) : !cards.length ? (
        <EmptyState emoji="🗂️" title={t('detail.cardsEmptyTitle')}
          text={t('detail.cardsEmptyText')}
          action={<Button onClick={doGen} loading={gen}><Sparkles className="w-4 h-4 mr-1" /> {t('detail.genCards')}</Button>} />
      ) : (
        <>
          <CardReview
            cards={cards}
            onReview={(card, correct) => reviewCard(topicId, card.id, correct)}
            onDone={onBack}
          />
          <div className="text-center mt-5">
            <Button size="sm" variant="secondary" onClick={doGen} loading={gen}>
              <Sparkles className="w-4 h-4 mr-1" /> {t('detail.addMoreCards')}
            </Button>
          </div>
        </>
      )}

      {importOpen && (
        <ImportCardsModal topicId={topicId} step={step}
          onClose={() => setImportOpen(false)}
          onDone={() => { setImportOpen(false); reload() }} />
      )}
    </PageContainer>
  )
}

/* ── Импорт карточек из текста ── */
function ImportCardsModal({ topicId, step, onClose, onDone }) {
  const { t } = useTranslation('student')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (text.trim().length < 30) { toast.error(t('detail.importShort')); return }
    setBusy(true)
    try {
      const cards = await importCardsFromText(topicId, { stepId: step.id, text })
      toast.success(t('detail.importDone', { count: cards.length }))
      onDone()
    } catch (e) {
      toast.error(e.response?.data?.error || t('detail.importError'))
    } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('detail.importTitle')}</h3>
        <p className="text-xs text-slate-500 mb-4">{t('detail.importSub')}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} autoFocus
          placeholder={t('detail.importPh')}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>{t('common:cancel')}</Button>
          <Button className="flex-1" onClick={submit} loading={busy}><Sparkles className="w-4 h-4 mr-1" /> {t('detail.makeCards')}</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Повторение due-карточек всего трека ── */
function TrackReview({ topicId, onBack }) {
  const { t } = useTranslation('student')
  const { data: cards, loading } = useApiQuery(['topic-due-cards', topicId], (s) => getDueCards(topicId, s))

  return (
    <PageContainer width="form">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('detail.backToTrack')}
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-1 flex items-center gap-2"><Repeat className="w-5 h-5 text-blue-600" /> {t('detail.repeat')}</h1>
      <p className="text-xs text-slate-400 mb-5">{t('detail.trackReviewSub')}</p>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">{t('common:loading')}</div>
      ) : !cards?.length ? (
        <EmptyState emoji="🎉" title={t('detail.trackReviewEmptyTitle')} text={t('detail.trackReviewEmptyText')} />
      ) : (
        <CardReview
          cards={cards}
          onReview={(card, correct) => reviewCard(topicId, card.id, correct)}
          onDone={onBack}
        />
      )}
    </PageContainer>
  )
}

/* ── Практика шага ── */
function StepPractice({ topicId, step, onBack }) {
  const { t } = useTranslation('student')
  const [mode, setMode]       = useState('test') // 'test' (MCQ) | 'open' (открытый ответ)
  const [quiz, setQuiz]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [runKey, setRunKey]   = useState(0)
  const [saved, setSaved]     = useState(null) // { score, total, mastery, label? } после сохранения

  const load = useCallback(async () => {
    setLoading(true); setQuiz(null); setSaved(null)
    try {
      const q = await nextTopicQuiz(topicId, step.id, mode)
      setQuiz(q); setRunKey((k) => k + 1)
    } catch (e) {
      toast.error(e.response?.data?.error || t('detail.genPracticeError'))
    } finally { setLoading(false) }
  }, [topicId, step.id, mode, t])

  // Генерируем практику при входе и при смене режима
  useEffect(() => { load() }, [load])

  // MCQ: «Проверить» в QuizRunner — сразу сохраняет попытку
  const onCheck = async (answers, score, total) => {
    if (score == null || total == null) return
    try {
      const updated = await submitTopicAttempt(topicId, {
        stepId: step.id, questions: quiz.questions, answers, score, total, difficulty: quiz.difficulty,
      })
      const st = (updated.roadmap || []).find((s) => s.id === step.id)
      setSaved({ score, total, mastery: Math.round(st?.mastery || 0) })
      toast.success(t('detail.savedToHistory'))
    } catch (e) {
      toast.error(e.response?.data?.error || t('detail.saveError'))
    }
  }

  // Открытый ответ: отправляем ответы на ИИ-оценку, показываем результаты
  const onGrade = async (answers) => {
    const res = await gradeOpenAnswers(topicId, {
      stepId: step.id, questions: quiz.questions, answers, difficulty: quiz.difficulty,
    })
    const st = (res.topic?.roadmap || []).find((s) => s.id === step.id)
    setSaved({ score: res.score, total: res.total, mastery: Math.round(st?.mastery || 0), label: t('detail.avgScore', { avg: res.avg }) })
    toast.success(t('detail.graded'))
    return res.results
  }

  const genLabel = mode === 'open' ? t('detail.genOpen') : t('detail.genTest')

  return (
    <PageContainer width="form">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('detail.backToRoadmap')}
      </button>

      <h1 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h1>

      {/* Переключатель режима практики */}
      <div className="inline-flex p-0.5 mb-4 rounded-xl bg-slate-100 border border-slate-200">
        <PracticeTab active={mode === 'test'} onClick={() => setMode('test')}><Sparkles className="w-4 h-4" /> {t('detail.tabTest')}</PracticeTab>
        <PracticeTab active={mode === 'open'} onClick={() => setMode('open')}><PenLine className="w-4 h-4" /> {t('detail.tabOpen')}</PracticeTab>
      </div>

      {quiz && <p className="text-xs text-slate-400 mb-4">{t('detail.difficulty', { level: diffLabel(t, quiz.difficulty) })} · {mode === 'open' ? t('detail.openHint') : t('detail.testHint')}</p>}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mb-4">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t('detail.savedBanner')} · {saved.label ? <b>{saved.label}</b> : <>{t('detail.resultLabel')} <b>{saved.score}/{saved.total}</b></>} · {t('detail.masteryStepPre')} <b>{saved.mastery}%</b></span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-blue-400 animate-pulse" />
          {genLabel}
        </div>
      ) : quiz && mode === 'open' ? (
        <>
          <OpenRunner key={runKey} quiz={quiz} onGrade={onGrade} />
          <div className="flex gap-2 mt-5">
            <Button variant="secondary" className="flex-1" onClick={onBack}>{saved ? t('common:done') : t('detail.exit')}</Button>
            <Button className="flex-1" onClick={load}><Sparkles className="w-4 h-4 mr-1" /> {t('detail.newQuestions')}</Button>
          </div>
        </>
      ) : quiz ? (
        <>
          {!saved && (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
              {t('detail.checkHintPre')} <b>{t('detail.checkBtn')}</b> {t('detail.checkHintPost')}
            </p>
          )}
          <QuizRunner key={runKey} quiz={quiz} onCheck={onCheck} />
          <div className="flex gap-2 mt-5">
            <Button variant="secondary" className="flex-1" onClick={onBack}>{saved ? t('common:done') : t('detail.exit')}</Button>
            <Button className="flex-1" onClick={load}><Sparkles className="w-4 h-4 mr-1" /> {t('detail.moreTest')}</Button>
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-500 mb-4">{t('detail.genFailed')}</p>
          <Button onClick={load}>{t('detail.retry')}</Button>
        </div>
      )}
    </PageContainer>
  )
}

function PracticeTab({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

/* ── Открытый ответ: textarea на каждый вопрос → ИИ-оценка + фидбек ── */
function OpenRunner({ quiz, onGrade }) {
  const { t } = useTranslation('student')
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : []
  const [answers, setAnswers] = useState({})
  const [busy, setBusy]       = useState(false)
  const [results, setResults] = useState(null) // [{ score, feedback }]

  const submit = async () => {
    setBusy(true)
    try { setResults(await onGrade(answers)) }
    catch (e) { toast.error(e.response?.data?.error || t('detail.gradeError')) }
    finally { setBusy(false) }
  }

  const scoreColor = (s) => s >= 70 ? 'bg-emerald-50 text-emerald-700' : s >= 40 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const r = results?.[i]
        return (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-900 mb-2.5">{i + 1}. {q.question}</div>
            <textarea rows={3} value={answers[i] || ''} disabled={!!results}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder={t('detail.yourAnswer')}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:bg-slate-50" />
            {r && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(r.score)}`}>{t('detail.scoreLabel', { score: r.score })}</span>
                </div>
                {r.feedback && <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">💬 {r.feedback}</div>}
                {q.sampleAnswer && <div className="text-xs text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2"><span className="text-emerald-600">{t('detail.sample')}</span>{q.sampleAnswer}</div>}
              </div>
            )}
          </div>
        )
      })}

      {!results && (
        <Button onClick={submit} loading={busy}>{t('detail.checkAnswers')}</Button>
      )}
    </div>
  )
}

/* ── Разбор пройденной попытки ── */
function ReviewModal({ attemptId, onClose }) {
  const { t } = useTranslation('student')
  const [quiz, setQuiz]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getQuiz(attemptId)
      .then((q) => { if (alive) setQuiz(q) })
      .catch((e) => toast.error(e.response?.data?.error || t('detail.reviewError')))
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [attemptId, t])

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('detail.reviewTitle')}</h3>
        <p className="text-xs text-slate-500 mb-4">{t('detail.reviewSub')}</p>
        <div className="max-h-[65vh] overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-400">{t('common:loading')}</div>
          ) : quiz ? (
            <QuizRunner quiz={quiz} savedAnswers={quiz.answers} />
          ) : (
            <p className="text-sm text-slate-400">{t('detail.loadFailed')}</p>
          )}
        </div>
        <div className="mt-5">
          <Button variant="secondary" className="w-full" onClick={onClose}>{t('common:close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
