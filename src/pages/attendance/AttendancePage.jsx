import { useState, useEffect } from 'react'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getGroups, getGroup } from '../../api/groups.api'
import { getLessons } from '../../api/lessons.api'
import { getIndividualLessons } from '../../api/individualLessons.api'
import { getAttendance, saveAttendance } from '../../api/attendance.api'
import { getHomework } from '../../api/homework.api'
import { formatDate } from '../../utils/formatDate'
import { toast, errMsg } from '../../utils/toast'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AttendancePage() {
  const { isTeacher } = useAuth()
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Посещаемость</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isTeacher
            ? 'Выберите группу и урок, затем отметьте присутствие'
            : 'История ваших посещений'}
        </p>
      </div>
      {isTeacher ? <TeacherView /> : <StudentView />}
    </div>
  )
}

/* ─── Переключатель типа урока ─────────────────────────────── */
function TabSwitcher({ tab, onChange }) {
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

/* ─── Учитель ──────────────────────────────────────────────── */
function TeacherView() {
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
      <TabSwitcher tab={tab} onChange={handleTabChange} />

      {tab === 'group' ? (
        <div className={`grid gap-5 ${cols}`}>
          {/* Колонка 1: Группы */}
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

          {/* Колонка 2: Уроки группы */}
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

          {/* Колонка 3: Форма посещаемости */}
          {selectedLesson && (
            <AttendanceForm key={selectedLesson.id} lesson={selectedLesson} lessonType="group" />
          )}
        </div>
      ) : (
        /* Индивидуальные уроки */
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
                    secondary={[
                      formatDate(l.date),
                      l.time,
                      l.student?.name,
                    ].filter(Boolean).join(' · ')}
                  />
                ))}
              </div>
            )}
          </Column>

          {selectedLesson && (
            <AttendanceForm key={selectedLesson.id} lesson={selectedLesson} lessonType="individual" />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Форма посещаемости ───────────────────────────────────── */
function AttendanceForm({ lesson, lessonType }) {
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

  // Заполнение из сохранённых записей
  useEffect(() => {
    if (!existing) return
    const init = {}
    existing.forEach(r => { init[r.studentId] = r.present })
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
      toast.success('Посещаемость сохранена')
      reloadExisting()
    } catch (e) {
      console.error(e)
      toast.error(errMsg(e, 'Ошибка сохранения'))
    } finally {
      setSaving(false)
    }
  }

  if (isGroup && groupLoading) {
    return (
      <Column label="Посещаемость">
        <PageSpinner />
      </Column>
    )
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
        />
        <Button onClick={handleSave} loading={saving} className="w-full mt-3">
          Сохранить
        </Button>
      </Column>
    )
  }

  // Групповой урок
  if (!group?.students?.length) {
    return (
      <Column label="Посещаемость">
        <EmptyState emoji="👤" title="Студентов нет" text="Сначала добавьте студентов в группу." />
      </Column>
    )
  }

  const total   = group.students.length
  const checked = Object.values(present).filter(Boolean).length

  return (
    <Column label={lesson.topic || `Урок ${formatDate(lesson.date)}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">
          {formatDate(lesson.date)}{lesson.time ? ` · ${lesson.time}` : ''} · {checked}/{total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAll(true)}
            className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer">
            Все
          </button>
          <span className="text-slate-600">·</span>
          <button
            onClick={() => setAll(false)}
            className="text-xs text-slate-400 hover:text-white cursor-pointer">
            Никого
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 mb-3">
        {group.students.map(s => (
          <CheckRow
            key={s.id}
            label={s.name}
            sublabel={s.email}
            checked={!!present[s.id]}
            onChange={() => toggle(s.id)}
          />
        ))}
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full">
        Сохранить посещаемость
      </Button>
    </Column>
  )
}

/* ─── Студент ──────────────────────────────────────────────── */
function StudentView() {
  const [tab,        setTab]        = useState('group')
  const [expandedId, setExpandedId] = useState(null)

  const { data: attendance, loading: attLoading } = useFetch(getAttendance)
  const { data: homework }                         = useFetch(getHomework)

  const all = attendance || []
  const hw  = homework   || []

  const sortByDate = (recs) =>
    [...recs].sort((a, b) => {
      const da = a.Lesson?.date || a.IndividualLesson?.date || ''
      const db = b.Lesson?.date || b.IndividualLesson?.date || ''
      return db.localeCompare(da)
    })

  const groupRecs = sortByDate(all.filter(r => r.lessonId))
  const indivRecs = sortByDate(all.filter(r => r.individualLessonId))
  const records   = tab === 'group' ? groupRecs : indivRecs

  const total    = all.length
  const attended = all.filter(r => r.present).length
  const percent  = total > 0 ? Math.round((attended / total) * 100) : 0

  return (
    <div>
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Всего уроков" value={total} />
        <Stat label="Посещено"     value={attended} color="text-green-400" />
        <Stat label="Процент"      value={`${percent}%`} color="text-brand-300" />
      </div>

      <TabSwitcher tab={tab} onChange={(t) => { setTab(t); setExpandedId(null) }} />

      {attLoading ? <PageSpinner /> : !records.length ? (
        <EmptyState
          emoji="📋"
          title="Записей нет"
          text="Здесь появятся уроки после того, как преподаватель отметит посещаемость."
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
                  {/* Цветная точка — присутствие */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    r.present ? 'bg-green-400' : 'bg-red-400/70'
                  }`} />

                  {/* Дата и тема */}
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

                  {/* Бейджи справа */}
                  <div className="flex items-center gap-2 shrink-0">
                    {lessonHw.length > 0 && (
                      <span className="text-xs bg-brand-600/20 text-brand-300 px-2 py-0.5 rounded-full">
                        ДЗ {lessonHw.length}
                      </span>
                    )}
                    {r.present
                      ? <span className="text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full">
                          Присутствовал
                        </span>
                      : <span className="text-xs bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full">
                          Отсутствовал
                        </span>
                    }
                    {/* Стрелка раскрытия */}
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Раскрытая секция: ДЗ */}
                {expanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.05]">
                    {lessonHw.length === 0 ? (
                      <p className="text-sm text-slate-500 pt-3">
                        Домашних заданий к этому уроку нет.
                      </p>
                    ) : (
                      <div className="pt-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                          Домашние задания
                        </p>
                        <div className="space-y-2">
                          {lessonHw.map(h => (
                            <div
                              key={h.id}
                              className="flex items-start justify-between gap-3 text-sm">
                              <span className="text-slate-300">
                                {h.title || h.description || 'Задание'}
                              </span>
                              {h.deadline && (
                                <span className="text-xs text-slate-500 shrink-0">
                                  до {formatDate(h.deadline)}
                                </span>
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

/* ─── UI-компоненты ────────────────────────────────────────── */

// Колонка с заголовком
function Column({ label, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      {children}
    </div>
  )
}

// Карточка-кнопка для выбора группы / урока
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

// Строка с чекбоксом (студент)
function CheckRow({ label, sublabel, checked, onChange }) {
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
      {checked
        ? <span className="text-xs text-green-400 shrink-0">Присутствует</span>
        : <span className="text-xs text-slate-600 shrink-0">Отсутствует</span>
      }
    </label>
  )
}

// Карточка статистики
function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
