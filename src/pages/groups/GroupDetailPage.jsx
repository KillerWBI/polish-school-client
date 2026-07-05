import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useAuth from '../../hooks/useAuth'
import { getGroup, updateGroup, deleteGroup, addStudent, addPlaceholder, removeStudent, generateLessons } from '../../api/groups.api'
import { getLessons, createLesson, updateLesson, deleteLesson } from '../../api/lessons.api'
import { getMyStudents, mergeStudent, deletePlaceholder } from '../../api/students.api'
import { searchStudent, inviteToGroup } from '../../api/invitations.api'
import { toast } from 'sonner'
import { formatDate, dayLabel } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const DAYS = [
  {value:1,label:'Пн'},{value:2,label:'Вт'},{value:3,label:'Ср'},
  {value:4,label:'Чт'},{value:5,label:'Пт'},{value:6,label:'Сб'},{value:0,label:'Вс'},
]

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isTeacher } = useAuth()
  const [tab, setTab] = useState(0)

  const TABS = isTeacher ? ['Студенты', 'Уроки', 'Настройки'] : ['Студенты', 'Уроки']

  const { data: group, loading, reload } = useFetch(
    useCallback(() => getGroup(id), [id])
  )

  if (loading) return <PageSpinner />
  if (!group)  return <div className="p-8 text-slate-400">Группа не найдена</div>

  const schedule = (group.schedule || [])
    .map(s => `${dayLabel(s.day)} ${s.time}`)
    .join(' · ')

  return (
    <div className="p-5 sm:p-8 max-w-4xl">
      <button onClick={() => navigate('/groups')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 mb-4 cursor-pointer transition-colors">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Группы
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{group.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
          {schedule && <span>📅 {schedule}</span>}
          <span>💰 {group.pricePerLesson} zł / урок</span>
          <span>👥 {group.students?.length ?? 0} студентов</span>
          {group.chatLink && (
            <a href={group.chatLink} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors">
              💬 Чат группы
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-fit mb-6">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <StudentsTab group={group} reload={reload} isTeacher={isTeacher} />}
      {tab === 1 && <LessonsTab  group={group} isTeacher={isTeacher} />}
      {tab === 2 && isTeacher && <SettingsTab group={group} reload={reload} onDeleted={() => navigate('/groups')} />}
    </div>
  )
}

/* ── Студенты ──────────────────────────────────────────────── */
function StudentsTab({ group, reload, isTeacher }) {
  const [addModal, setAddModal] = useState(false)
  const [phModal, setPhModal]   = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [mergeSource, setMergeSource] = useState(null) // заглушка, которую переносим
  const [removing, setRemoving] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null) // заглушка, ждущая подтверждения удаления

  // Реальный ученик: убрать из группы (аккаунт остаётся). Заглушка: удалить целиком (с историей) — через подтверждение.
  const handleRemove = (s) => {
    if (s.isPlaceholder) { setConfirmRemove(s); return }
    setRemoving(s.id)
    removeStudent(group.id, s.id).then(reload).catch(console.error).finally(() => setRemoving(null))
  }

  const confirmDeletePlaceholder = async () => {
    const s = confirmRemove
    setRemoving(s.id)
    try { await deletePlaceholder(s.id); reload() }
    catch (e) { console.error(e) }
    finally   { setRemoving(null); setConfirmRemove(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-slate-400">{group.students?.length ?? 0} студентов</h2>
        {isTeacher && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPhModal(true)}>+ Заглушка</Button>
            <Button size="sm" variant="secondary" onClick={() => setInviteModal(true)}>+ Пригласить</Button>
            <Button size="sm" onClick={() => setAddModal(true)}>+ Добавить</Button>
          </div>
        )}
      </div>

      {!group.students?.length ? (
        <EmptyState emoji="👤" title="Студентов пока нет"
          text={isTeacher ? 'Добавьте ученика по аккаунту или заглушку (без регистрации).' : 'В группе пока никого нет.'}
          action={isTeacher ? <Button size="sm" onClick={() => setAddModal(true)}>Добавить студента</Button> : null} />
      ) : (
        <div className="space-y-2">
          {group.students.map(s => (
            <div key={s.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
                  {s.avatar ? <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" /> : s.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{s.name}</span>
                    {s.isPlaceholder && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/20 shrink-0">
                        заглушка
                      </span>
                    )}
                  </div>
                  {isTeacher && (
                    <div className="text-xs text-slate-400 truncate">
                      {s.isPlaceholder ? (s.contact || 'без контакта') : s.email}
                    </div>
                  )}
                </div>
              </div>
              {isTeacher && (
                <div className="flex items-center gap-1 shrink-0">
                  {s.isPlaceholder && (
                    <button onClick={() => setMergeSource(s)}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 cursor-pointer">
                      Перенести
                    </button>
                  )}
                  <button onClick={() => handleRemove(s)} disabled={removing === s.id}
                    className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 p-1">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <>
          <AddStudentModal open={addModal} onClose={() => setAddModal(false)}
            groupId={group.id} existing={group.students} onAdded={reload} />
          <AddPlaceholderModal open={phModal} onClose={() => setPhModal(false)}
            groupId={group.id} onAdded={reload} />
          <InviteModal open={inviteModal} onClose={() => setInviteModal(false)}
            groupId={group.id} onAdded={reload} />
          <MergeModal key={mergeSource?.id} open={!!mergeSource} onClose={() => setMergeSource(null)}
            source={mergeSource} students={group.students}
            onMerged={() => { setMergeSource(null); reload() }} />
          <ConfirmDialog open={!!confirmRemove} onClose={() => setConfirmRemove(null)}
            onConfirm={confirmDeletePlaceholder} busy={removing === confirmRemove?.id}
            title="Удалить заглушку?"
            message={`«${confirmRemove?.name}» и её посещаемость/долг будут удалены безвозвратно. Чтобы сохранить историю — сначала перенесите на реального ученика.`}
            confirmLabel="Удалить" />
        </>
      )}
    </div>
  )
}

function AddStudentModal({ open, onClose, groupId, existing, onAdded }) {
  const { data: all } = useFetch(getMyStudents, [])
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(null)
  const [error, setError]   = useState('')

  const existIds = new Set((existing || []).map(s => s.id))
  const filtered = (all || []).filter(s =>
    !existIds.has(s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async (studentId) => {
    setAdding(studentId); setError('')
    try { await addStudent(groupId, studentId); onAdded(); onClose() }
    catch (e) { setError(e.response?.data?.error || 'Ошибка добавления') }
    finally   { setAdding(null) }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Добавить студента</h3>
        <Input label="Поиск по имени или email" value={search}
          onChange={e => setSearch(e.target.value)} className="mb-3" />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {!filtered.length
            ? <p className="text-sm text-slate-400 text-center py-4">Студентов не найдено</p>
            : filtered.map(s => (
                <div key={s.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold shrink-0">
                    {s.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-400 truncate">{s.email}</div>
                  </div>
                  <Button size="sm" loading={adding === s.id} onClick={() => handleAdd(s.id)}>Добавить</Button>
                </div>
              ))}
        </div>
      </div>
    </Modal>
  )
}

/* ── Добавление заглушки (ученик без аккаунта) ─────────────── */
function AddPlaceholderModal({ open, onClose, groupId, onAdded }) {
  const [name, setName]       = useState('')
  const [contact, setContact] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const handleClose = () => { setName(''); setContact(''); setError(''); onClose() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Введите имя')
    setSaving(true); setError('')
    try {
      await addPlaceholder(groupId, { name: name.trim(), contact: contact.trim() || undefined })
      onAdded(); handleClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка добавления')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Добавить заглушку</h3>
        <p className="text-xs text-slate-400 mb-4">
          Ученик без аккаунта — для ваших заметок. Долг и посещаемость считаются как у обычного. Позже можно перенести на реального ученика.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Имя" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Контакт (необязательно)" value={contact}
            onChange={e => setContact(e.target.value)} placeholder="телефон / @ник / заметка" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Отмена</Button>
            <Button type="submit" loading={saving} className="flex-1">Добавить</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

/* ── Пригласить студента в группу (C3, по нику) ────────────── */
function InviteModal({ open, onClose, groupId, onAdded }) {
  const [query, setQuery]       = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults]   = useState(null) // массив похожих учеников или null (ещё не искали)
  const [sending, setSending]   = useState(null)  // id ученика, которого приглашаем
  const [error, setError]       = useState('')

  const handleClose = () => {
    setQuery(''); setResults(null); setError(''); onClose()
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 3) return setError('Минимум 3 символа')
    setSearching(true); setError(''); setResults(null)
    try {
      setResults(await searchStudent(q)) // массив [{id,name,username,avatar,alreadyMine}]
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка поиска')
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async (u) => {
    setSending(u.id); setError('')
    try {
      const r = await inviteToGroup(groupId, u.id)
      if (r.directAdd) { toast.success(`${u.name} — уже ваш, добавлен в группу`); onAdded() }
      else             { toast.success(`Приглашение отправлено: ${u.name}`) }
      // убираем из списка, чтобы можно было пригласить других
      setResults(rs => (rs || []).filter(x => x.id !== u.id))
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка отправки')
    } finally {
      setSending(null)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Пригласить студента</h3>
        <p className="text-xs text-slate-400 mb-4">
          Найдите ученика по нику или имени (по похожим). Он получит приглашение и сам подтвердит вступление.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ник или имя" className="flex-1" />
          <Button type="submit" loading={searching}>Найти</Button>
        </form>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        {results && (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-1">
            {!results.length
              ? <p className="text-sm text-slate-400 text-center py-4">Никого не нашли</p>
              : results.map(u => (
                  <div key={u.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold shrink-0 overflow-hidden">
                      {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 truncate">{u.name}</div>
                      <div className="text-xs text-slate-400 truncate">@{u.username}</div>
                    </div>
                    {u.alreadyMine && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-emerald-600 border border-green-500/20 shrink-0">
                        ваш
                      </span>
                    )}
                    <Button size="sm" loading={sending === u.id} onClick={() => handleInvite(u)}>
                      {u.alreadyMine ? 'Добавить' : 'Пригласить'}
                    </Button>
                  </div>
                ))}
          </div>
        )}

        <div className="pt-2">
          <Button variant="secondary" className="w-full" onClick={handleClose}>Закрыть</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Перенос заглушки на реального ученика (merge) ─────────── */
function MergeModal({ open, onClose, source, students, onMerged }) {
  const [targetId, setTargetId] = useState('')
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  // Переносить можно только на реального ученика этой же группы
  const reals = (students || []).filter(s => !s.isPlaceholder)

  const handleMerge = async () => {
    if (!targetId) return setError('Выберите ученика')
    setBusy(true); setError('')
    try {
      const r = await mergeStudent(source.id, targetId)
      toast.success(`Перенесено записей: ${r.moved}${r.skipped ? `, пропущено дублей: ${r.skipped}` : ''}`)
      onMerged()
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка переноса')
      setBusy(false)
    }
  }

  if (!source) return null

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Перенести заглушку</h3>
        <p className="text-xs text-slate-400 mb-4">
          Вся история «{source.name}» (посещаемость, оплаты, ДЗ) перейдёт на выбранного ученика, а заглушка удалится.
        </p>

        {reals.length === 0 ? (
          <>
            <p className="text-sm text-amber-600 mb-4">В этой группе нет реальных учеников (с аккаунтом), на кого перенести.</p>
            <Button variant="secondary" className="w-full" onClick={onClose}>Закрыть</Button>
          </>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
              {reals.map(s => (
                <button key={s.id} type="button" onClick={() => setTargetId(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                    targetId === s.id ? 'bg-blue-600/20 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold shrink-0">
                    {s.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900 truncate">{s.name}</div>
                    <div className="text-xs text-slate-400 truncate">{s.email}</div>
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>Отмена</Button>
              <Button className="flex-1" loading={busy} disabled={!targetId} onClick={handleMerge}>Перенести</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ── Уроки ──────────────────────────────────────────────────── */
function LessonsTab({ group, isTeacher }) {
  const [genModal,    setGenModal]    = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [selected,    setSelected]    = useState(null) // урок для просмотра/редактирования

  const { data: lessons, loading, reload } = useFetch(
    useCallback(() => getLessons({ groupId: group.id }), [group.id])
  )

  const today    = new Date().toISOString().slice(0, 10)
  const upcoming = (lessons || []).filter(l => l.date >= today)
  const past     = (lessons || []).filter(l => l.date <  today)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-slate-400">{lessons?.length ?? 0} уроков</h2>
        {isTeacher && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setGenModal(true)}>⚡ По расписанию</Button>
            <Button size="sm" onClick={() => setCreateModal(true)}>+ Урок</Button>
          </div>
        )}
      </div>

      {loading ? <PageSpinner /> : !lessons?.length ? (
        <EmptyState emoji="📅" title="Уроков пока нет"
          text={isTeacher
            ? 'Сгенерируйте уроки по расписанию или создайте отдельный урок.'
            : 'Преподаватель ещё не создал уроки.'}
          action={isTeacher ? (
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="secondary" onClick={() => setGenModal(true)}>⚡ По расписанию</Button>
              <Button size="sm" onClick={() => setCreateModal(true)}>+ Урок</Button>
            </div>
          ) : null} />
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <LessonSection title="Предстоящие" lessons={upcoming}
              onSelect={setSelected} isTeacher={isTeacher} />
          )}
          {past.length > 0 && (
            <LessonSection title="Прошедшие" lessons={past}
              onSelect={setSelected} isTeacher={isTeacher} muted />
          )}
        </div>
      )}

      {/* Модалки */}
      {isTeacher && (
        <>
          <GenerateLessonsModal open={genModal} onClose={() => setGenModal(false)}
            group={group} onGenerated={reload} />
          <CreateLessonModal open={createModal} onClose={() => setCreateModal(false)}
            groupId={group.id} onCreated={reload} />
        </>
      )}
      {selected && (
        <LessonModal lesson={selected} isTeacher={isTeacher}
          onClose={() => setSelected(null)} onUpdated={() => { reload(); setSelected(null) }}
          onDeleted={() => { reload(); setSelected(null) }} />
      )}
    </div>
  )
}

/* ── Карточка урока ─────────────────────────────────────────── */
function LessonSection({ title, lessons, onSelect, muted }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-2">
        {lessons.map(l => (
          <button key={l.id} onClick={() => onSelect(l)}
            className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-pointer group ${
              muted
                ? 'bg-white border-slate-200 opacity-60 hover:opacity-100 hover:bg-white'
                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-200'
            }`}>
            {/* Дата */}
            <div className="text-center w-10 shrink-0">
              <div className="text-lg font-bold text-slate-900 leading-none">{l.date.slice(8)}</div>
              <div className="text-[10px] text-slate-500">{l.date.slice(5, 7)}/{l.date.slice(0, 4)}</div>
            </div>
            {/* Инфо */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${l.topic ? 'text-slate-900' : 'text-slate-500 italic'}`}>
                {l.topic || 'Без темы'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">{l.time}</span>
                {l.lessonLink && (
                  <span className="text-xs text-blue-600">● ссылка</span>
                )}
                {l.materials?.length > 0 && (
                  <span className="text-xs text-slate-500">{l.materials.length} материал(а)</span>
                )}
              </div>
            </div>
            {/* Бейджи */}
            <div className="flex items-center gap-2 shrink-0">
              {l.Homeworks?.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                  ДЗ {l.Homeworks.length}
                </span>
              )}
              <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Просмотр/редактирование урока ─────────────────────────── */
function LessonModal({ lesson, isTeacher, onClose, onUpdated, onDeleted }) {
  const [editing,  setEditing]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [delConfirm, setDelConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteLesson(lesson.id); onDeleted() }
    catch (e) { console.error(e); setDeleting(false) }
  }

  if (editing) {
    return (
      <Modal open onClose={() => { setEditing(false); onClose() }} maxWidth="max-w-lg">
        <EditLessonForm lesson={lesson}
          onSaved={onUpdated}
          onCancel={() => setEditing(false)} />
      </Modal>
    )
  }

  const linkUrl = lesson.lessonLink || lesson.Group?.lessonLink
  const chatUrl = lesson.Group?.chatLink

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        {/* Заголовок */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">{formatDate(lesson.date)} · {lesson.time}</p>
            <h3 className="text-lg font-semibold text-slate-900">
              {lesson.topic || <span className="text-slate-500 italic">Без темы</span>}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 cursor-pointer shrink-0 p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Описание */}
        {lesson.description && (
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{lesson.description}</p>
        )}

        {/* Ссылка на урок */}
        {linkUrl && (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-200 text-blue-600 text-sm hover:bg-blue-700/30 transition-colors mb-4">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round"/>
            </svg>
            Перейти на урок
          </a>
        )}

        {/* Ссылка на чат группы */}
        {chatUrl && (
          <a href={chatUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 transition-colors mb-4">
            <span>💬</span>
            Чат группы
          </a>
        )}

        {/* Материалы */}
        {lesson.materials?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Материалы</p>
            <MaterialsList materials={lesson.materials} />
          </div>
        )}

        {/* ДЗ */}
        {lesson.Homeworks?.length > 0 && (
          <div className="mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {lesson.Homeworks.length} домашних заданий
            </span>
          </div>
        )}

        {/* Кнопки учителя */}
        {isTeacher && (
          <div className="flex gap-2 pt-2 border-t border-slate-200 mt-4">
            <Button className="flex-1" size="sm" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
            {!delConfirm ? (
              <Button variant="secondary" size="sm"
                className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                onClick={() => setDelConfirm(true)}>
                Удалить
              </Button>
            ) : (
              <Button size="sm" loading={deleting} onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 border-0 text-slate-900">
                Точно удалить
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ── Форма редактирования урока ─────────────────────────────── */
function EditLessonForm({ lesson, onSaved, onCancel }) {
  const [form, setForm] = useState({
    date:        lesson.date        || '',
    time:        lesson.time        || '',
    topic:       lesson.topic       || '',
    description: lesson.description || '',
    lessonLink:  lesson.lessonLink  || '',
  })
  const [materials, setMaterials] = useState(lesson.materials || [])
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await updateLesson(lesson.id, {
        date:        form.date,
        time:        form.time,
        topic:       form.topic.trim()       || null,
        description: form.description.trim() || null,
        lessonLink:  form.lessonLink.trim()  || null,
        materials,
      })
      onSaved()
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-7">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Редактировать урок</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Дата</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Время</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} required
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>
        <Input label="Тема урока (необязательно)" value={form.topic}
          onChange={e => set('topic', e.target.value)} />
        <div>
          <label className="text-xs text-slate-400 block mb-1">Описание (необязательно)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={2} placeholder="Что будем делать на уроке..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500 resize-none" />
        </div>
        <Input label="Ссылка на урок (override, необязательно)" value={form.lessonLink}
          onChange={e => set('lessonLink', e.target.value)} />

        {/* Материалы */}
        <MaterialsEditor materials={materials} onChange={setMaterials} />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Отмена</Button>
          <Button type="submit" loading={saving} className="flex-1">Сохранить</Button>
        </div>
      </form>
    </div>
  )
}

/* ── Создание одиночного урока ──────────────────────────────── */
function CreateLessonModal({ open, onClose, groupId, onCreated }) {
  const [form, setForm] = useState({
    date: '', time: '', topic: '', description: '', lessonLink: '',
  })
  const [materials, setMaterials] = useState([])
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClose = () => {
    setForm({ date: '', time: '', topic: '', description: '', lessonLink: '' })
    setMaterials([])
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time) return setError('Дата и время обязательны')
    setSaving(true); setError('')
    try {
      await createLesson({
        groupId,
        date:        form.date,
        time:        form.time,
        topic:       form.topic.trim()       || null,
        description: form.description.trim() || null,
        lessonLink:  form.lessonLink.trim()  || null,
        materials,
      })
      onCreated()
      handleClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <div className="p-6 sm:p-7">
        <h3 className="text-lg font-semibold text-slate-900 mb-5">Новый урок</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Дата *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Время *</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} required
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <Input label="Тема урока (необязательно)" value={form.topic}
            onChange={e => set('topic', e.target.value)} />
          <div>
            <label className="text-xs text-slate-400 block mb-1">Описание (необязательно)</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="Что будем делать на уроке..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500 resize-none" />
          </div>
          <Input label="Ссылка на урок (необязательно)" value={form.lessonLink}
            onChange={e => set('lessonLink', e.target.value)} />

          <MaterialsEditor materials={materials} onChange={setMaterials} />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Отмена</Button>
            <Button type="submit" loading={saving} className="flex-1">Создать урок</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

/* ── Генерация уроков по расписанию ────────────────────────── */
function GenerateLessonsModal({ open, onClose, group, onGenerated }) {
  // Дефолт: от сегодня до +3 месяца
  const todayStr = new Date().toISOString().slice(0, 10)
  const endDate  = new Date(); endDate.setMonth(endDate.getMonth() + 3)
  const endStr   = endDate.toISOString().slice(0, 10)

  const [from, setFrom] = useState(todayStr)
  const [to,   setTo]   = useState(endStr)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const schedule = (group.schedule || [])
    .map(s => `${dayLabel(s.day)} ${s.time}`)
    .join(', ')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!from || !to) return setError('Укажите обе даты')
    setLoading(true); setError('')
    try {
      const r = await generateLessons(group.id, from, to)
      setResult(r.created)
      onGenerated()
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка генерации')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null); setError('')
    setFrom(todayStr); setTo(endStr)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Сгенерировать по расписанию</h3>
        {schedule && (
          <p className="text-xs text-slate-400 mb-5">Расписание: {schedule}</p>
        )}
        {!schedule && (
          <p className="text-xs text-amber-600 mb-5">⚠️ У группы нет расписания. Сначала добавьте его в «Настройках».</p>
        )}
        {result !== null ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-slate-900 font-medium">Создано {result} уроков</p>
            <p className="text-xs text-slate-400 mt-1">Повторный вызов безопасен — дубли не создаются</p>
            <Button className="mt-4 w-full" onClick={handleClose}>Закрыть</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Начало</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Конец</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Отмена</Button>
              <Button type="submit" loading={loading} disabled={!schedule} className="flex-1">Создать</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

/* ── Редактор материалов ────────────────────────────────────── */
function MaterialsEditor({ materials, onChange }) {
  const add = (type) => onChange([...materials, type === 'link'
    ? { type: 'link', url: '', title: '' }
    : { type: 'text', content: '', title: '' }
  ])

  const remove = (i) => onChange(materials.filter((_, idx) => idx !== i))

  const update = (i, key, val) =>
    onChange(materials.map((m, idx) => idx === i ? { ...m, [key]: val } : m))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">Материалы</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => add('link')}
            className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
            + Ссылка
          </button>
          <button type="button" onClick={() => add('text')}
            className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
            + Текст
          </button>
        </div>
      </div>
      {materials.length === 0 && (
        <p className="text-xs text-slate-600 italic">Нет материалов. Добавьте ссылку или текстовую заметку.</p>
      )}
      <div className="space-y-2">
        {materials.map((m, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{m.type === 'link' ? '🔗 Ссылка' : '📝 Текст'}</span>
              <button type="button" onClick={() => remove(i)}
                className="text-slate-600 hover:text-red-600 cursor-pointer text-xs">✕</button>
            </div>
            <input placeholder="Заголовок (необязательно)" value={m.title || ''}
              onChange={e => update(i, 'title', e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-blue-500 placeholder:text-slate-400" />
            {m.type === 'link' ? (
              <input placeholder="https://..." value={m.url || ''}
                onChange={e => update(i, 'url', e.target.value)}
                className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-blue-500 placeholder:text-slate-400" />
            ) : (
              <textarea placeholder="Текст заметки..." value={m.content || ''}
                onChange={e => update(i, 'content', e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-blue-500 placeholder:text-slate-400 resize-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Отображение материалов ─────────────────────────────────── */
function MaterialsList({ materials }) {
  return (
    <div className="space-y-2">
      {materials.map((m, i) => (
        <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200">
          <span className="text-base shrink-0 mt-0.5">
            {m.type === 'link' ? '🔗' : m.type === 'file' ? '📎' : '📝'}
          </span>
          <div className="flex-1 min-w-0">
            {m.title && <p className="text-xs font-medium text-slate-900 mb-0.5">{m.title}</p>}
            {m.type === 'link' && m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline break-all">
                {m.url}
              </a>
            )}
            {m.type === 'file' && m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline">
                Открыть файл
              </a>
            )}
            {m.type === 'text' && m.content && (
              <p className="text-xs text-slate-600 whitespace-pre-wrap">{m.content}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Настройки ──────────────────────────────────────────────── */
function SettingsTab({ group, reload, onDeleted }) {
  const [form, setForm] = useState({
    name:           group.name,
    pricePerLesson: String(group.pricePerLesson || ''),
    lessonLink:     group.lessonLink || '',
    chatLink:       group.chatLink || '',
  })
  const [schedule,   setSchedule]   = useState(group.schedule || [])
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [delConfirm, setDelConfirm] = useState(false)
  const [error,      setError]      = useState('')
  const [ok,         setOk]         = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addSlot    = () => setSchedule(s => [...s, { day: 1, time: '18:00' }])
  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) =>
    setSchedule(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: key === 'day' ? Number(val) : val } : sl))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Введите название')
    setSaving(true); setError(''); setOk(false)
    try {
      await updateGroup(group.id, {
        name:           form.name.trim(),
        schedule,
        lessonLink:     form.lessonLink.trim() || null,
        chatLink:       form.chatLink.trim() || null,
        pricePerLesson: parseFloat(form.pricePerLesson) || 0,
      })
      reload(); setOk(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteGroup(group.id); onDeleted() }
    catch (e) { setError(e.response?.data?.error || 'Ошибка удаления'); setDeleting(false) }
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSave} className="space-y-3 mb-8">
        <Input label="Название" value={form.name}
          onChange={e => set('name', e.target.value)} />
        <Input label="Цена за урок (zł)" type="number" min="0" value={form.pricePerLesson}
          onChange={e => set('pricePerLesson', e.target.value)} />
        <Input label="Постоянная ссылка Zoom/Meet (необязательно)" value={form.lessonLink}
          onChange={e => set('lessonLink', e.target.value)} />
        <Input label="Ссылка группового чата (необязательно)" value={form.chatLink}
          onChange={e => set('chatLink', e.target.value)} />

        {/* Расписание */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Расписание</span>
            <button type="button" onClick={addSlot}
              className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
              + Добавить слот
            </button>
          </div>
          {schedule.length === 0 && (
            <p className="text-xs text-slate-600 italic mb-2">Нет расписания — добавьте слоты для генерации уроков.</p>
          )}
          <div className="space-y-2">
            {schedule.map((sl, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={sl.day} onChange={e => updateSlot(i, 'day', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500">
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <input type="time" value={sl.time} onChange={e => updateSlot(i, 'time', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500" />
                <button type="button" onClick={() => removeSlot(i)}
                  className="text-slate-500 hover:text-red-600 cursor-pointer p-1">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok    && <p className="text-sm text-emerald-600">✓ Сохранено</p>}
        <Button type="submit" loading={saving} className="w-full">Сохранить изменения</Button>
      </form>

      {/* Удаление */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-medium text-red-600 mb-2">Опасная зона</h3>
        {!delConfirm ? (
          <Button variant="secondary" size="sm"
            onClick={() => setDelConfirm(true)}
            className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50">
            Удалить группу
          </Button>
        ) : (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-600 mb-3">
              Удалить группу «{group.name}»? Все уроки, ДЗ и посещаемость группы будут удалены безвозвратно.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDelConfirm(false)}>Отмена</Button>
              <Button size="sm" loading={deleting} onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 border-0">
                Удалить
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
