import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast, errMsg } from '../../utils/toast'
import { Check, Trash2, Wallet, Clock, CalendarDays, GraduationCap } from 'lucide-react'
import useApiQuery from '../../hooks/useApiQuery'
import { getMyLessons, getMyLessonsStats, createMyLesson, payMyLesson, deleteMyLesson } from '../../api/myLessons.api'
import {
  getStudentTeachers, createStudentTeacher, updateStudentTeacher, deleteStudentTeacher,
} from '../../api/studentTeachers.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { IconNotes, IconProgress, IconSuccess, IconAdd, IconEdit } from '../../components/ui/icons'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Tooltip from '../../components/ui/Tooltip'

const fmt = (n) => `${Math.round(Number(n) || 0)} zł`

// embedded — страница показана вкладкой внутри «Моего дневника», свою шапку не рисует.
export default function MyLessonsPage({ embedded = false }) {
  const { t } = useTranslation('student')
  const [tab, setTab] = useState('schedule')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: lessons, loading, reload } = useApiQuery(['my-lessons'], getMyLessons)
  const { data: stats, reload: reloadStats } = useApiQuery(['my-lessons-stats'], getMyLessonsStats)
  const { data: teachers, reload: reloadTeachers } = useApiQuery(['student-teachers'], getStudentTeachers)

  const refresh = () => { reload(); reloadStats(); reloadTeachers() }

  const addBtn = (
    <Tooltip text={t('myLessons.tipCreate')} side="left">
      <Button size="sm" onClick={() => setCreateOpen(true)}><IconAdd size={15} /> {t('myLessons.addBtn')}</Button>
    </Tooltip>
  )

  const body = (
    <>
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi Icon={CalendarDays} label={t('myLessons.kpiLessons')} value={stats?.lessons ?? 0} color="bg-blue-50 text-blue-600" />
        <Kpi Icon={Clock}        label={t('myLessons.kpiHours')}   value={stats?.hours ?? 0}   color="bg-violet-50 text-violet-600" />
        <Kpi Icon={Wallet}       label={t('myLessons.kpiDebt')}    value={fmt(stats?.debt)}    color="bg-amber-50 text-amber-600" />
        <Kpi Icon={Check}        label={t('myLessons.kpiPaid')}    value={fmt(stats?.paid)}    color="bg-emerald-50 text-emerald-600" />
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'schedule', label: t('myLessons.tabSchedule') },
          { key: 'teachers', label: t('myLessons.tabTeachers') },
          { key: 'subjects', label: t('myLessons.tabSubjects') },
          { key: 'debt',     label: t('myLessons.tabDebt') },
        ]}
      />

      {tab === 'schedule' && <ScheduleTab lessons={lessons} loading={loading} onRefresh={refresh} onAdd={() => setCreateOpen(true)} />}
      {tab === 'debt'     && <ScheduleTab lessons={(lessons || []).filter(l => !l.isPaid && Number(l.pricePerLesson) > 0)} loading={loading} onRefresh={refresh} debtMode />}
      {tab === 'teachers' && <TeachersTab teachers={teachers} onRefresh={refresh} />}
      {tab === 'subjects' && <BreakdownTab map={stats?.bySubject} kind="subject" />}

      {createOpen && (
        <CreateModal
          teachers={teachers || []}
          lessons={lessons || []}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); refresh() }}
          onTeacherAdded={reloadTeachers}
        />
      )}
    </>
  )

  if (embedded) return <div className="space-y-4"><div className="flex justify-end">{addBtn}</div>{body}</div>

  return (
    <PageContainer>
      <PageHeader title={t('myLessons.title')} subtitle={t('myLessons.subtitle')} actions={addBtn} />
      {body}
    </PageContainer>
  )
}

