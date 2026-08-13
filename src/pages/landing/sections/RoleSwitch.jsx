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

  const base = 'h-8 px-3 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer'
  const on   = 'bg-white text-[#0E1726] shadow-[0_1px_3px_rgba(16,24,40,0.12)]'
  const off  = 'text-[#5A6B7C] hover:text-[#0E1726]'
  return (
    <div className="hidden sm:inline-flex items-center gap-0.5 p-1 rounded-xl border border-[#EDF1F4] bg-[#F1F5F6]">
      <button onClick={() => active !== 'teacher' && go('/')}
        className={`${base} ${active === 'teacher' ? on : off}`}>{t('roleSwitch.teacher')}</button>
      <button onClick={() => active !== 'student' && go('/for-students')}
        className={`${base} ${active === 'student' ? on : off}`}>{t('roleSwitch.student')}</button>
    </div>
  )
}
