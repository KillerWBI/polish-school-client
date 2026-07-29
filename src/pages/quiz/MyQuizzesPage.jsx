import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from '../../utils/toast'
import { Sparkles, Trash2, ChevronRight } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import useAuth from '../../hooks/useAuth'
import { getQuizzes, deleteQuiz } from '../../api/quizzes.api'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import EmptyState from '../../components/ui/EmptyState'
import { IconTests } from '../../components/ui/icons'
import Tooltip from '../../components/ui/Tooltip'

export default function MyQuizzesPage({ embedded, onCreate }) {
  const { t, i18n } = useTranslation('app')
  const { t: tc } = useTranslation('common')
  const { data, loading, reload } = useApiQuery(['quizzes'], getQuizzes)
  const { isTeacher } = useAuth()
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState(null)
  const [tab, setTab] = useState('passed') // только учитель: passed | saved
  const TYPE_LABEL = { single: t('quiz.typeSingleShort'), multiple: t('quiz.typeMultipleShort'), truefalse: t('quiz.typeTrueFalseShort'), open: t('quiz.typeOpenShort') }

  const del = async (id) => {
    try { await deleteQuiz(id); toast.success(t('quiz.deleted')); setConfirmId(null); reload() }
    catch { toast.error(t('quiz.deleteFail')) }
  }

  const all = data || []
  const passed = all.filter((q) => q.taken)     // пройденные (с ответами/оценкой)
  const saved = all.filter((q) => !q.taken)     // сохранённые в библиотеку (для ДЗ)
  const shown = isTeacher ? (tab === 'passed' ? passed : saved) : all

  const emptyText = isTeacher
    ? (tab === 'passed' ? t('quiz.emptyPassed') : t('quiz.emptySaved'))
    : t('quiz.emptyStudent')

  const Wrap = embedded ? Fragment : PageContainer

  return (
    <Wrap>
      {!embedded && (
        <PageHeader
          title={t('quiz.myTitle')}
          subtitle={isTeacher ? t('quiz.mySubtitleTeacher') : t('quiz.mySubtitleStudent')}
          actions={
            <Tooltip text={t('quiz.tipCreate')} side="left">
              <Button size="sm" onClick={() => onCreate ? onCreate() : navigate('/quiz')}><Sparkles className="w-4 h-4" /> {t('dashboard.create')}</Button>
            </Tooltip>
          }
        />
      )}

      {isTeacher && (
        <Tabs className="mb-5" value={tab} onChange={setTab} items={[
          { key: 'passed', label: t('quiz.tabPassed'), count: passed.length },
          { key: 'saved',  label: t('quiz.tabSaved'),  count: saved.length },
        ]} />
      )}

      {loading ? <SkeletonList /> : !shown.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white">
          <EmptyState
            icon={IconTests}
            title={t('quiz.emptyTitle')}
            text={emptyText}
            action={<Button size="sm" onClick={() => navigate('/quiz')}><Sparkles className="w-4 h-4" /> {t('quiz.createTest')}</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 items-start">
          {shown.map((q) => (
            <div key={q.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <button onClick={() => navigate(`/quizzes/${q.id}`)} className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-slate-900 truncate">{q.topic}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t('quiz.questionsShort', { n: q.count })} · {TYPE_LABEL[q.type] ?? q.type} · {new Date(q.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </button>

              {q.taken && q.total != null && q.total > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  q.score === q.total ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {q.score}/{q.total}
                </span>
              )}

              {confirmId === q.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => del(q.id)} className="h-8 px-2.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors">{tc('delete')}</button>
                  <button onClick={() => setConfirmId(null)} className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">{tc('cancel')}</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setConfirmId(q.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Wrap>
  )
}
