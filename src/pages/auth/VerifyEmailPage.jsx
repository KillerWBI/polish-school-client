import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { verifyEmail } from '../../api/auth.api'
import useAuth from '../../hooks/useAuth'

export default function VerifyEmailPage() {
  const { t } = useTranslation('app')
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const { user, updateUser } = useAuth()
  const token       = params.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error | already
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('auth.verifyNoToken'))
      return
    }
    verifyEmail(token)
      .then((data) => {
        if (data.alreadyVerified) {
          setStatus('already')
          setMessage(t('auth.verifyAlready'))
        } else {
          setStatus('success')
          setMessage(t('auth.verifySuccessMsg'))
          if (user) updateUser({ emailVerified: true })
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.error || t('auth.verifyGenericErr'))
      })
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
          <span className="text-slate-900 text-2xl font-bold">L</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="inline-flex w-10 h-10 mb-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            <h1 className="text-xl font-semibold text-slate-900">{t('auth.verifyLoading')}</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex w-14 h-14 mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgb(52 211 153)" strokeWidth="2.5">
                <path d="M5 12l5 5 9-12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{message}</h1>
            <p className="text-sm text-slate-400 mb-6">{t('auth.verifySuccessSub')}</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? t('auth.toDashboard') : t('auth.login')}
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
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{message}</h1>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-100 text-slate-900 text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? t('auth.toDashboard') : t('auth.login')}
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
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{t('auth.verifyFailTitle')}</h1>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-100 text-slate-900 text-sm font-medium transition-colors cursor-pointer"
            >
              {user ? t('auth.toDashboard') : t('auth.home')}
            </button>
            {user && (
              <p className="text-xs text-slate-500 mt-3">
                {t('auth.verifyResendHint')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
