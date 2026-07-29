import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../components/ui/PageContainer'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import QuizGeneratorPage from './QuizGeneratorPage'
import MyQuizzesPage from './MyQuizzesPage'

// Единая страница «Тесты»: вкладки «Мои тесты» (библиотека) и «Создать» (AI-генератор).
export default function TestsPage() {
  const { t } = useTranslation('app')
  const [tab, setTab] = useState('library') // 'library' | 'create'

  return (
    <PageContainer>
      <PageHeader title={t('nav.tests')} />

      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'library', label: t('quiz.myTitle') },
          { key: 'create',  label: t('dashboard.create') },
        ]}
      />

      {tab === 'library'
        ? <MyQuizzesPage embedded onCreate={() => setTab('create')} />
        : <QuizGeneratorPage embedded />}
    </PageContainer>
  )
}
