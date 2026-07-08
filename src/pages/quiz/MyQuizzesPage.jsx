import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sparkles, Trash2, ChevronRight } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getQuizzes, deleteQuiz } from '../../api/quizzes.api'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'

const TYPE_LABEL = { single: 'Один ответ', multiple: 'Несколько', truefalse: 'Верно/Неверно', open: 'Открытый' }

export default function MyQuizzesPage() {
  const { data, loading, reload } = useFetch(getQuizzes)
  const { isTeacher } = useAuth()
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState(null)
  const [tab, setTab] = useState('passed') // только учитель: passed | saved

  const del = async (id) => {
    try { await deleteQuiz(id); toast.success('Тест удалён'); setConfirmId(null); reload() }
    catch { toast.error('Не удалось удалить') }
  }

  const all = data || []
  const passed = all.filter((q) => q.taken)     // пройденные (с ответами/оценкой)
  const saved = all.filter((q) => !q.taken)     // сохранённые в библиотеку (для ДЗ)
  const shown = isTeacher ? (tab === 'passed' ? passed : saved) : all

  const emptyText = isTeacher
    ? (tab === 'passed'
      ? 'Пройденных тестов нет. Сгенерируй тест, пройди и нажми «Проверить» — прохождение с оценкой появится здесь.'
      : 'Сохранённых тестов нет. Сгенерируй тест и нажми «Сохранить тест» — он ляжет в библиотеку (для прикрепления к ДЗ).')
    : 'Тестов пока нет. На «AI-тесты» задай тему по любому предмету, пройди и нажми «Проверить» — прохождение с оценкой попадёт сюда, в твою историю.'

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Мои тесты</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTeacher ? 'Пройденные тобой и сохранённые в библиотеку (для ДЗ).' : 'Твои прохождения с результатами и ответами.'}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/quiz')}><Sparkles className="w-4 h-4" /> Создать</Button>
      </div>

      {isTeacher && (
        <div className="inline-flex p-0.5 mb-5 rounded-xl bg-slate-100 border border-slate-200">
          <TabBtn active={tab === 'passed'} onClick={() => setTab('passed')}>
            Пройденные{passed.length ? ` · ${passed.length}` : ''}
          </TabBtn>
          <TabBtn active={tab === 'saved'} onClick={() => setTab('saved')}>
            Сохранённые{saved.length ? ` · ${saved.length}` : ''}
          </TabBtn>
        </div>
      )}

      {loading ? <SkeletonList /> : !shown.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-slate-900 font-medium mb-1">Тестов пока нет</div>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">{emptyText}</p>
          <Button size="sm" onClick={() => navigate('/quiz')}><Sparkles className="w-4 h-4" /> Создать тест</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((q) => (
            <div key={q.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <button onClick={() => navigate(`/quizzes/${q.id}`)} className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-slate-900 truncate">{q.topic}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {q.count} вопр. · {TYPE_LABEL[q.type] ?? q.type} · {new Date(q.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                  <button onClick={() => del(q.id)} className="h-8 px-2.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors">Удалить</button>
                  <button onClick={() => setConfirmId(null)} className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Отмена</button>
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
