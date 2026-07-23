import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import { login as apiLogin, register as apiRegister, registerTeacher as apiRegisterTeacher, fetchMe } from '../../api/auth.api'
import { setToken } from '../../utils/token'

// Отдельная страница авторизации (не модалка). Split-экран:
// слева тёмная бренд-панель (как лендинг), справа светлая форма (как аппа).
// mode: 'login' | 'register'; role: 'teacher' | 'student' (только для register)
export default function AuthPage({ mode = 'login', role = 'teacher' }) {
  const { t } = useTranslation('app')
  const isRegister = mode === 'register'
  const isTeacher = role === 'teacher'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (isRegister && form.name.trim().length < 2) e.name = t('authPage.validName')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('authPage.validEmail')
    if (form.password.length < 6) e.password = t('authPage.validPassword')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const data = isRegister
        ? (isTeacher ? await apiRegisterTeacher(form) : await apiRegister(form))
        : await apiLogin({ email: form.email, password: form.password })
      setToken(data.token)
      const me = await fetchMe()
      login(data.token, me)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.response?.data?.error || t('authPage.genericError') })
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* ЛЕВО — тёмная бренд-панель (десктоп) */}
      <aside className="hidden lg:flex flex-col justify-between w-[44%] max-w-xl bg-[#18181C] text-[#EDEDED] p-12 relative overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_20%,#000_30%,transparent_100%)]" />
        <div className="absolute -top-32 -left-20 w-[500px] h-[400px] rounded-full bg-brand-600/15 blur-[120px]" />

        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <span className="w-2 h-2 rounded-[2px] bg-brand-500" />
          <span className="font-mono text-sm font-semibold">Diklaro</span>
        </Link>

        <div className="relative">
          <p className="mono-label mb-4">{isTeacher ? t('authPage.panelTeacher') : t('authPage.panelStudent')}</p>
          <h1 className="font-display font-bold text-4xl leading-[1.1] tracking-tight">
            {!isRegister ? <>{t('authPage.welcomeBack')}</>
              : isTeacher ? <>{t('authPage.headlineTeacher1')}<br />{t('authPage.headlineTeacher2')}</>
              : <>{t('authPage.headlineStudent1')}<br />{t('authPage.headlineStudent2')}</>}
          </h1>
          <div className="mt-8 space-y-3 font-mono text-[13px] text-[#8A8A8F]">
            {t(isTeacher ? 'authPage.teacherBullets' : 'authPage.studentBullets', { returnObjects: true }).map((b) => (
              <div key={b} className="flex items-center gap-2.5">
                <span className="text-brand-400">$</span> {b}
              </div>
            ))}
          </div>
        </div>

        <p className="relative font-mono text-[12px] text-[#5A5A60]">{t('authPage.panelFoot')}</p>
      </aside>

      {/* ПРАВО — светлая форма */}
      <main className="flex-1 flex flex-col">
        {/* моб. лого */}
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-[#EAECEF]">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-brand-500" />
            <span className="font-mono text-sm font-semibold text-[#0F172A]">Diklaro</span>
          </Link>
          <Link to="/" className="text-sm text-[#64748B] hover:text-[#0F172A]">{t('authPage.backHome')}</Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-[#0F172A] tracking-tight">
              {isRegister ? (isTeacher ? t('authPage.headTeacher') : t('authPage.headStudent')) : t('authPage.headLogin')}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isRegister
                ? (isTeacher ? t('authPage.subTeacher') : t('authPage.subStudent'))
                : t('authPage.subLogin')}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {isRegister && (
                <Field label={t('authPage.labelName')} value={form.name} onChange={(v) => set('name', v)} error={errors.name} autoComplete="name" placeholder={t('authPage.placeholderName')} />
              )}
              <Field label={t('authPage.labelEmail')} type="email" value={form.email} onChange={(v) => set('email', v)} error={errors.email} autoComplete="email" placeholder="you@mail.com" />
              <Field label={t('authPage.labelPassword')} type="password" value={form.password} onChange={(v) => set('password', v)} error={errors.password} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={t('authPage.placeholderPassword')} />

              {!isRegister && (
                <div className="text-right -mt-1">
                  <Link to="/forgot-password" className="text-xs text-[#64748B] hover:text-brand-600">
                    {t('authPage.forgot')}
                  </Link>
                </div>
              )}

              {errors.form && (
                <div className="text-sm text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">{errors.form}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#0B1220] transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isRegister ? t('authPage.createAccount') : t('authPage.login')}
              </button>
            </form>

            {isRegister ? (
              <div className="mt-6 space-y-1.5 text-sm text-center text-[#64748B]">
                <p>{t('authPage.haveAccount')} <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.login')}</Link></p>
                <p>
                  {isTeacher ? `${t('authPage.youAreStudent')} ` : `${t('authPage.youAreTeacher')} `}
                  <Link to={isTeacher ? '/register-student' : '/register'} className="text-brand-600 hover:text-brand-700 font-medium">
                    {isTeacher ? t('authPage.regStudent') : t('authPage.regTeacher')}
                  </Link>
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-center text-[#64748B]">
                {t('authPage.noAccount')}{' '}
                <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.asTeacher')}</Link>
                {' · '}
                <Link to="/register-student" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.asStudent')}</Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, error, autoComplete, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#475569] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full h-11 px-3.5 rounded-lg bg-white border text-[#0F172A] text-sm placeholder:text-[#94A3B8] outline-none transition-colors focus:ring-2 focus:ring-brand-500/20 ${
          error ? 'border-[#FCA5A5] focus:border-[#EF4444]' : 'border-[#E2E5EA] focus:border-brand-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
