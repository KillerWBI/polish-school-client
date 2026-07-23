import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

// Быстрый переключатель между лендингом преподавателя и ученика (в шапке обоих).
// active: 'teacher' | 'student'
export default function RoleSwitch({ active }) {
  const navigate = useNavigate()
  const { t } = useTranslation('landing')

  // Плавный переход через View Transitions API. flushSync — чтобы навигация (смена DOM)
  // произошла СИНХРОННО внутри колбэка startViewTransition (иначе браузер не снимет «новую» страницу).
  // Нет поддержки API → обычный переход.
  const go = (to) => {
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => flushSync(() => navigate(to)))
    } else {
      navigate(to)
    }
  }

  const base = 'h-7 px-3 rounded-md text-[12px] font-mono transition-colors cursor-pointer'
  const on   = 'bg-white text-[#18181C]'
  const off  = 'text-[#8A8A8F] hover:text-[#EDEDED]'
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-[#303036] bg-[#1D1D22]">
      <button onClick={() => active !== 'teacher' && go('/')}
        className={`${base} ${active === 'teacher' ? on : off}`}>{t('roleSwitch.teacher')}</button>
      <button onClick={() => active !== 'student' && go('/for-students')}
        className={`${base} ${active === 'student' ? on : off}`}>{t('roleSwitch.student')}</button>
    </div>
  )
}
