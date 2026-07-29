import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import { IconNotes, IconMyLessons, IconProgress } from '../../components/ui/icons'
import NotesPage from '../notes/NotesPage'
import MyLessonsPage from '../my-lessons/MyLessonsPage'
import ProgressPage from '../progress/ProgressPage'

// «Мой дневник» — личные записи ученика и его статистика в одном месте.
const TABS = { notes: NotesPage, lessons: MyLessonsPage, progress: ProgressPage }

export default function DiaryPage() {
  const { t } = useTranslation('app')
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'notes'
  const Body = TABS[tab]

  const items = [
    { key: 'notes',    label: t('nav.notes'),     icon: IconNotes,     tip: t('diary.tipNotes') },
    { key: 'lessons',  label: t('nav.myLessons'), icon: IconMyLessons, tip: t('diary.tipLessons') },
    { key: 'progress', label: t('nav.progress'),  icon: IconProgress,  tip: t('diary.tipProgress') },
  ]

  return (
    <PageContainer>
      <PageHeader title={t('nav.diary')} subtitle={t('diary.subtitle')} />
      <Tabs items={items} value={tab} onChange={(k) => setParams(k === 'notes' ? {} : { tab: k })} className="mb-6" />
      <Body embedded />
    </PageContainer>
  )
}
