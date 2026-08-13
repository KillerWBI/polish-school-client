import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import { IconChat, IconAI, IconUpload, IconCheck, IconAdd } from '../../components/ui/icons'

/* ─── Примитивы визуализации ─────────────────────────────────
   Mark — подсветка элемента (кольцо + подпись «о чём вопрос»).
   Shot — «мини-скриншот» интерфейса, в котором показываем нужное. */
function Mark({ label, children }) {
  return (
    <div className="relative inline-flex">
      <div className="rounded-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50">{children}</div>
      {label && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-sm z-10">
          {label}
        </span>
      )}
    </div>
  )
}
function Shot({ children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-center min-h-[132px] overflow-hidden">
      {children}
    </div>
  )
}
const Btn = ({ children, tone = 'primary' }) => {
  const cls = tone === 'primary' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
  return <span className={`inline-flex h-9 px-4 items-center gap-1.5 rounded-xl text-sm font-medium ${cls}`}>{children}</span>
}
const Cell = ({ ch, tone }) => {
  const map = { green: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700', empty: 'bg-white text-slate-300' }
  return <span className={`w-9 h-9 inline-flex items-center justify-center rounded-md text-sm font-semibold border border-slate-100 ${map[tone]}`}>{ch}</span>
}
const Kpi = ({ label, value, tone = 'text-slate-900' }) => (
  <div className="w-28 rounded-xl bg-white border border-slate-200 p-2.5">
    <div className="text-[9px] text-slate-400">{label}</div>
    <div className={`text-sm font-semibold ${tone}`}>{value}</div>
  </div>
)
const Tab = ({ children, active }) => (
  <span className={`px-3 py-1 rounded-lg text-xs ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{children}</span>
)

/* ─── Структура справки ──────────────────────────────────────
   Только id секции и картинки. Все тексты — вопросы, ответы, подписи внутри
   макетов — приходят из i18n (help.json). Раньше русский дублировался прямо здесь
   как фолбэк, и при польском интерфейсе макеты всё равно оставались русскими. */

// v — подписи внутри макетов (help:viz.*)
const teacherSections = (v) => [
  {
    id: 'dashboard',
    visuals: [
      <Shot><div className="grid grid-cols-2 gap-2">
        <Mark label={v('studentsDebt')}><Kpi label={v('debt')} value="2 340 zł" tone="text-amber-600" /></Mark>
        <Kpi label={v('lessonsToday')} value="3" />
        <Kpi label={v('hwToCheck')} value="5" />
        <Kpi label={v('attendance')} value="92%" />
      </div></Shot>,
      <Shot><Mark label={v('incomeDebtPotential')}>
        <div className="flex items-end gap-1.5 h-20 rounded-lg bg-white border border-slate-200 px-3 py-2">
          {[50, 70, 45, 85, 60].map((h, i) => <div key={i} className="w-3 rounded-t bg-blue-500/80" style={{ height: `${h}%` }} />)}
        </div>
      </Mark></Shot>,
      <Shot><Mark label={v('quickCreate')}><Btn><IconAdd size={14} /> {v('createBtn')}</Btn></Mark></Shot>,
    ],
  },
  {
    id: 'groups',
    visuals: [
      <Shot><Mark label={v('createGroup')}><Btn><IconAdd size={14} /> {v('createGroupBtn')}</Btn></Mark></Shot>,
      <Shot><div className="flex gap-2">
        <Mark label={v('noAccount')}><Btn tone="ghost"><IconAdd size={14} /> {v('studentNoAccountBtn')}</Btn></Mark>
        <Btn tone="ghost"><IconAdd size={14} /> {v('inviteBtn')}</Btn>
      </div></Shot>,
      <Shot><div className="flex gap-2">
        <Btn tone="ghost"><IconAdd size={14} /> {v('studentNoAccountBtn')}</Btn>
        <Mark label={v('byUsername')}><Btn tone="ghost"><IconAdd size={14} /> {v('inviteBtn')}</Btn></Mark>
      </div></Shot>,
      <Shot><div className="flex gap-1 p-1 rounded-xl bg-slate-100">
        <Tab>{v('tabStudents')}</Tab>
        <Mark label={v('groupLessons')}><Tab active>{v('tabLessons')}</Tab></Mark>
        <Tab>{v('tabSettings')}</Tab>
      </div></Shot>,
      <Shot><Mark label={v('externalChat')}>
        <span className="inline-flex h-9 px-4 items-center gap-1.5 rounded-xl bg-white border border-slate-200 text-sm text-blue-600">
          <IconChat size={14} /> {v('groupChat')}
        </span>
      </Mark></Shot>,
      <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2">
        <span className="text-xs text-slate-900 flex-1">{v('samplePersonNoAccount')}</span>
        <Mark label={v('historyTransfer')}><span className="text-xs text-blue-600 font-medium">{v('transfer')}</span></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'homework',
    visuals: [
      <Shot><Mark label={v('createHw')}><Btn><IconAdd size={14} /> {v('createHwBtn')}</Btn></Mark></Shot>,
      <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 font-medium">{v('samplePerson')}</span>
          <span className="text-slate-400">{v('inReview')}</span>
        </div>
        <Mark label={v('grade0100')}><div className="flex items-center gap-2">
          <span className="w-16 h-8 rounded-lg border border-slate-200 bg-slate-50 inline-flex items-center px-2 text-xs text-slate-400">{v('gradeField')}</span>
          <Btn>{v('setGrade')}</Btn>
        </div></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'attendance',
    visuals: [
      <Shot><div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-14">{v('samplePerson')}</span>
        <Cell ch="✓" tone="green" />
        <Mark label={v('clickWasOrNot')}><Cell ch={v('cellAbsent')} tone="red" /></Mark>
        <Cell ch="·" tone="empty" />
      </div></Shot>,
      <Shot><div className="flex gap-2 items-center">
        <Cell ch="✓" tone="green" /><Cell ch={v('cellAbsent')} tone="red" />
        <Mark label={v('waitingOrDispute')}><Cell ch="✓" tone="amber" /></Mark>
      </div></Shot>,
      <Shot><div className="flex gap-1 p-1 rounded-xl bg-slate-100">
        <Tab>{v('tabJournal')}</Tab><Tab>{v('tabPending')}</Tab>
        <Mark label={v('resolveDispute')}><Tab active>{v('tabDisputed')}</Tab></Mark>
      </div></Shot>,
      <Shot><div className="w-60 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2">
        <span className="text-xs text-slate-700 flex-1">{v('sampleIndLesson')}</span>
        <Mark label={v('wasOrNot')}><div className="flex gap-1">
          <span className="w-8 h-7 rounded-lg bg-emerald-50 text-emerald-600 text-xs inline-flex items-center justify-center">✓</span>
          <span className="w-8 h-7 rounded-lg bg-red-50 text-red-600 text-xs inline-flex items-center justify-center">{v('cellAbsent')}</span>
        </div></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'payments',
    visuals: [
      <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
        <div className="flex-1">
          <div className="text-xs font-medium text-slate-900">{v('samplePerson2')}</div>
          <div className="text-[10px] text-amber-600">{v('debtAmount')}</div>
        </div>
        <Mark label={v('recordPayment')}><Btn>{v('recordBtn')}</Btn></Mark>
      </div></Shot>,
      <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3">
        <Mark label={v('chargedMinusPaid')}><div className="w-full">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '75%' }} /></div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>{v('paidSample')}</span><span>{v('chargedSample')}</span></div>
        </div></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'students',
    visuals: [
      <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
        <div className="flex-1"><div className="text-xs font-medium text-slate-900">{v('samplePerson3')}</div></div>
        <Mark label={v('noAccount')}>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{v('noAccountBadge')}</span>
        </Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'calendar',
    visuals: [
      <Shot><div className="flex gap-2">
        <Mark label={v('groupLesson')}><span className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white">{v('groupLessonSample')}</span></Mark>
        <span className="text-[11px] px-2 py-1 rounded bg-pink-700 text-white">{v('indLessonSample')}</span>
      </div></Shot>,
    ],
  },
  {
    id: 'individual-courses',
    visuals: [
      <Shot><div className="flex gap-2">
        <Mark label={v('oneLesson')}><Btn><IconAdd size={14} /> {v('lessonBtn')}</Btn></Mark>
        <Btn tone="ghost">{v('generateSeries')}</Btn>
      </div></Shot>,
    ],
  },
  {
    id: 'individual-lessons',
    visuals: [
      <Shot><Mark label={v('oneOffLesson')}><Btn><IconAdd size={14} /> {v('createLessonBtn')}</Btn></Mark></Shot>,
    ],
  },
  {
    id: 'profile',
    visuals: [
      <Shot><div className="flex gap-1 border-b border-slate-200">
        <span className="px-3 py-1.5 text-xs text-slate-500">{v('tabProfile')}</span>
        <span className="px-3 py-1.5 text-xs text-slate-500">{v('tabAnalytics')}</span>
        <Mark label={v('changePassword')}><span className="px-3 py-1.5 text-xs text-blue-700 border-b-2 border-blue-600">{v('tabSecurity')}</span></Mark>
      </div></Shot>,
      <Shot><Mark label={v('uploadPhoto')}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
          <IconUpload size={20} />
        </div>
      </Mark></Shot>,
      <Shot><Mark label={v('forInvites')}>
        <span className="inline-flex h-9 px-4 items-center rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-700">@anna_k</span>
      </Mark></Shot>,
    ],
  },
  {
    id: 'quiz',
    visuals: [
      <Shot><Mark label={v('topicToQuiz')}><Btn><IconAI size={14} /> {v('generateBtn')}</Btn></Mark></Shot>,
      <Shot><Mark label={v('toLibrary')}><Btn>{v('saveQuizBtn')}</Btn></Mark></Shot>,
      <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2">
        <span className="text-xs text-slate-900 flex-1">{v('quizSample')}</span>
        <Mark label={v('openAndTake')}><span className="text-xs text-blue-600 font-medium">→</span></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'video-calls',
    visuals: [
      <Shot><Mark label={v('opensMeeting')}>
        <span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm font-medium">{v('joinLesson')}</span>
      </Mark></Shot>,
      <Shot><div className="w-60 rounded-xl bg-white border border-slate-200 p-3 space-y-2">
        <div className="text-[10px] text-slate-500">{v('onJitsiEntry')}</div>
        <Mark label={v('signInGoogleGithub')}>
          <span className="inline-flex h-8 px-3 items-center rounded-lg border border-slate-200 text-xs text-slate-700">{v('iAmHost')}</span>
        </Mark>
      </div></Shot>,
      <Shot><div className="flex gap-2 items-center">
        <Mark label={v('ownOrNewJitsi')}>
          <span className="inline-flex h-8 px-3 items-center rounded-lg bg-slate-100 text-xs text-slate-700">{v('newJitsi')}</span>
        </Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'plans',
    visuals: [
      <Shot><div className="flex gap-2">
        <Mark label={v('current')}><span className="text-[10px] px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium">{v('planFree')}</span></Mark>
        <span className="text-[10px] px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 font-medium">{v('planStandard')}</span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-600 font-medium">{v('planMax')}</span>
      </div></Shot>,
      <Shot><div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500" />
        <div className="text-xs text-slate-900">{v('sampleTeacher')}</div>
        <Mark label={v('clickToPlans')}><span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">{v('planFree')}</span></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'pwa',
    visuals: [
      <Shot><div className="flex gap-3 items-start">
        <div className="text-center">
          <span className="block text-xs font-medium text-slate-700 mb-1">Android</span>
          <div className="text-[9px] text-slate-500 leading-relaxed">{v('androidSteps')}</div>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="text-center">
          <span className="block text-xs font-medium text-slate-700 mb-1">iPhone</span>
          <div className="text-[9px] text-slate-500 leading-relaxed">{v('iphoneSteps')}</div>
        </div>
      </div></Shot>,
      <Shot><Mark label={v('inAddressBar')}>
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 w-56">
          <span className="flex-1">peravenor.com</span><span className="text-blue-600">⊕</span>
        </div>
      </Mark></Shot>,
      <Shot><div className="w-52 rounded-xl bg-white border border-slate-200 p-3 space-y-1">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-600">{v('offlineCache')}</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] text-slate-600">{v('offlineNoWrite')}</span></div>
      </div></Shot>,
    ],
  },
]

const studentSections = (v) => [
  {
    id: 'dashboard',
    visuals: [
      <Shot><div className="grid grid-cols-2 gap-2">
        <Kpi label={v('lessonsCount')} value="3" />
        <Mark label={v('whatToSubmit')}><Kpi label={v('hwToSubmit')} value="2" tone="text-amber-600" /></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'groups',
    visuals: [
      <Shot><div className="w-64 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2">
        <span className="text-xs text-slate-900 flex-1">{v('inviteSample')}</span>
        <span className="text-xs text-slate-400">{v('decline')}</span>
        <Mark label={v('joinGroup')}><Btn>{v('accept')}</Btn></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'homework',
    visuals: [
      <Shot><Mark label={v('attachAndSend')}><Btn><IconUpload size={14} /> {v('submitHwBtn')}</Btn></Mark></Shot>,
      <Shot><Mark label={v('gradeAfterReview')}>
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <IconCheck size={12} /> {v('gradedSample')}
        </span>
      </Mark></Shot>,
    ],
  },
  {
    id: 'attendance',
    visuals: [
      <Shot><div className="flex gap-2">
        <Mark label={v('confirm')}><span className="h-8 px-3 inline-flex items-center rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">{v('wasThere')}</span></Mark>
        <span className="h-8 px-3 inline-flex items-center rounded-lg bg-red-50 text-red-600 text-xs">{v('wasNotThere')}</span>
      </div></Shot>,
    ],
  },
  {
    id: 'payments',
    visuals: [
      <Shot><div className="w-60 rounded-2xl bg-white border border-slate-200 p-3">
        <div className="text-xs font-medium text-slate-900 mb-1">{v('sampleTeacher')}</div>
        <Mark label={v('balanceDue')}><div className="text-lg font-semibold text-amber-600">120 zł</div></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'calendar',
    visuals: [
      <Shot><Mark label={v('callLink')}>
        <span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm">{v('goToLesson')}</span>
      </Mark></Shot>,
    ],
  },
  {
    id: 'profile',
    visuals: [
      <Shot><Mark label={v('howTheyFindYou')}>
        <span className="inline-flex h-9 px-4 items-center rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-700">@anna_k</span>
      </Mark></Shot>,
      <Shot><div className="flex gap-1 border-b border-slate-200">
        <span className="px-3 py-1.5 text-xs text-slate-500">{v('tabProfile')}</span>
        <Mark label={v('changePassword')}><span className="px-3 py-1.5 text-xs text-blue-700 border-b-2 border-blue-600">{v('tabSecurity')}</span></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'quiz',
    visuals: [
      <Shot><Mark label={v('topicToQuiz')}><Btn><IconAI size={14} /> {v('generateBtn')}</Btn></Mark></Shot>,
      <Shot><Mark label={v('gradeAndSave')}>
        <span className="inline-flex items-center h-8 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{v('resultSample')}</span>
      </Mark></Shot>,
      <Shot><div className="w-56 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2">
        <span className="text-xs text-slate-900 flex-1">{v('quizSample')}</span>
        <Mark label={v('yourScore')}><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">4/5</span></Mark>
      </div></Shot>,
    ],
  },
  {
    id: 'video-calls',
    visuals: [
      <Shot><Mark label={v('opensMeeting')}>
        <span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-600 text-white text-sm font-medium">{v('joinLesson')}</span>
      </Mark></Shot>,
      <Shot><div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center"><IconCheck size={12} /></span>
        {v('noSignupNeeded')}
      </div></Shot>,
    ],
  },
  {
    id: 'pwa',
    visuals: [
      <Shot><div className="flex gap-3 items-start">
        <div className="text-center">
          <span className="block text-xs font-medium text-slate-700 mb-1">Android</span>
          <div className="text-[9px] text-slate-500 leading-relaxed">{v('androidSteps')}</div>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="text-center">
          <span className="block text-xs font-medium text-slate-700 mb-1">iPhone</span>
          <div className="text-[9px] text-slate-500 leading-relaxed">{v('iphoneSteps')}</div>
        </div>
      </div></Shot>,
      <Shot><Mark label={v('inAddressBar')}>
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 w-56">
          <span className="flex-1">peravenor.com</span><span className="text-blue-600">⊕</span>
        </div>
      </Mark></Shot>,
    ],
  },
]

export default function HelpPage() {
  const { t } = useTranslation('help')
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { isTeacher } = useAuth()
  // Роль-префикс ключей (t = teacher, s = student)
  const role = isTeacher ? 't' : 's'

  const v = useMemo(() => (key) => t(`viz.${key}`), [t])
  const sections = useMemo(
    () => (isTeacher ? teacherSections(v) : studentSections(v)),
    [isTeacher, v], // t уже учтён через v
  )

  // Скролл к нужной секции по якорю (из кнопки «?» на странице)
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [hash])

  // Запуск интерактивного тура: уходим на дашборд и стартуем после отрисовки.
  const startTour = () => {
    navigate('/dashboard')
    setTimeout(() => window.dispatchEvent(new Event('lf:tour-start')), 400)
  }

  return (
    <PageContainer width="form">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={isTeacher && (
          <button onClick={startTour}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer">
            {t('startTour')}
          </button>
        )}
      />

      {/* быстрые ссылки по разделам */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map(s => (
          <button key={s.id} onClick={() => navigate(`/help#${s.id}`)}
            className="text-xs px-3 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">
            {t(`${role}.${s.id}.title`)}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {sections.map(s => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />{t(`${role}.${s.id}.title`)}
            </h2>
            <div className="space-y-4">
              {s.visuals.map((visual, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{t(`${role}.${s.id}.q${i}`)}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t(`${role}.${s.id}.a${i}`)}</p>
                  </div>
                  <div>{visual}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        {t('footer')}
      </div>
    </PageContainer>
  )
}
