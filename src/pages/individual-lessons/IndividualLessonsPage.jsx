import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { formatDate } from '../../utils/formatDate'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function IndividualLessonsPage() {
  const { data: lessons, loading } = useFetch(useCallback(() => getIndividualLessons(), []))

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Индивидуальные уроки</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Все индивидуальные занятия — разовые и из серии
        </p>
      </div>

      {loading ? <PageSpinner /> : !lessons?.length ? (
        <EmptyState
          emoji="📅"
          title="Уроков пока нет"
          text="Создайте индивидуальный курс, сгенерируйте уроки по расписанию или добавьте разовый урок."
        />
      ) : (
        <div className="space-y-2">
          {lessons.map(l => (
            <div key={l.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div className="text-center w-10 shrink-0">
                <div className="text-lg font-bold text-white leading-none">{l.date.slice(8)}</div>
                <div className="text-[10px] text-slate-500">{l.date.slice(5, 7)}/{l.date.slice(0, 4)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${l.topic ? 'text-white' : 'text-slate-500 italic'}`}>
                  {l.topic || 'Без темы'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {l.time}
                  {l.student?.name && ` · ${l.student.name}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-slate-500">
        Управление индивидуальными уроками появится в разделе «Инд. курсы».
        Открыть <Link to="/calendar" className="text-brand-400 hover:text-brand-300">календарь →</Link>
      </div>
    </div>
  )
}
