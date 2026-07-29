import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from '../../utils/toast'
import { Trash2 } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getQuiz, deleteQuiz } from '../../api/quizzes.api'
import { SkeletonList } from '../../components/ui/Skeleton'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import QuizRunner from './QuizRunner'

export default function QuizViewPage() {
  const { t } = useTranslation('app')
  const { t: tc } = useTranslation('common')
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: quiz, loading } = useApiQuery(['quiz', id], () => getQuiz(id))

  if (loading) return <PageContainer width="narrow"><SkeletonList count={4} /></PageContainer>

  if (!quiz) {
    return (
      <PageContainer width="narrow">
        <PageHeader back={{ to: '/quizzes', label: t('quiz.backToMy') }} title={t('quiz.notFound')} />
      </PageContainer>
    )
  }

  const del = async () => {
    try { await deleteQuiz(id); toast.success(t('quiz.deleted')); navigate('/quizzes') }
    catch { toast.error(t('quiz.deleteFail')) }
  }

  // Пройденный (есть ответы/оценка) → открываем завершённым; сохранённый в библиотеку → свежий для прохождения.
  const taken = quiz.score != null || (quiz.answers && Object.keys(quiz.answers).length > 0)

  return (
    <PageContainer width="narrow">
      <PageHeader
        back={{ to: '/quizzes', label: t('quiz.backToMy') }}
        title={quiz.topic}
        actions={
          <button onClick={del}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors shrink-0">
            <Trash2 className="w-4 h-4" /> {tc('delete')}
          </button>
        }
      />
      <QuizRunner quiz={quiz} savedAnswers={taken ? quiz.answers : undefined} />
    </PageContainer>
  )
}
