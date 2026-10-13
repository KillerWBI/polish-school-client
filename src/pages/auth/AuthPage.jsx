import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import { login as apiLogin, register as apiRegister, registerTeacher as apiRegisterTeacher, fetchMe } from '../../api/auth.api'
import { setToken } from '../../utils/token'
import AuthLayout from './AuthLayout'

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
  // Токен приглашения приходит в адресе (?invite=…) и молча уходит на сервер:
  // человеку про него знать незачем — он видит обычную форму регистрации.
  const [params] = useSearchParams()
  const invite = params.get('invite') || undefined

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Смена роли на форме регистрации: ?invite и прочие параметры уезжают вместе с человеком,
  // введённое в поля не теряется (компонент тот же, меняется только адрес).
  const switchRole = (to) => {
    if (to === role) return
    const qs = params.toString()
    navigate((to === 'teacher' ? '/register' : '/register-student') + (qs ? `?${qs}` : ''), { replace: true })
  }

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
        ? (isTeacher ? await apiRegisterTeacher({ ...form, invite }) : await apiRegister({ ...form, invite }))
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
    <AuthLayout
      panelLabel={isTeacher ? t('authPage.panelTeacher') : t('authPage.panelStudent')}
      panelTitle={
        !isRegister ? <>{t('authPage.welcomeBack')}</>
          : isTeacher ? <>{t('authPage.headlineTeacher1')}<br />{t('authPage.headlineTeacher2')}</>
          : <>{t('authPage.headlineStudent1')}<br />{t('authPage.headlineStudent2')}</>
      }
      panelBullets={t(isTeacher ? 'authPage.teacherBullets' : 'authPage.studentBullets', { returnObjects: true })}
    >
      <>
            <h2 className="text-2xl font-semibold text-[#0F172A] tracking-tight">
              {isRegister ? (isTeacher ? t('authPage.headTeacher') : t('authPage.headStudent')) : t('authPage.headLogin')}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isRegister
                ? (isTeacher ? t('authPage.subTeacher') : t('authPage.subStudent'))
                : t('authPage.subLogin')}
            </p>

            {/* Кто регистрируется — выбор на виду, а не ссылкой мелким шрифтом под формой:
                раньше человек не понимал, в какой аккаунт он сейчас регистрируется. */}
            {isRegister && (
              <div className="mt-6">
                <p className="text-xs font-medium text-[#475569] mb-2">{t('authPage.chooseRole')}</p>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  <RoleCard active={isTeacher} onClick={() => switchRole('teacher')}
                    title={t('authPage.roleTeacher')} hint={t('authPage.roleTeacherHint')} />
                  <RoleCard active={!isTeacher} onClick={() => switchRole('student')}
                    title={t('authPage.roleStudent')} hint={t('authPage.roleStudentHint')} />
                </div>
              </div>
            )}
            {!isRegister && (
              <p className="mt-4 text-xs text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-2">
                {t('authPage.loginHint')}
              </p>
            )}

            <form onSubmit={handleSubmit} className={`${isRegister ? 'mt-5' : 'mt-6'} space-y-4`}>
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
              <div className="mt-6 text-sm text-center text-[#64748B]">
                <p>{t('authPage.haveAccount')} <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.login')}</Link></p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-center text-[#64748B]">
                {t('authPage.noAccount')}{' '}
                <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.asTeacher')}</Link>
                {' · '}
                <Link to="/register-student" className="text-brand-600 hover:text-brand-700 font-medium">{t('authPage.asStudent')}</Link>
              </p>
            )}
      </>
    </AuthLayout>
  )
}

function RoleCard({ active, onClick, title, hint }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`text-left rounded-xl border px-3 py-2.5 transition-colors cursor-pointer ${
        active
          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
          : 'border-[#E2E5EA] bg-white hover:border-[#CBD5E1]'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${active ? 'border-teal-500 bg-teal-500 shadow-[inset_0_0_0_2px_#fff]' : 'border-[#CBD5E1]'}`} />
        <span className={`text-sm font-semibold ${active ? 'text-teal-800' : 'text-[#0F172A]'}`}>{title}</span>
      </span>
      <span className="block mt-1 text-[11.5px] leading-snug text-[#64748B]">{hint}</span>
    </button>
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
