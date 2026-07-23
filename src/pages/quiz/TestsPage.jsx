import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../components/ui/PageContainer'
import QuizGeneratorPage from './QuizGeneratorPage'
import MyQuizzesPage from './MyQuizzesPage'

// Единая страница «Тесты»: вкладки «Мои тесты» (библиотека) и «Создать» (AI-генератор).
export default function TestsPage() {
  const { t } = useTranslation('app')
  const [tab, setTab] = useState('library') // 'library' | 'create'

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">{t('nav.tests')}</h1>

      <div className="inline-flex p-0.5 mb-6 rounded-xl bg-slate-100 border border-slate-200">
        <TabBtn active={tab === 'library'} onClick={() => setTab('library')}>{t('quiz.myTitle')}</TabBtn>
        <TabBtn active={tab === 'create'}  onClick={() => setTab('create')}>{t('dashboard.create')}</TabBtn>
      </div>

      {tab === 'library'
        ? <MyQuizzesPage embedded onCreate={() => setTab('create')} />
        : <QuizGeneratorPage embedded />}
    </PageContainer>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}
