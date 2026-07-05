import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth.api'

// Запрос ссылки на сброс пароля. Ответ всегда «успех» — не палим, есть ли email.
export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('')
  const [sent, setSent]           = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Неверный email'); return }
    setSubmitting(true); setError('')
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось отправить письмо')
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

        {sent ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Проверьте почту</h1>
            <p className="mt-2 text-sm text-slate-500">
              Если <b className="text-slate-700">{email}</b> зарегистрирован — мы отправили ссылку для сброса пароля.
              Ссылка действует 1 час.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← Вернуться ко входу
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Сброс пароля</h1>
            <p className="mt-1 text-sm text-slate-500">Укажите email — пришлём ссылку для нового пароля.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input
                  type="email" value={email} autoComplete="email" placeholder="you@mail.com"
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  className={`w-full h-11 px-3.5 rounded-lg bg-white border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/15 ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Отправить ссылку
              </button>
            </form>

            <Link to="/login" className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-900">
              ← Вернуться ко входу
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
