import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { getQuiz, deleteQuiz } from '../../api/quizzes.api'
import { SkeletonList } from '../../components/ui/Skeleton'
import QuizRunner from './QuizRunner'

export default function QuizViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: quiz, loading } = useFetch(() => getQuiz(id), [id])

  if (loading) return <div className="p-5 sm:p-8 max-w-3xl mx-auto"><SkeletonList count={4} /></div>

  if (!quiz) {
    return (
      <div className="p-5 sm:p-8 max-w-3xl mx-auto">
        <Link to="/quizzes" className="text-sm text-slate-500 hover:text-slate-700">← Мои тесты</Link>
        <div className="mt-6 text-center text-slate-400">Тест не найден.</div>
      </div>
    )
  }

  const del = async () => {
    try { await deleteQuiz(id); toast.success('Тест удалён'); navigate('/quizzes') }
    catch { toast.error('Не удалось удалить') }
  }

  // Пройденный (есть ответы/оценка) → открываем завершённым; сохранённый в библиотеку → свежий для прохождения.
  const taken = quiz.score != null || (quiz.answers && Object.keys(quiz.answers).length > 0)

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Мои тесты
      </Link>
      <div className="flex items-center justify-between gap-3 mt-3 mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">{quiz.topic}</h1>
        <button onClick={del}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors shrink-0">
          <Trash2 className="w-4 h-4" /> Удалить
        </button>
      </div>
      <QuizRunner quiz={quiz} savedAnswers={taken ? quiz.answers : undefined} />
    </div>
  )
}
