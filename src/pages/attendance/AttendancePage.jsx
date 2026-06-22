import { useState, useEffect, useCallback } from 'react'
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
  confirmed:       { label: 'Подтверждено',     cls: 'bg-green-500/15 text-green-400' },
  pending_student: { label: 'Ждёт подтверждения', cls: 'bg-yellow-500/15 text-yellow-400' },
  disputed:        { label: 'Спор',             cls: 'bg-red-500/15 text-red-400' },
}

// Бейдж реального статуса записи (НЕ из галочки учителя, а из сохранённой записи).
// confirmed показывает фактический present (был/не был); остальное — статус подтверждения.
function ConfirmBadge({ rec }) {
  if (!rec) return null
  if (rec.status === 'confirmed') {
    return rec.present
      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 shrink-0">✓ Был · подтв.</span>
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
        <h1 className="text-2xl font-semibold text-white">Посещаемость</h1>
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
    <div className="flex gap-1 p-1 bg-white/[0.05] rounded-xl w-fit mb-6">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            mode === t.key
              ? 'bg-brand-600/30 text-brand-300'
              : 'text-slate-400 hover:text-white'
          }`}>
          {t.label}
          {t.count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              mode === t.key ? 'bg-brand-500/40 text-brand-200' : 'bg-white/10 text-slate-300'
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
                <div className="text-sm font-medium text-white">
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
                <div className="text-xs text-yellow-400/80 mt-1">
                  Учитель отметил: {r.teacherMarked ? '✓ Присутствовал' : '✗ Отсутствовал'}
                </div>
              </div>

              {/* Кнопки студента */}
              {!isTeacher && (
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={busy[r.id]}
                    onClick={() => handleStudentConfirm(r.id, true)}
                    className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-medium
                               hover:bg-green-600/30 transition-colors cursor-pointer disabled:opacity-50">
                    Был
                  </button>
                  <button
                    disabled={busy[r.id]}
                    onClick={() => handleStudentConfirm(r.id, false)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-medium
                               hover:bg-red-600/30 transition-colors cursor-pointer disabled:opacity-50">
                    Не был
                  </button>
                </div>
              )}

              {/* Учитель — только инфо, кнопок нет (студент должен ответить) */}
              {isTeacher && (
                <span className="text-xs text-yellow-400/70 shrink-0 mt-1">
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
                <div className="text-sm font-medium text-white">
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
                    r.teacherMarked ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    Учитель: {r.teacherMarked ? 'был' : 'не был'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.studentMarked ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    Студент: {r.studentMarked ? 'был' : 'не был'}
                  </span>
                </div>

                <p className="text-xs text-red-400/70 mt-1">
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
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 text-xs font-medium
                                 hover:bg-blue-600/30 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      Принять студента
                    </button>
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleResolve(r.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white text-xs font-medium
                                 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      Настоять на своём
                    </button>
                  </>
                ) : (
                  <>
                    {/* Студент может изменить свой ответ */}
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleStudentUpdate(r.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-medium
                                 hover:bg-green-600/30 transition-colors cursor-pointer disabled:opacity-50">
                      Был
                    </button>
                    <button
                      disabled={busy[r.id]}
                      onClick={() => handleStudentUpdate(r.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-medium
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
    <div className="flex gap-1 p-1 bg-white/[0.05] rounded-xl w-fit mb-5">
      {[['group', 'Групповые'], ['individual', 'Индивидуальные']].map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === val
              ? 'bg-brand-600/30 text-brand-300'
              : 'text-slate-400 hover:text-white'
          }`}>
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Учитель — журнал ──────────────────────────────────────── */
function TeacherView({ onSaved }) {
  const [tab,            setTab]           = useState('group')
  const [selectedGroup,  setSelectedGroup] = useState(null)
  const [selectedLesson, setSelectedLesson]= useState(null)

  const { data: groups,       loading: groupsLoading  } = useFetch(getGroups)
  const { data: indivLessons, loading: indivLoading   } = useFetch(
    () => tab === 'individual' ? getIndividualLessons() : Promise.resolve([]),
    [tab]
  )
  const { data: groupLessons, loading: lessonsLoading } = useFetch(
    () => selectedGroup ? getLessons({ groupId: selectedGroup.id }) : Promise.resolve([]),
    [selectedGroup?.id]
  )

  const handleTabChange   = (t) => { setTab(t); setSelectedGroup(null); setSelectedLesson(null) }
  const handleGroupSelect = (g) => {
    setSelectedGroup(prev => (prev?.id === g.id ? null : g))
    setSelectedLesson(null)
  }

  const sortByDate = (arr) =>
    [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const cols = !selectedGroup
    ? ''
    : !selectedLesson
      ? 'lg:grid-cols-2'
      : 'lg:grid-cols-3'

  return (
    <div>
      <LessonTypeSwitcher tab={tab} onChange={handleTabChange} />

      {tab === 'group' ? (
        <div className={`grid gap-5 ${cols}`}>
          <Column label="Группа">
            {groupsLoading ? <PageSpinner /> : !groups?.length ? (
              <EmptyState emoji="👥" title="Групп нет" text="Сначала создайте группу." />
            ) : (
              <div className="space-y-2">
                {groups.map(g => (
                  <SelectCard
                    key={g.id}
                    active={selectedGroup?.id === g.id}
                    onClick={() => handleGroupSelect(g)}
                    primary={g.name}
                    secondary={
                      g.schedule && typeof g.schedule === 'object'
                        ? `${g.schedule.day || ''} ${g.schedule.time || ''}`.trim() || null
                        : g.schedule || null
                    }
                  />
                ))}
              </div>
            )}
          </Column>

          {selectedGroup && (
            <Column label="Урок">
              {lessonsLoading ? <PageSpinner /> : !groupLessons?.length ? (
                <EmptyState emoji="📅" title="Уроков нет" text="Создайте уроки для этой группы." />
              ) : (
                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {sortByDate(groupLessons).map(l => (
                    <SelectCard
                      key={l.id}
                      active={selectedLesson?.id === l.id}
                      onClick={() => setSelectedLesson(l)}
                      primary={l.topic || 'Без темы'}
                      secondary={`${formatDate(l.date)}${l.time ? ` · ${l.time}` : ''}`}
                    />
                  ))}
                </div>
              )}
            </Column>
          )}

          {selectedLesson && (
            <AttendanceForm
              key={selectedLesson.id}
              lesson={selectedLesson}
              lessonType="group"
              onSaved={onSaved}
            />
          )}
        </div>
      ) : (
        <div className={`grid gap-5 ${selectedLesson ? 'lg:grid-cols-2' : ''}`}>
          <Column label="Урок">
            {indivLoading ? <PageSpinner /> : !indivLessons?.length ? (
              <EmptyState emoji="👤" title="Уроков нет" text="Индивидуальных уроков пока нет." />
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {sortByDate(indivLessons).map(l => (
                  <SelectCard
                    key={l.id}
                    active={selectedLesson?.id === l.id}
                    onClick={() => setSelectedLesson(l)}
                    primary={l.topic || 'Без темы'}
                    secondary={[formatDate(l.date), l.time, l.student?.name].filter(Boolean).join(' · ')}
                  />
                ))}
              </div>
            )}
          </Column>

          {selectedLesson && (
            <AttendanceForm
              key={selectedLesson.id}
              lesson={selectedLesson}
              lessonType="individual"
              onSaved={onSaved}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Форма посещаемости (учитель заполняет) ────────────────── */
function AttendanceForm({ lesson, lessonType, onSaved }) {
  const isGroup = lessonType === 'group'

  const { data: group, loading: groupLoading } = useFetch(
    () => isGroup ? getGroup(lesson.groupId) : Promise.resolve(null),
    [lesson.groupId, isGroup]
  )
  const { data: existing, reload: reloadExisting } = useFetch(
    () => isGroup
      ? getAttendance({ lessonId: lesson.id })
      : getAttendance({ individualLessonId: lesson.id }),
    [lesson.id, isGroup]
  )

  const [present, setPresent] = useState({})
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!existing) return
    const init = {}
    // Показываем teacherMarked если есть, иначе present (старые записи)
    existing.forEach(r => { init[r.studentId] = r.teacherMarked ?? r.present ?? false })
    setPresent(init)
  }, [existing])

  const toggle = (id) => setPresent(p => ({ ...p, [id]: !p[id] }))
  const setAll = (val) => {
    const students = isGroup
      ? group?.students
      : lesson.student ? [lesson.student] : []
    const all = {}
    students?.forEach(s => { all[s.id] = val })
    setPresent(all)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isGroup) {
        const students = group?.students || []
        const records = students.map(s => ({ studentId: s.id, present: !!present[s.id] }))
        await saveAttendance(lesson.id, records)
      } else {
        const studentId = lesson.studentId
        const records = [{ studentId, present: !!present[studentId] }]
        await saveAttendance(null, records, lesson.id)
      }
      toast.success('Посещаемость отмечена — студенты получат запрос на подтверждение')
      reloadExisting()
      onSaved?.()
    } catch (e) {
      console.error(e)
      toast.error(errMsg(e, 'Ошибка сохранения'))
    } finally {
      setSaving(false)
    }
  }

  if (isGroup && groupLoading) {
    return <Column label="Посещаемость"><PageSpinner /></Column>
  }

  // Индивидуальный урок — один студент
  if (!isGroup) {
    const student = lesson.student
    if (!student) {
      return (
        <Column label="Посещаемость">
          <EmptyState emoji="👤" title="Студент не указан" text="Данные студента недоступны." />
        </Column>
      )
    }
    return (
      <Column label={lesson.topic || `Урок ${formatDate(lesson.date)}`}>
        <p className="text-xs text-slate-500 mb-3">
          {formatDate(lesson.date)}{lesson.time ? ` · ${lesson.time}` : ''}
        </p>
        <CheckRow
          label={student.name}
          sublabel={student.email}
          checked={!!present[student.id]}
          onChange={() => toggle(student.id)}
          rightSlot={(() => { const rec = existing?.find(r => r.studentId === student.id); return rec ? <ConfirmBadge rec={rec} /> : undefined })()}
        />
        <Button onClick={handleSave} loading={saving} className="w-full mt-3">
          Отметить и отправить студенту
        </Button>
      </Column>
    )
  }

  if (!group?.students?.length) {
    return (
      <Column label="Посещаемость">
        <EmptyState emoji="👤" title="Студентов нет" text="Сначала добавьте студентов в группу." />
      </Column>
    )
  }

  const total   = group.students.length
  const checked = Object.values(present).filter(Boolean).length
  const recByStudent     = new Map((existing || []).map(r => [r.studentId, r]))
  // «Присутствует» = только подтверждённые присутствия, а не галочки учителя
  const confirmedPresent = (existing || []).filter(r => r.status === 'confirmed' && r.present).length

  return (
    <Column label={lesson.topic || `Урок ${formatDate(lesson.date)}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">
          {formatDate(lesson.date)}{lesson.time ? ` · ${lesson.time}` : ''} · отмечено {checked}/{total} · присутствует (подтв.) {confirmedPresent}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setAll(true)}  className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer">Все</button>
          <span className="text-slate-600">·</span>
          <button onClick={() => setAll(false)} className="text-xs text-slate-400 hover:text-white cursor-pointer">Никого</button>
        </div>
      </div>

      {/* Статусы уже отмеченных студентов */}
      {existing?.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <p className="text-xs text-slate-500 mb-1.5">Статус подтверждений</p>
          <div className="space-y-1">
            {group.students.map(s => {
              const rec = existing.find(r => r.studentId === s.id)
              const badge = rec && STATUS_BADGE[rec.status]
              if (!badge) return null   // нет записи/неизвестный статус → не угадываем
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{s.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 mb-3">
        {group.students.map(s => {
          const rec = recByStudent.get(s.id)
          return (
            <CheckRow
              key={s.id}
              label={s.name}
              sublabel={s.email}
              checked={!!present[s.id]}
              onChange={() => toggle(s.id)}
              rightSlot={rec ? <ConfirmBadge rec={rec} /> : undefined}
            />
          )
        })}
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full">
        Отметить посещаемость
      </Button>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Студенты получат запрос на подтверждение
      </p>
    </Column>
  )
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
        <Stat label="Посещено"     value={attended} color="text-green-400" />
        <Stat label="Процент"      value={`${percent}%`} color="text-brand-300" />
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
                className="rounded-xl border border-white/[0.07] bg-white/[0.04] overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    r.present ? 'bg-green-400' : 'bg-red-400/70'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
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
                      <span className="text-xs bg-brand-600/20 text-brand-300 px-2 py-0.5 rounded-full">
                        ДЗ {lessonHw.length}
                      </span>
                    )}
                    {r.present
                      ? <span className="text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full">Присутствовал</span>
                      : <span className="text-xs bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full">Отсутствовал</span>
                    }
                    <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.05]">
                    <div className="pt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Ваш ответ: {r.present ? 'был' : 'не был'}
                      </span>
                      <button
                        disabled={busy[r.id]}
                        onClick={() => handleDispute(r.id, r.present)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors cursor-pointer disabled:opacity-50">
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
                              <span className="text-slate-300">{h.title || h.description || 'Задание'}</span>
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
function Column({ label, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      {children}
    </div>
  )
}

function SelectCard({ active, onClick, primary, secondary }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
        active
          ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
          : 'bg-white/[0.04] border-white/[0.07] text-white hover:bg-white/[0.07] hover:border-white/[0.14]'
      }`}>
      <div className="text-sm font-medium">{primary}</div>
      {secondary && (
        <div className={`text-xs mt-0.5 ${active ? 'text-brand-400/70' : 'text-slate-400'}`}>
          {secondary}
        </div>
      )}
    </button>
  )
}

// rightSlot — что показать справа. Если передан (есть сохранённая запись) —
// показываем реальный статус подтверждения. Иначе (новая отметка) — состояние галочки.
function CheckRow({ label, sublabel, checked, onChange, rightSlot }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer transition-colors">
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
        checked ? 'bg-brand-600 border-brand-600' : 'border-white/30 bg-transparent'
      }`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {sublabel && <div className="text-xs text-slate-400 truncate">{sublabel}</div>}
      </div>
      {rightSlot !== undefined
        ? rightSlot
        : (checked
            ? <span className="text-xs text-green-400 shrink-0">Присутствует</span>
            : <span className="text-xs text-slate-600 shrink-0">Отсутствует</span>)}
    </label>
  )
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
