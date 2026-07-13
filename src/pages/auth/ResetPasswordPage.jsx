import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { resetPassword } from '../../api/auth.api'

// Новый пароль по токену из письма (?token=...).
export default function ResetPasswordPage() {
  const { t } = useTranslation('app')
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError(t('auth.resetMinChars')); return }
    if (password !== confirm) { setError(t('auth.resetMismatch')); return }
    setSubmitting(true); setError('')
    try {
      await resetPassword(token, password)
      toast.success(t('auth.resetSuccess'))
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || t('auth.resetFail'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-sm p-7">
        <Link to="/" className="flex items-center gap-2 w-fit mb-6">
          <span className="w-2 h-2 rounded-[2px] bg-blue-600" />
          <span className="font-mono text-sm font-semibold text-slate-900">LinguaFlow</span>
        </Link>

        {!token ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900">{t('auth.resetNoTokenTitle')}</h1>
            <p className="mt-2 text-sm text-slate-500">{t('auth.resetNoTokenBody')}</p>
            <Link to="/forgot-password" className="mt-6 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('auth.resetRequestLink')}
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900">{t('auth.resetTitle')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('auth.resetSubtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <PwdField label={t('auth.newPasswordLabel')} placeholder={t('auth.pwdPlaceholder')} value={password} onChange={(v) => { setPassword(v); setError('') }} autoComplete="new-password" />
              <PwdField label={t('auth.repeatPasswordLabel')} placeholder={t('auth.pwdPlaceholder')} value={confirm} onChange={(v) => { setConfirm(v); setError('') }} autoComplete="new-password" />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit" disabled={submitting}
                className="w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('auth.resetBtn')}
              </button>
            </form>

            <Link to="/login" className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-900">
              {t('auth.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function PwdField({ label, value, onChange, autoComplete, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type="password" value={value} autoComplete={autoComplete} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
      />
    </div>
  )
}
