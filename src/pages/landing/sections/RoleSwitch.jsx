import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'

// Быстрый переключатель между лендингом преподавателя и ученика (в шапке обоих).
// active: 'teacher' | 'student'
export default function RoleSwitch({ active }) {
  const navigate = useNavigate()

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
  const on   = 'bg-white text-[#0A0A0B]'
  const off  = 'text-[#8A8A8F] hover:text-[#EDEDED]'
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-[#1E1E22] bg-[#0D0D0F]">
      <button onClick={() => active !== 'teacher' && go('/')}
        className={`${base} ${active === 'teacher' ? on : off}`}>преподаватель</button>
      <button onClick={() => active !== 'student' && go('/for-students')}
        className={`${base} ${active === 'student' ? on : off}`}>ученик</button>
    </div>
  )
}