function Kpi({ Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}><Icon className="w-4.5 h-4.5" /></div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

/* ── Список занятий ── */
function ScheduleTab({ lessons, loading, onRefresh, onAdd, debtMode }) {
  const { t, i18n } = useTranslation('student')
  const [busy, setBusy] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const typeLabel = (type) => t(type === 'external' ? 'myLessons.typeExternal' : 'myLessons.typeSelf')

  const pay = async (id) => {
    setBusy(id)
    try { await payMyLesson(id); toast.success(t('myLessons.paidToast')); onRefresh() }
    catch (e) { toast.error(e.response?.data?.error || t('common:error')) }
    finally { setBusy(null) }
  }

  const doDelete = async () => {
    setBusy(confirmDel.id)
    try { await deleteMyLesson(confirmDel.id); setConfirmDel(null); onRefresh() }
    catch (e) { toast.error(e.response?.data?.error || t('common:error')) }
    finally { setBusy(null) }
  }

  if (loading) return <SkeletonList />
  if (!lessons?.length) {
    return debtMode
      ? <EmptyState icon={IconSuccess} title={t('myLessons.noDebtsTitle')} text={t('myLessons.noDebtsText')} />
      : <EmptyState icon={IconNotes} title={t('myLessons.emptyTitle')} text={t('myLessons.emptyText')}
          action={onAdd && <Button size="sm" onClick={onAdd}>{t('myLessons.addLesson')}</Button>} />
  }

  return (
    <div className="space-y-2">
      {lessons.map(l => (
        <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900">{l.subject}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{typeLabel(l.type)}</span>
              {Number(l.pricePerLesson) > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${l.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {l.isPaid ? t('myLessons.paidBadge') : t('myLessons.debtBadge', { amount: fmt(l.pricePerLesson) })}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {new Date(l.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
              {l.time && ` · ${l.time}`}
              {l.durationMin && ` · ${l.durationMin} ${t('myLessons.minShort')}`}
              {l.teacherLabel && ` · ${l.teacherLabel}`}
            </div>
            {l.topic && <div className="text-sm text-slate-600 mt-1">{l.topic}</div>}
            {l.notes && <div className="text-xs text-slate-400 mt-1">{l.notes}</div>}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {!l.isPaid && Number(l.pricePerLesson) > 0 && (
              <Button size="sm" variant="secondary" onClick={() => pay(l.id)} loading={busy === l.id}>
                <Check className="w-3.5 h-3.5 mr-1" /> {t('myLessons.payBtn')}
              </Button>
            )}
            <button onClick={() => setConfirmDel(l)} className="text-slate-300 hover:text-red-500 transition-colors self-end p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title={t('myLessons.deleteTitle')}
        message={t('myLessons.deleteMsg')}
        confirmLabel={t('common:delete')}
        busy={busy === confirmDel?.id}
      />
    </div>
  )
}

/* ── Мои преподаватели: список карточек + «+» → модалка (как везде в приложении) ── */
function TeachersTab({ teachers, onRefresh }) {
  const { t } = useTranslation('student')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const doDelete = async () => {
    setBusy(true)
    try {
      await deleteStudentTeacher(confirmDel.id)
      toast.success(t('myTeachers.deletedToast'))
      setConfirmDel(null)
      onRefresh()
    } catch (e) { toast.error(errMsg(e)) }
    finally { setBusy(false) }
  }

  const openEdit = (tch) => { setEditing(tch); setFormOpen(true) }
  const openNew  = () => { setEditing(null); setFormOpen(true) }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{t('myTeachers.explain')}</p>

      {!teachers?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white">
          <EmptyState
            icon={GraduationCap}
            title={t('myTeachers.emptyTitle')}
            text={t('myTeachers.emptyText')}
            action={<Button size="sm" onClick={openNew}><IconAdd size={15} /> {t('myTeachers.addBtn')}</Button>}
          />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {teachers.map(tch => (
              <div key={tch.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{tch.name}</div>
                  <div className="text-xs text-slate-400">
                    {tch.subject}
                    {Number(tch.pricePerLesson) > 0 && ` · ${fmt(tch.pricePerLesson)}`}
                    {` · ${t('myLessons.lessonsCount', { n: tch.lessons })}`}
                    {tch.contact && ` · ${tch.contact}`}
                  </div>
                </div>
                {tch.debt > 0 && (
                  <span className="text-sm font-semibold text-amber-600 shrink-0">
                    {t('myLessons.debtBadge', { amount: fmt(tch.debt) })}
                  </span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(tch)} className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                    <IconEdit size={16} />
                  </button>
                  <button onClick={() => setConfirmDel(tch)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={openNew}><IconAdd size={15} /> {t('myTeachers.addBtn')}</Button>
        </>
      )}

      {formOpen && (
        <TeacherFormModal
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); onRefresh() }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        title={t('myTeachers.deleteTitle')}
        message={t('myTeachers.deleteMsg')}
        confirmLabel={t('common:delete')}
        busy={busy}
      />
    </div>
  )
}

/* ── Карточка преподавателя: создание и правка ── */
function TeacherFormModal({ editing, onClose, onSaved }) {
  const { t } = useTranslation('student')
  const [f, setF] = useState({
    name:           editing?.name || '',
    subject:        editing?.subject || '',
    pricePerLesson: editing?.pricePerLesson != null ? String(Math.round(Number(editing.pricePerLesson))) : '',
    contact:        editing?.contact || '',
  })
  const [err, setErr]   = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => { setF(s => ({ ...s, [k]: e.target.value })); setErr(s => ({ ...s, [k]: '' })) }

  const submit = async () => {
    // Ошибка заполнения — текстом под полем, без тоста (правило проекта)
    const next = {}
    if (!f.name.trim())    next.name = t('myTeachers.errName')
    if (!f.subject.trim()) next.subject = t('myTeachers.errSubject')
    if (Object.keys(next).length) { setErr(next); return }

    setBusy(true)
    try {
      const payload = {
        name: f.name.trim(),
        subject: f.subject.trim(),
        pricePerLesson: f.pricePerLesson ? Number(f.pricePerLesson) : 0,
        contact: f.contact.trim() || null,
      }
      if (editing) await updateStudentTeacher(editing.id, payload)
      else         await createStudentTeacher(payload)
      toast.success(editing ? t('myTeachers.savedToast') : t('myTeachers.addedToast'))
      onSaved()
    } catch (e) { toast.error(errMsg(e)) }
    finally { setBusy(false) }
  }

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-md"
      title={editing ? t('myTeachers.editTitle') : t('myTeachers.newTitle')}
      subtitle={t('myTeachers.formHint')}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>{t('common:cancel')}</Button>
          <Button className="flex-1" onClick={submit} loading={busy}>{t('common:save')}</Button>
        </>
      }>
      <div className="space-y-3">
        <Input label={t('myTeachers.fName')} value={f.name} onChange={set('name')} error={err.name} placeholder={t('myTeachers.fNamePh')} />
        <Input label={t('myTeachers.fSubject')} value={f.subject} onChange={set('subject')} error={err.subject} placeholder={t('myLessons.fSubjectPh')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('myTeachers.fPrice')} type="number" value={f.pricePerLesson} onChange={set('pricePerLesson')} placeholder="0" />
          <Input label={t('myTeachers.fContact')} value={f.contact} onChange={set('contact')} placeholder={t('myTeachers.fContactPh')} />
        </div>
      </div>
    </Modal>
  )
}

/* ── Разбивка по предметам (по преподавателям — своя вкладка с карточками) ── */
function BreakdownTab({ map }) {
  const { t } = useTranslation('student')
  const entries = Object.entries(map || {})
  if (!entries.length) return <EmptyState icon={IconProgress} title={t('myLessons.noDataTitle')} text={t('myLessons.noDataText')} />

  return (
    <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
      {entries.map(([name, v]) => (
        <div key={name} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
            <span className="text-sm font-semibold">{name[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
            <div className="text-xs text-slate-400">
              {t('myLessons.lessonsCount', { n: v.lessons })}{v.minutes ? ` · ${Math.round(v.minutes / 6) / 10} ${t('myLessons.hoursShort')}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Модалка создания занятия ──
   Преподаватель выбирается из заведённых карточек, а не вписывается заново каждый раз;
   предмет и цена подставляются из карточки, но их можно поменять для конкретного занятия. */
function CreateModal({ teachers, lessons, onClose, onCreated, onTeacherAdded }) {
  const { t } = useTranslation('student')
  const [f, setF] = useState({
    studentTeacherId: '', subject: '', teacherLabel: '', date: '', time: '',
    durationMin: '', topic: '', notes: '', pricePerLesson: '',
    type: 'external', isPaid: false, repeatWeekly: false,
  })
  const [err, setErr]   = useState({})
  const [busy, setBusy] = useState(false)
  const [teacherFormOpen, setTeacherFormOpen] = useState(false)
  const set = (k) => (e) => { setF(s => ({ ...s, [k]: e.target.value })); setErr(s => ({ ...s, [k]: '' })) }

  // Предметы, которые уже встречались — чтобы не печатать одно и то же снова.
  // Список подсказок, а не жёсткий выбор: новое название по-прежнему можно ввести.
  const knownSubjects = [...new Set([
    ...teachers.map(x => x.subject),
    ...lessons.map(l => l.subject),
  ].filter(Boolean))]

  // Выбрали карточку — подставляем её предмет и цену (если поля ещё не трогали)
  const pickTeacher = (e) => {
    const id = e.target.value
    const tch = teachers.find(x => x.id === id)
    setF(s => ({
      ...s,
      studentTeacherId: id,
      subject: tch && !s.subject ? tch.subject : s.subject,
      pricePerLesson: tch && !s.pricePerLesson && Number(tch.pricePerLesson) > 0
        ? String(Math.round(Number(tch.pricePerLesson)))
        : s.pricePerLesson,
    }))
    setErr(s => ({ ...s, subject: '' }))
  }

  const submit = async () => {
    const next = {}
    if (!f.subject.trim()) next.subject = t('myLessons.errSubject')
    if (!f.date)           next.date = t('myLessons.errDate')
    if (Object.keys(next).length) { setErr(next); return }

    setBusy(true)
    try {
      await createMyLesson({
        studentTeacherId: f.type === 'external' && f.studentTeacherId ? f.studentTeacherId : null,
        subject: f.subject,
        teacherLabel: f.type === 'external' && !f.studentTeacherId ? (f.teacherLabel || null) : null,
        date: f.date,
        time: f.time || null,
        durationMin: f.durationMin ? Number(f.durationMin) : null,
        topic: f.topic || null,
        notes: f.notes || null,
        pricePerLesson: f.pricePerLesson ? Number(f.pricePerLesson) : 0,
        isPaid: f.isPaid,
        type: f.type,
        repeatWeekly: f.repeatWeekly,
      })
      toast.success(f.repeatWeekly ? t('myLessons.addedRepeatToast') : t('myLessons.addedToast'))
      onCreated()
    } catch (e) {
      toast.error(errMsg(e))
    } finally { setBusy(false) }
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        maxWidth="max-w-md"
        title={t('myLessons.newTitle')}
        subtitle={t('myLessons.newHint')}
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>{t('common:cancel')}</Button>
            <Button className="flex-1" onClick={submit} loading={busy}>{t('myLessons.addSubmit')}</Button>
          </>
        }>
        <div className="flex gap-2 mb-4">
          {[['external', t('myLessons.modeExternal')], ['self_study', t('myLessons.modeSelf')]].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setF(s => ({ ...s, type: k }))}
              className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${f.type === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {f.type === 'external' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('myLessons.fTeacher')}</label>
              <select value={f.studentTeacherId} onChange={pickTeacher}
                className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15">
                <option value="">{t('myLessons.teacherNone')}</option>
                {teachers.map(x => (
                  <option key={x.id} value={x.id}>{x.name} · {x.subject}</option>
                ))}
              </select>
              {!f.studentTeacherId && (
                <>
                  <Input className="mt-2" value={f.teacherLabel} onChange={set('teacherLabel')} placeholder={t('myLessons.fTeacherPh')} />
                  <button type="button" onClick={() => setTeacherFormOpen(true)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                    <IconAdd size={13} /> {t('myTeachers.addBtn')}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Предмет: подсказываем уже введённые, но ввести новый по-прежнему можно */}
          <div>
            <Input label={t('myLessons.fSubject')} value={f.subject} onChange={set('subject')}
              error={err.subject} placeholder={t('myLessons.fSubjectPh')} list="my-lesson-subjects" />
            <datalist id="my-lesson-subjects">
              {knownSubjects.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label={t('myLessons.fDate')} type="date" value={f.date} onChange={set('date')} error={err.date} />
            <Input label={t('myLessons.fTime')} type="time" value={f.time} onChange={set('time')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('myLessons.fDuration')} type="number" value={f.durationMin} onChange={set('durationMin')} placeholder="60" />
            <Input label={t('myLessons.fPrice')} type="number" value={f.pricePerLesson} onChange={set('pricePerLesson')} placeholder="0" />
          </div>
          <Input label={t('myLessons.fTopic')} value={f.topic} onChange={set('topic')} placeholder={t('myLessons.fTopicPh')} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('myLessons.fNotes')}</label>
            <textarea value={f.notes} onChange={set('notes')} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none" />
          </div>

          {/* Регулярное занятие: создаём это и две следующие недели, дальше ученик добавит сам */}
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={f.repeatWeekly} onChange={e => setF(s => ({ ...s, repeatWeekly: e.target.checked }))}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span>
              {t('myLessons.repeatWeekly')}
              <span className="block text-xs text-slate-400">{t('myLessons.repeatHint')}</span>
            </span>
          </label>

          {Number(f.pricePerLesson) > 0 && !f.repeatWeekly && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={f.isPaid} onChange={e => setF(s => ({ ...s, isPaid: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              {t('myLessons.alreadyPaid')}
            </label>
          )}
        </div>
      </Modal>

      {/* Завести карточку прямо из формы занятия, не теряя заполненное */}
      {teacherFormOpen && (
        <TeacherFormModal
          editing={null}
          onClose={() => setTeacherFormOpen(false)}
          onSaved={() => { setTeacherFormOpen(false); onTeacherAdded?.() }}
        />
      )}
    </>
  )
}
