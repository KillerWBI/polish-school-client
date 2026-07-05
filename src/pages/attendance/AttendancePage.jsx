import { useState, useEffect, useCallback, useRef } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getGroups, getGroup } from '../../api/groups.api'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import {
  getAttendance,
  getPendingAttendance,
  saveAttendance,
  confirmAttendance,
  resolveAttendanceDispute,
} from '../../api/attendance.api'
import { getHomework } from '../../api/homework.api'
import { formatDate } from '../../utils/formatDate'
import { toast, errMsg } from '../../utils/toast'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

/* ─── Статусы ──────────────────────────────────────────────── */
const STATUS_BADGE = {
  confirmed:       { label: 'Подтверждено',     cls: 'bg-green-500/15 text-emerald-600' },
  pending_student: { label: 'Ждёт подтверждения', cls: 'bg-yellow-500/15 text-amber-600' },
  disputed:        { label: 'Спор',             cls: 'bg-red-500/15 text-red-600' },
}

// Бейдж реального статуса записи (НЕ из галочки учителя, а из сохранённой записи).
// confirmed показывает фактический present (был/не был); остальное — статус подтверждения.
function ConfirmBadge({ rec }) {
  if (!rec) return null
  if (rec.status === 'confirmed') {
    return rec.present
      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-emerald-600 shrink-0">✓ Был · подтв.</span>
      : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 shrink-0">Не был · подтв.</span>
  }
  const b = STATUS_BADGE[rec.status]
  return b ? <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${b.cls}`}>{b.label}</span> : null
}

/* ─── Корневой компонент ────────────────────────────────────── */
export default function AttendancePage() {
  const { isTeacher } = useAuth()
  const [mode, setMode] = useState('journal') // 'journal' | 'pending' | 'disputed'

  const { data: pending, loading: pendingLoading, reload: reloadPending } =
    useFetch(getPendingAttendance)

  const pendingItems   = (pending || []).filter(r => r.status === 'pending_student')
  const disputedItems  = (pending || []).filter(r => r.status === 'disputed')
  const pendingCount   = pendingItems.length
  const disputedCount  = disputedItems.length

  return (
    <div className="p-5 sm:p-8">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Посещаемость</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isTeacher
            ? 'Отметьте присутствие — студент подтвердит свою сторону'
            : 'Ваши посещения и запросы на подтверждение'}
        </p>
      </div>

      {/* Режим-вкладки верхнего уровня */}
      <ModeBar
        mode={mode}
        onChange={setMode}
        pendingCount={isTeacher ? pendingCount : pendingCount}
        disputedCount={disputedCount}
        isTeacher={isTeacher}
      />

      {/* Содержимое по режиму */}
      {mode === 'journal' && (
        isTeacher
          ? <TeacherView onSaved={reloadPending} />
          : <StudentView onDisputed={reloadPending} />
      )}
      {mode === 'pending' && (
        <PendingView
          items={pendingItems}
          loading={pendingLoading}
          isTeacher={isTeacher}
          reload={reloadPending}
        />
      )}
      {mode === 'disputed' && (
        <DisputedView
          items={disputedItems}
          loading={pendingLoading}
          isTeacher={isTeacher}
          reload={reloadPending}
        />
      )}
    </div>
  )
}

/* ─── Верхние вкладки режима ────────────────────────────────── */
function ModeBar({ mode, onChange, pendingCount, disputedCount, isTeacher }) {
  const tabs = [
    {
      key: 'journal',
      label: isTeacher ? 'Журнал' : 'История',
    },
    {
      key: 'pending',
      label: isTeacher ? 'Ожидают студентов' : 'Подтвердить',
      count: pendingCount,
    },
    {
      key: 'disputed',
      label: 'Спорные',
      count: disputedCount,
    },
  ]

  return (
    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-fit mb-6">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            mode === t.key
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}>
          {t.label}
          {t.count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              mode === t.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ─── Вкладка: Ожидают подтверждения ───────────────────────── */
function PendingView({ items, loading, isTeacher, reload }) {
  const [busy, setBusy] = useState({})

  const handleStudentConfirm = async (id, present) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await confirmAttendance(id, present)
      toast.success(present ? 'Посещение подтверждено' : 'Отмечено как отсутствие')
      reload()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка'))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  if (loading) return <PageSpinner />
  if (!items.length) return (
    <EmptyState
      emoji="✅"
      title="Всё подтверждено"
      text={isTeacher
        ? 'Нет записей, ожидающих подтверждения от студентов.'
        : 'Нет уроков, требующих вашего подтверждения.'}
    />
  )

  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-slate-400 mb-4">
        {isTeacher
          ? `${items.length} урок(ов) ждут подтверждения от студентов. Через 3 дня подтвердятся автоматически.`
          : `Подтвердите или оспорьте своё присутствие на ${items.length} уроке(ах).`}
      </p>
      {items.map(r => {
        const lesson = r.Lesson || r.IndividualLesson
        return (
          <div
            key={r.id}
            className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {lesson?.topic || (r.lessonId ? 'Групповой урок' : 'Инд. урок')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lesson?.date ? formatDate(lesson.date) : '—'}
                  {lesson?.time ? ` · ${lesson.time}` : ''}
                  {r.Lesson?.Group?.name ? ` · ${r.Lesson.Group.name}` : ''}
                </div>
                {isTeacher && r.student && (
                  <div className="text-xs text-slate-500 mt-1">Студент: {r.student.name}</div>
                )}
                <div className="text-xs text-amber-600/80 mt-1">
                  Учитель отметил: {r.teacherMarked ? '✓ Присутствовал' : '✗ Отсутствовал'}
                </div>
              </div>

              {/* Кнопки студента */}
              {!isTeacher && (
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={busy[r.id]}
                    onClick={() => handleStudentConfirm(r.id, true)}
                    className="px-3 py-1.5 rounded-lg bg-green-600/20 text-emerald-600 text-xs font-medium
                               hover:bg-green-600/30 transition-colors cursor-pointer disabled:opacity-50">
                    Был
                  </button>
                  <button
                    disabled={busy[r.id]}
                    onClick={() => handleStudentConfirm(r.id, false)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-600 text-xs font-medium
                               hover:bg-red-600/30 transition-colors cursor-pointer disabled:opacity-50">
                    Не был
                  </button>
                </div>
              )}

              {/* Учитель — только инфо, кнопок нет (студент должен ответить) */}
              {isTeacher && (
                <span className="text-xs text-amber-600/70 shrink-0 mt-1">
                  Ждём ответа
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Вкладка: Спорные ──────────────────────────────────────── */
function DisputedView({ items, loading, isTeacher, reload }) {
  const [busy, setBusy] = useState({})

  const handleResolve = async (id, accept) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await resolveAttendanceDispute(id, accept)
      toast.success(accept ? 'Принята версия студента' : 'Подтверждена версия учителя')
      reload()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка'))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  const handleStudentUpdate = async (id, present) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await confirmAttendance(id, present)
      toast.success('Ответ обновлён')
      reload()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка'))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  if (loading) return <PageSpinner />
  if (!items.length) return (
    <EmptyState
      emoji="🤝"
      title="Споров нет"
      text="Все посещения согласованы между учителем и студентами."
    />
  )

  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-slate-400 mb-4">
        {isTeacher
          ? `${items.length} спорных записей — ответы учителя и студента расходятся. Посещение не засчитывается до разрешения.`
          : `${items.length} спорных записей — ваш ответ расходится с отметкой учителя.`}
      </p>
      {items.map(r => {
        const lesson = r.Lesson || r.IndividualLesson
        return (
          <div
            key={r.id}
            className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {lesson?.topic || (r.lessonId ? 'Групповой урок' : 'Инд. урок')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lesson?.date ? formatDate(lesson.date) : '—'}
                  {lesson?.time ? ` · ${lesson.time}` : ''}
                  {r.Lesson?.Group?.name ? ` · ${r.Lesson.Group.name}` : ''}
                </div>
                {isTeacher && r.student && (
                  <div className="text-xs text-slate-500 mt-1">Студент: {r.student.name}</div>
                )}

                {/* Кто что сказал */}
                <div className="flex gap-4 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.teacherMarked ? 'bg-green-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'
                  }`}>
                    Учитель: {r.teacherMarked ? 'был' : 'не был'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.studentMarked ? 'bg-green-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'
                  }`}>
                    Студент: {r.studentMarked ? 'был' : 'не был'}
                  </span>
                </div>

                <p className="text-xs text-red-600/70 mt-1">
                  Посещение не засчитывается до разрешения спора
                </p>
              </div>

              {/* Кнопки разрешения */}
              <div className="flex flex-col gap-2 shrink-0">
                {isTeacher ? (
                  <>
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleResolve(r.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium
                                 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      Принять студента
                    </button>
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleResolve(r.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-900 text-xs font-medium
                                 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      Настоять на своём
                    </button>
                  </>
                ) : (
                  <>
                    {/* Студент может изменить свой ответ */}
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleStudentUpdate(r.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-green-600/20 text-emerald-600 text-xs font-medium
                                 hover:bg-green-600/30 transition-colors cursor-pointer disabled:opacity-50">
                      Был
                    </button>
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleStudentUpdate(r.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-600 text-xs font-medium
                                 hover:bg-red-600/30 transition-colors cursor-pointer disabled:opacity-50">
                      Не был
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Переключатель типа урока (группа/инд.) ────────────────── */
function LessonTypeSwitcher({ tab, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-fit mb-5">
      {[['group', 'Групповые'], ['individual', 'Индивидуальные']].map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === val
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}>
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Учитель — журнал (электронный дневник) ───────────────── */
function TeacherView({ onSaved }) {
  const [tab, setTab] = useState('group') // group | individual
  return (
    <div>
      <LessonTypeSwitcher tab={tab} onChange={setTab} />
      {tab === 'group'
        ? <GroupJournal onSaved={onSaved} />
        : <IndividualJournal onSaved={onSaved} />}
    </div>
  )
}

/* ─── Журнал группы: ученики × даты уроков ─────────────────── */
function GroupJournal({ onSaved }) {
  const { data: groups, loading } = useFetch(getGroups)
  const [groupId, setGroupId] = useState(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  // Автовыбор первой группы
  useEffect(() => {
    if (!groupId && groups?.length) setGroupId(groups[0].id)
  }, [groups, groupId])

  // Открываем журнал на месяце ПОСЛЕДНЕЙ отметки посещаемости группы (там, где данные),
  // а не просто где есть уроки — иначе залипаем на пустом текущем месяце.
  // Результат привязываем к gid, иначе при смене группы сработаем по устаревшим данным.
  const { data: attMeta } = useFetch(
    () => groupId
      ? getAttendance({ groupId, limit: 100 }).then(rs => ({ gid: groupId, rs: rs || [] }))
      : Promise.resolve({ gid: null, rs: [] }),
    [groupId]
  )
  const pickedFor = useRef(null)
  useEffect(() => {
    if (!attMeta || attMeta.gid !== groupId) return // ждём данные именно этой группы
    if (pickedFor.current === groupId) return         // месяц уже подобран — не мешаем ручной навигации
    pickedFor.current = groupId
    const m = bestMonth(attMeta.rs)
    if (m) setMonth(m)                                // нет отметок → оставляем текущий месяц
  }, [groupId, attMeta])

  if (loading) return <PageSpinner />
  if (!groups?.length)
    return <EmptyState emoji="👥" title="Групп нет" text="Сначала создайте группу — журнал появится здесь." />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GroupPills groups={groups} value={groupId} onChange={setGroupId} />
        <MonthNav month={month} onChange={setMonth} />
      </div>
      {groupId && (
        <JournalTable key={`${groupId}-${month}`} groupId={groupId} month={month} onSaved={onSaved} />
      )}
    </div>
  )
}

/* Сама сетка: строки — ученики, колонки — уроки месяца, ячейки — отметки */
function JournalTable({ groupId, month, onSaved }) {
  const { from, to } = monthBounds(month)

  const { data: group,   loading: gLoad } = useFetch(() => getGroup(groupId), [groupId])
  const { data: lessons, loading: lLoad } = useFetch(
    () => getLessons({ groupId, from, to, limit: 100 }), [groupId, from, to]
  )

  // records: `${lessonId}:${studentId}` -> запись посещаемости
  const [records, setRecords] = useState({})
  const [recLoad, setRecLoad] = useState(false)
  const [edits, setEdits]     = useState({}) // локальные несохранённые правки
  const [saving, setSaving]   = useState(false)

  const reloadRecords = useCallback(async (list) => {
    if (!list?.length) { setRecords({}); return }
    setRecLoad(true)
    try {
      const pairs = await Promise.all(
        list.map(l => getAttendance({ lessonId: l.id }).then(rs => [l.id, rs || []]).catch(() => [l.id, []]))
      )
      const map = {}
      pairs.forEach(([lid, rs]) => rs.forEach(r => { map[`${lid}:${r.studentId}`] = r }))
      setRecords(map)
    } finally { setRecLoad(false) }
  }, [])

  useEffect(() => { reloadRecords(lessons) }, [lessons, reloadRecords])
  useEffect(() => { setEdits({}) }, [groupId, month])

  const sorted = [...(lessons || [])].sort(
    (a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || '')
  )
  const students = group?.students || []

  // Эффективная отметка ячейки: правка > сохранённая (teacherMarked) > нет
  const effective = (lid, sid) => {
    const key = `${lid}:${sid}`
    if (key in edits) return { marked: true, present: edits[key], dirty: true, status: records[key]?.status }
    const rec = records[key]
    if (rec) return { marked: true, present: rec.teacherMarked ?? rec.present, dirty: false, status: rec.status }
    return { marked: false, present: false, dirty: false, status: null }
  }

  const toggleCell = (lid, sid) => {
    const key = `${lid}:${sid}`
    const cur = effective(lid, sid)
    const next = cur.marked ? !cur.present : true // первый клик → «был», далее переключение
    setEdits(e => ({ ...e, [key]: next }))
  }

  // Клик по шапке-дате: отметить весь урок present (или снять, если уже все present)
  const toggleColumn = (lid) => {
    const allPresent = students.every(s => effective(lid, s.id).present)
    setEdits(e => {
      const next = { ...e }
      students.forEach(s => { next[`${lid}:${s.id}`] = !allPresent })
      return next
    })
  }

  const dirtyLessons = [...new Set(Object.keys(edits).map(k => k.split(':')[0]))]

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const lid of dirtyLessons) {
        const recs = students.map(s => ({ studentId: s.id, present: !!effective(lid, s.id).present }))
        await saveAttendance(lid, recs)
      }
      toast.success('Журнал сохранён — ученики получат запрос на подтверждение')
      setEdits({})
      await reloadRecords(sorted)
      onSaved?.()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка сохранения'))
    } finally { setSaving(false) }
  }

  if (gLoad || lLoad) return <PageSpinner />
  if (!students.length)
    return <EmptyState emoji="👤" title="В группе нет учеников" text="Добавьте учеников в группу — они появятся строками журнала." />
  if (!sorted.length)
    return <EmptyState emoji="📅" title="Нет уроков в этом месяце" text="Переключите месяц или создайте уроки для группы." />

  // Процент посещаемости ученика по подтверждённым записям месяца
  const studentPct = (sid) => {
    const conf = sorted
      .map(l => records[`${l.id}:${sid}`])
      .filter(r => r?.status === 'confirmed')
    if (!conf.length) return null
    return Math.round(conf.filter(r => r.present).length / conf.length * 100)
  }

  return (
    <div className="space-y-3">
      {/* Панель сохранения */}
      {dirtyLessons.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-sm text-blue-800 flex-1">
            Несохранённые изменения в {dirtyLessons.length} {plural(dirtyLessons.length, 'уроке', 'уроках', 'уроках')}
          </span>
          <button onClick={() => setEdits({})}
            className="text-sm text-slate-500 hover:text-slate-900 cursor-pointer">Отменить</button>
          <Button size="sm" onClick={handleSave} loading={saving}>Сохранить</Button>
        </div>
      )}

      {/* Таблица-журнал */}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white max-h-[64vh] relative">
        <table className="border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 bg-slate-50 border-b border-r border-slate-200 px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">
                Ученик
              </th>
              {sorted.map(l => {
                const h = dayHeader(l.date)
                return (
                  <th key={l.id}
                    onClick={() => toggleColumn(l.id)}
                    title={`${l.topic || 'Урок'} · ${formatDate(l.date)}${l.time ? ` · ${l.time}` : ''}\nКлик — отметить всех присутствующими`}
                    className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-100 px-0 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors select-none">
                    <div className="w-11 flex flex-col items-center leading-tight">
                      <span className="text-[10px] text-slate-400 uppercase">{h.wd}</span>
                      <span className="text-sm font-semibold text-slate-700">{h.day}</span>
                      <span className="text-[10px] text-slate-400">{h.mon}</span>
                    </div>
                  </th>
                )
              })}
              <th className="sticky right-0 top-0 z-30 bg-slate-50 border-b border-l border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, ri) => {
              const pct = studentPct(s.id)
              return (
                <tr key={s.id} className="group/row">
                  <td className={`sticky left-0 z-10 border-b border-r border-slate-100 px-4 py-2 ${ri % 2 ? 'bg-slate-50/60' : 'bg-white'} group-hover/row:bg-blue-50/40`}>
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
                        {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : (s.name?.[0]?.toUpperCase() || '?')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{s.name}</div>
                        {s.isPlaceholder && <div className="text-[10px] text-amber-600">заглушка</div>}
                      </div>
                    </div>
                  </td>
                  {sorted.map(l => {
                    const c = effective(l.id, s.id)
                    return (
                      <td key={l.id} className="border-b border-r border-slate-100 p-0 text-center">
                        <JournalCell {...c} onClick={() => toggleCell(l.id, s.id)} />
                      </td>
                    )
                  })}
                  <td className={`sticky right-0 z-10 border-b border-l border-slate-100 px-3 text-center ${ri % 2 ? 'bg-slate-50/60' : 'bg-white'} group-hover/row:bg-blue-50/40`}>
                    <span className={`text-sm font-semibold ${pct === null ? 'text-slate-300' : pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {pct === null ? '—' : `${pct}%`}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <JournalLegend loading={recLoad} />
    </div>
  )
}

