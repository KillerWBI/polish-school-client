import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'

const KEY = 'cookie-consent' // ключ в localStorage — согласие сохраняется, баннер больше не появляется

// Баннер согласия на cookies. Сейчас используются только необходимые cookies (сессия/вход),
// поэтому достаточно информирования + кнопки «Принять». Показывается, пока пользователь не принял.
export default function CookieBanner() {
  const [show, setShow] = useState(false)

  // При монтировании проверяем: если согласия ещё нет — показываем баннер
  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true)
  }, [])

  if (!show) return null

  const accept = () => {
    localStorage.setItem(KEY, 'accepted') // запомнили выбор
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-slate-600 flex-1">
          Мы используем только необходимые cookies для работы сайта и входа в аккаунт. Подробнее — в{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">Политике конфиденциальности</Link>.
        </p>
        <button onClick={accept}
          className="shrink-0 h-9 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          Принять
        </button>
      </div>
    </div>
  )
}
