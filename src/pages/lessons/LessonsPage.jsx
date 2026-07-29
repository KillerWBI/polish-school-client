import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import { IconGroups, IconIndividual } from '../../components/ui/icons'
import GroupsPage from '../groups/GroupsPage'
import IndividualCoursesPage from '../individual-courses/IndividualCoursesPage'

// «Занятия» — групповые и индивидуальные в одном месте: логика у них одна,
// различается только формат. Вкладка держится в адресе, чтобы ссылку можно было отправить.
export default function LessonsPage() {
  const { t } = useTranslation('app')
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'individual' ? 'individual' : 'groups'

  const items = [
    { key: 'groups',     label: t('nav.groups'),            icon: IconGroups,     tip: t('lessons.tipGroups') },
    { key: 'individual', label: t('nav.individualCourses'), icon: IconIndividual, tip: t('lessons.tipIndividual') },
  ]

  return (
    <PageContainer>
      <PageHeader title={t('nav.lessons')} subtitle={t('lessons.subtitle')} />
      <Tabs items={items} value={tab} onChange={(k) => setParams(k === 'groups' ? {} : { tab: k })} className="mb-6" />
      {tab === 'groups' ? <GroupsPage embedded /> : <IndividualCoursesPage embedded />}
    </PageContainer>
  )
}