/* Ячейка журнала.
   Цвет = статус подтверждения (важнее галочки):
   confirmed → зелёный(был)/красный(не был); pending_student/disputed → жёлтый;
   спор дополнительно с красной рамкой; несохранённое — синяя рамка. */
function JournalCell({ marked, present, status, dirty, onClick }) {
  let cls = 'text-slate-200 hover:bg-blue-50'
  let content = '·'
  if (marked) {
    content = present ? '✓' : 'Н'
    if (dirty) {
      cls = present ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
    } else if (status === 'pending_student' || status === 'disputed') {
      cls = 'bg-amber-50 text-amber-700 hover:bg-amber-100' // ещё не согласовано → жёлтый
    } else if (present) {
      cls = 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
    } else {
      cls = 'bg-red-50 text-red-600 hover:bg-red-100'
    }
  }
  const ring =
    dirty                 ? 'ring-2 ring-blue-500 ring-inset' :
    status === 'disputed' ? 'ring-1 ring-red-400 ring-inset'  : ''
  return (
    <button onClick={onClick}
      className={`w-11 h-10 flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer ${cls} ${ring}`}>
      {content}
    </button>
  )
}

function JournalLegend({ loading }) {
  const Item = ({ box, label }) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-4 h-4 rounded ${box}`} />
      {label}
    </span>
  )
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 px-1">
      <Item box="bg-emerald-50 border border-emerald-200" label="был (подтв.)" />
      <Item box="bg-red-50 border border-red-200" label="не был (подтв.)" />
      <Item box="bg-amber-50 border border-amber-200" label="ждёт подтверждения" />
      <Item box="bg-amber-50 ring-1 ring-red-400" label="спор" />
      <Item box="ring-2 ring-blue-500" label="не сохранено" />
      <span className="text-slate-400">· клик по дате — отметить всех присутствующими</span>
      {loading && <span className="text-blue-600">обновление…</span>}
    </div>
  )
}

/* ─── Журнал индивидуальных уроков (список по датам) ────────── */
function IndividualJournal({ onSaved }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const { from, to } = monthBounds(month)

  const { data: lessons, loading } = useFetch(
    () => getIndividualLessons({ from, to }), [from, to]
  )
  const [records, setRecords] = useState({}) // lessonId -> запись
  const [busy, setBusy] = useState({})

  const reload = useCallback(async (list) => {
    if (!list?.length) { setRecords({}); return }
    const pairs = await Promise.all(
      list.map(l => getAttendance({ individualLessonId: l.id }).then(rs => [l.id, (rs || [])[0] || null]).catch(() => [l.id, null]))
    )
    const map = {}
    pairs.forEach(([lid, r]) => { if (r) map[lid] = r })
    setRecords(map)
  }, [])
  useEffect(() => { reload(lessons) }, [lessons, reload])

  const mark = async (l, present) => {
    setBusy(b => ({ ...b, [l.id]: true }))
    try {
      await saveAttendance(null, [{ studentId: l.studentId, present }], l.id)
      toast.success(present ? 'Отмечено «был» — ждём подтверждения ученика' : 'Отмечено «не был»')
      await reload(lessons)
      onSaved?.()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка сохранения'))
    } finally { setBusy(b => ({ ...b, [l.id]: false })) }
  }

  const sorted = [...(lessons || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <MonthNav month={month} onChange={setMonth} />
      </div>
      {loading ? <PageSpinner /> : !sorted.length ? (
        <EmptyState emoji="👤" title="Нет индивидуальных уроков" text="В этом месяце уроков нет — переключите месяц." />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {sorted.map(l => {
            const rec = records[l.id]
            const marked = !!rec
            const present = rec ? (rec.teacherMarked ?? rec.present) : null
            return (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="w-11 text-center shrink-0">
                  <div className="text-sm font-semibold text-slate-700">{dayHeader(l.date).day}.{dayHeader(l.date).mon}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{dayHeader(l.date).wd}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{l.student?.name || 'Ученик'}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {l.topic || 'Без темы'}{l.time ? ` · ${l.time}` : ''}
                  </div>
                </div>
                {marked && <ConfirmBadge rec={rec} />}
                <div className="flex gap-1.5 shrink-0">
                  <button disabled={busy[l.id]} onClick={() => mark(l, true)}
                    className={`h-8 w-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                      present === true ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>✓</button>
                  <button disabled={busy[l.id]} onClick={() => mark(l, false)}
                    className={`h-8 w-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                      present === false ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>Н</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Атомы журнала: выбор группы, навигация по месяцам ─────── */
function GroupPills({ groups, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {groups.map(g => (
        <button key={g.id} onClick={() => onChange(g.id)}
          className={`px-3.5 h-9 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
            value === g.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
          {g.name}
        </button>
      ))}
    </div>
  )
}

