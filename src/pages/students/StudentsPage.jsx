import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Target, Sparkles, Share2 } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getMyStudents, getTrackInsights, generateTargetedQuiz } from '../../api/students.api'
import { SkeletonCards } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

// Ключ слабого места (тема+подтема) — для выбора чекбоксами
const spotKey = (s) => `${s.topicId}::${s.stepTitle}`

const PAGE_SIZE = 12

export default function StudentsPage() {
  const { t } = useTranslation('teacher')
  const { data: students, loading } = useApiQuery(['my-students'], getMyStudents)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students || []
    return (students || []).filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [students, search])

  // Сбрасываем страницу при изменении поиска
  useEffect(() => { setPage(1) }, [search])

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('students.title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('students.subtitle')}</p>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : !students?.length ? (
        <EmptyState emoji="🎓" title={t('students.emptyTitle')}
          text={t('students.emptyText')} />
      ) : (
        <div>
          {/* Поиск + счётчик */}
          <div className="flex items-center gap-3 mb-4 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                placeholder={t('students.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-shadow"
              />
            </div>
            <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
              {filtered.length}{filtered.length !== students.length && ` / ${students.length}`}
            </span>
          </div>

          {/* Ростер — сетка карточек */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              {t('students.notFound')}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {paged.map(s => <StudentCard key={s.id} s={s} />)}
              </div>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StudentCard({ s }) {
  const { t } = useTranslation('teacher')
  const [insightsOpen, setInsightsOpen] = useState(false)
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <Avatar url={s.avatar} name={s.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 truncate">{s.name}</span>
            {s.isPlaceholder && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                {t('students.placeholder')}
              </span>
            )}
          </div>
          {s.username && <div className="text-xs text-slate-400 truncate">@{s.username}</div>}
          {(s.email || s.contact) && (
            <div className="text-xs text-slate-500 truncate mt-0.5">{s.email || s.contact}</div>
          )}
        </div>
      </div>

      {/* Слабые места из самообучения — только для реальных учеников (у заглушки нет аккаунта) */}
      {!s.isPlaceholder && (
        <button onClick={() => setInsightsOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          <Target className="w-3.5 h-3.5" /> Слабые места
        </button>
      )}

      {insightsOpen && <WeakSpotsModal student={s} onClose={() => setInsightsOpen(false)} />}
    </div>
  )
}

/* ── Слабые места ученика (из расшаренных треков) + генерация адресного теста ── */
function WeakSpotsModal({ student, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [gen, setGen]         = useState(false)
  const [quiz, setQuiz]       = useState(null)

  useEffect(() => {
    let alive = true
    getTrackInsights(student.id)
      .then((d) => { if (alive) { setData(d); setSelected(new Set((d.spots || []).map(spotKey))) } })
      .catch((e) => { if (alive) toast.error(e.response?.data?.error || 'Ошибка загрузки') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [student.id])

  const spots = data?.spots || []
  const meta  = data?.meta || {}
  const toggle = (s) => setSelected((prev) => {
    const n = new Set(prev); const k = spotKey(s); n.has(k) ? n.delete(k) : n.add(k); return n
  })
  const chosen = spots.filter((s) => selected.has(spotKey(s)))

  const generate = async () => {
    setGen(true)
    try {
      const q = await generateTargetedQuiz(student.id, chosen.map((s) => ({ topicId: s.topicId, stepTitle: s.stepTitle })))
      setQuiz(q)
      toast.success('Адресный тест создан и добавлен в вашу библиотеку тестов')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Не удалось создать тест')
    } finally { setGen(false) }
  }

  const barColor = (m) => m >= 40 ? 'bg-blue-500' : 'bg-amber-500'

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> Слабые места · {student.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4">Из треков самообучения, которыми ученик поделился с вами.</p>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Загрузка…</div>
        ) : quiz ? (
          <div className="text-center py-6">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">Тест готов</p>
            <p className="text-xs text-slate-500 mb-4">«{quiz.topic}» ({quiz.questions?.length || 0} вопр.) добавлен в вашу библиотеку тестов.</p>
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 text-left">
              Чтобы задать его ученику — создайте <b>ДЗ</b> на нужном уроке и прикрепите этот тест из библиотеки.
            </p>
            <Button variant="secondary" className="w-full" onClick={onClose}>Закрыть</Button>
          </div>
        ) : !meta.sharing ? (
          <div className="text-center py-8">
            <Share2 className="w-6 h-6 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {meta.totalTracks > 0
                ? `У ученика есть треки (${meta.totalTracks}), но он ещё не поделился ими с вами.`
                : 'У ученика пока нет треков самообучения.'}
            </p>
            <p className="text-xs text-slate-400 mt-2">Ученик включает доступ кнопкой «Поделиться с учителем» на странице трека.</p>
          </div>
        ) : !spots.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600">🎉 Ученик делится треками ({meta.sharedCount}), слабых мест сейчас нет.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[46vh] overflow-y-auto -mx-1 px-1 mb-4">
              {spots.map((s) => {
                const k = spotKey(s)
                return (
                  <label key={k} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-blue-300 transition-colors">
                    <input type="checkbox" checked={selected.has(k)} onChange={() => toggle(s)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-900 truncate">{s.stepTitle}</div>
                      <div className="text-xs text-slate-400 truncate">{s.topicTitle}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(s.mastery)}`} style={{ width: `${s.mastery}%` }} />
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-600 shrink-0 tabular-nums">{s.mastery}%</div>
                  </label>
                )
              })}
            </div>
            <Button className="w-full" onClick={generate} loading={gen} disabled={!chosen.length}>
              <Sparkles className="w-4 h-4 mr-1" /> Сгенерировать адресный тест{chosen.length ? ` (${chosen.length})` : ''}
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

function Avatar({ url, name }) {
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  )
}
