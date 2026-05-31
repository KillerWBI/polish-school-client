import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../../api/auth.api'
import useAuth from '../../hooks/useAuth'

export default function VerifyEmailPage() {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const { user, updateUser } = useAuth()
  const token       = params.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error | already
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Токен не найден в ссылке')
      return
    }
    verifyEmail(token)
      .then((data) => {
        if (data.alreadyVerified) {
          setStatus('already')
          setMessage('Email уже был подтверждён ранее')
        } else {
          setStatus('success')
          setMessage('Email успешно подтверждён!')
          if (user) updateUser({ emailVerified: true })
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Ошибка подтверждения')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-brand-500 to-pink-accent">
          <span className="text-white text-2xl font-bold">L</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="inline-flex w-10 h-10 mb-4 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
            <h1 className="text-xl font-semibold text-white">Подтверждаем email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex w-14 h-14 mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgb(52 211 153)" strokeWidth="2.5">
                <path d="M5 12l5 5 9-12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">{message}</h1>
            <p className="text-sm text-slate-400 mb-6">Теперь у вас полный доступ ко всем функциям.</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/teacher-login')}
              className="h-11 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? 'В кабинет' : 'Войти'}
            </button>
          </>
        )}

        {status === 'already' && (
          <>
            <div className="inline-flex w-14 h-14 mb-4 rounded-full bg-blue-500/15 border border-blue-500/30 items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgb(96 165 250)" strokeWidth="2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v4M12 16v0" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">{message}</h1>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/teacher-login')}
              className="h-11 px-6 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? 'В кабинет' : 'Войти'}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex w-14 h-14 mb-4 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgb(248 113 113)" strokeWidth="2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Не удалось подтвердить</h1>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="h-11 px-6 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? 'В кабинет' : 'На главную'}
            </button>
            {user && (
              <p className="text-xs text-slate-500 mt-3">
                В кабинете можно отправить новое письмо.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