function MonthNav({ month, onChange }) {
  const Arrow = ({ dir }) => (
    <button onClick={() => onChange(shiftMonth(month, dir))}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={dir < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
      <Arrow dir={-1} />
      <span className="px-2 text-sm font-medium text-slate-700 capitalize min-w-[128px] text-center">{monthLabel(month)}</span>
      <Arrow dir={1} />
    </div>
  )
}

/* ─── Утилиты дат/месяцев ──────────────────────────────────── */
function monthBounds(ym) {
  const [y, m] = ym.split('-').map(Number)
  return { from: `${ym}-01`, to: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) }
}
function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7)
}
function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}
function dayHeader(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: String(d.getMonth() + 1).padStart(2, '0'),
    wd:  d.toLocaleDateString('ru-RU', { weekday: 'short' }),
  }
}
// Месяц последней отметки посещаемости (по дате урока). null — если отметок нет.
function bestMonth(records) {
  const dates = (records || [])
    .map(r => r.Lesson?.date || r.IndividualLesson?.date)
    .filter(Boolean)
    .sort()
  return dates.length ? dates[dates.length - 1].slice(0, 7) : null
}
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

/* ─── Студент — история ─────────────────────────────────────── */
function StudentView({ onDisputed }) {
  const [tab,        setTab]        = useState('group')
  const [expandedId, setExpandedId] = useState(null)
  const [busy,       setBusy]       = useState({})

  const { data: attendance, loading: attLoading, reload } = useFetch(getAttendance)
  const { data: homework }                                = useFetch(getHomework)

  // Студент передумал по подтверждённой записи: шлём противоположный ответ →
  // расходится с отметкой учителя → запись становится спорной (disputed).
  const handleDispute = async (id, currentPresent) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await confirmAttendance(id, !currentPresent)
      toast.success('Отправлено в спор — учитель рассмотрит во вкладке «Спорные»')
      reload()
      onDisputed?.()
    } catch (e) {
      toast.error(errMsg(e, 'Ошибка'))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  const all = attendance || []
  const hw  = homework   || []

  const sortByDate = (recs) =>
    [...recs].sort((a, b) => {
      const da = a.Lesson?.date || a.IndividualLesson?.date || ''
      const db = b.Lesson?.date || b.IndividualLesson?.date || ''
      return db.localeCompare(da)
    })

  // История — только подтверждённые записи
  const confirmed = all.filter(r => r.status === 'confirmed')
  const groupRecs = sortByDate(confirmed.filter(r => r.lessonId))
  const indivRecs = sortByDate(confirmed.filter(r => r.individualLessonId))
  const records   = tab === 'group' ? groupRecs : indivRecs

  const total    = confirmed.length
  const attended = confirmed.filter(r => r.present).length
  const percent  = total > 0 ? Math.round((attended / total) * 100) : 0

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Всего уроков" value={total} />
        <Stat label="Посещено"     value={attended} color="text-emerald-600" />
        <Stat label="Процент"      value={`${percent}%`} color="text-blue-600" />
      </div>

      <LessonTypeSwitcher tab={tab} onChange={(t) => { setTab(t); setExpandedId(null) }} />

      {attLoading ? <PageSpinner /> : !records.length ? (
        <EmptyState
          emoji="📋"
          title="Записей нет"
          text="Здесь появятся подтверждённые уроки."
        />
      ) : (
        <div className="space-y-2">
          {records.map(r => {
            const lesson   = r.Lesson || r.IndividualLesson
            const lessonHw = hw.filter(h =>
              (r.lessonId           && h.lessonId           === r.lessonId) ||
              (r.individualLessonId && h.individualLessonId === r.individualLessonId)
            )
            const expanded = expandedId === r.id

            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    r.present ? 'bg-green-400' : 'bg-red-400/70'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">
                      {lesson?.topic || (r.lessonId ? 'Групповой урок' : 'Инд. урок')}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lesson?.date ? formatDate(lesson.date) : '—'}
                      {lesson?.time ? ` · ${lesson.time}` : ''}
                      {r.Lesson?.Group?.name ? ` · ${r.Lesson.Group.name}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lessonHw.length > 0 && (
                      <span className="text-xs bg-blue-600/20 text-blue-600 px-2 py-0.5 rounded-full">
                        ДЗ {lessonHw.length}
                      </span>
                    )}
                    {r.present
                      ? <span className="text-xs bg-green-500/15 text-emerald-600 px-2.5 py-1 rounded-full">Присутствовал</span>
                      : <span className="text-xs bg-red-500/15 text-red-600 px-2.5 py-1 rounded-full">Отсутствовал</span>
                    }
                    <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-slate-200">
                    <div className="pt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Ваш ответ: {r.present ? 'был' : 'не был'}
                      </span>
                      <button
                        disabled={busy[r.id]}
                        onClick={() => handleDispute(r.id, r.present)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600/15 text-red-600 hover:bg-red-600/25 transition-colors cursor-pointer disabled:opacity-50">
                        Оспорить (считаю иначе)
                      </button>
                    </div>
                    {lessonHw.length === 0 ? (
                      <p className="text-sm text-slate-500 pt-3">Домашних заданий к этому уроку нет.</p>
                    ) : (
                      <div className="pt-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Домашние задания</p>
                        <div className="space-y-2">
                          {lessonHw.map(h => (
                            <div key={h.id} className="flex items-start justify-between gap-3 text-sm">
                              <span className="text-slate-600">{h.title || h.description || 'Задание'}</span>
                              {h.deadline && (
                                <span className="text-xs text-slate-500 shrink-0">до {formatDate(h.deadline)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── UI-атомы ──────────────────────────────────────────────── */
function Stat({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
