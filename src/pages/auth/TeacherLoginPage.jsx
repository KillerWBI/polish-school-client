import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { login as apiLogin, registerTeacher as apiRegister, fetchMe } from '../../api/auth.api'
import useAuth from '../../hooks/useAuth'
import { setToken } from '../../utils/token'

export default function TeacherLoginPage() {
  const navigate       = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user?.role === 'teacher') navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const [tab, setTab]           = useState('login')  // 'login' | 'register'
  const [success, setSuccess]   = useState(false)
  const [teacherName, setTeacherName] = useState('')

  const rootRef    = useRef(null)
  const tabsRef    = useRef(null)
  const indicatorRef = useRef(null)
  const successRef = useRef(null)
  const canvasRef  = useRef(null)

  // Анимированные частицы на фоне
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.35 + 0.1,
    }))
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0) d.x = canvas.width
        if (d.x > canvas.width) d.x = 0
        if (d.y < 0) d.y = canvas.height
        if (d.y > canvas.height) d.y = 0
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,92,246,${d.o})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Появление формы (StrictMode-safe)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-tl-anim]',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Индикатор таба
  useEffect(() => {
    if (!tabsRef.current || !indicatorRef.current) return
    const btn = tabsRef.current.querySelector(`[data-tab="${tab}"]`)
    if (!btn) return
    gsap.to(indicatorRef.current, { x: btn.offsetLeft, width: btn.offsetWidth, duration: 0.35, ease: 'power3.out' })
  }, [tab])

  // Анимация успеха
  useEffect(() => {
    if (!success || !successRef.current) return
    const tl = gsap.timeline()
    tl.from('[data-success-line]', { y: 60, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 })
    tl.from('[data-success-bar]',  { scaleX: 0, duration: 1.2, ease: 'power2.inOut', transformOrigin: 'left' }, '-=0.3')
    tl.call(() => setTimeout(() => navigate('/dashboard', { replace: true }), 600), null, '+=0.8')
  }, [success, navigate])

  const handleSuccess = async (token) => {
    setToken(token)
    const me = await fetchMe()
    if (me.role !== 'teacher') throw new Error('not-teacher')
    login(token, me)
    setTeacherName(me.name?.split(' ')[0] || 'Преподаватель')
    setSuccess(true)
  }

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#080B14] flex flex-col overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div aria-hidden className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-700 opacity-[0.07] blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-accent opacity-[0.07] blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent" />

      {/* Хедер */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Вернуться на сайт
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-pink-accent opacity-80" />
          <span className="text-white/70 text-sm font-medium tracking-tight">
            P<span className="text-brand-400">L</span>atform
          </span>
        </div>
      </header>

      {/* Форма */}
      {!success && (
        <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">

            {/* Иконка */}
            <div data-tl-anim className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-pink-accent flex items-center justify-center mb-7 shadow-brand">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="white" strokeWidth="1.8"/>
                <path d="M3 20c0-3.3 4-6 9-6s9 2.7 9 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>

            <p data-tl-anim className="text-brand-400 text-xs font-medium uppercase tracking-widest mb-2">
              Портал преподавателя
            </p>
            <h1 data-tl-anim className="text-3xl font-semibold text-white mb-6 tracking-tight">
              {tab === 'login' ? 'Войти в кабинет' : 'Создать аккаунт'}
            </h1>

            {/* Табы */}
            <div data-tl-anim ref={tabsRef}
              className="relative flex p-1 bg-white/[0.06] rounded-xl mb-6">
              <div ref={indicatorRef}
                className="absolute top-1 bottom-1 left-0 bg-white/[0.12] rounded-lg border border-white/[0.10]" />
              {[['login','Вход'],['register','Регистрация']].map(([key, label]) => (
                <button key={key} data-tab={key} type="button"
                  onClick={() => setTab(key)}
                  className={`relative z-10 flex-1 h-10 text-sm font-medium transition-colors cursor-pointer ${
                    tab === key ? 'text-white' : 'text-slate-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Форма */}
            <div data-tl-anim>
              {tab === 'login'
                ? <LoginForm onSuccess={handleSuccess} />
                : <RegisterForm onSuccess={handleSuccess} />
              }
            </div>
          </div>
        </main>
      )}

      {/* Полноэкранная анимация успеха */}
      {success && (
        <div ref={successRef}
          className="fixed inset-0 z-50 bg-[#080B14] flex flex-col items-center justify-center px-6 text-center">
          <div aria-hidden className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-700 opacity-[0.08] blur-3xl" />
          <div aria-hidden className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-pink-accent opacity-[0.08] blur-3xl" />
          <p data-success-line className="text-brand-400 text-xs font-medium uppercase tracking-[0.25em] mb-4">
            Добро пожаловать
          </p>
          <h1 data-success-line className="text-[clamp(2.5rem,8vw,6rem)] font-semibold tracking-tight text-white leading-none mb-3">
            {teacherName}
          </h1>
          <p data-success-line className="text-slate-400 text-lg mb-10">
            Переходим в кабинет преподавателя…
          </p>
          <div data-success-line className="w-48 h-px bg-slate-700 rounded-full overflow-hidden">
            <div data-success-bar className="h-full bg-gradient-to-r from-brand-500 to-pink-accent origin-left" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Форма входа ────────────────────────────────────────────── */
function LoginForm({ onSuccess }) {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Неверный email'
    if (form.password.length < 6) e.password = 'Минимум 6 символов'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await apiLogin({ email: form.email, password: form.password })
      await onSuccess(data.token)
    } catch (err) {
      const msg = err.message === 'not-teacher'
        ? 'Этот аккаунт не является преподавательским'
        : err.response?.data?.error || 'Неверный email или пароль'
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <DarkInput label="Email" type="email" value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email} autoComplete="email" />
      <DarkInput label="Пароль" type="password" value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        error={errors.password} autoComplete="current-password" />
      {errors.form && <ErrorBanner>{errors.form}</ErrorBanner>}
      <SubmitBtn loading={loading}>Войти</SubmitBtn>
    </form>
  )
}

/* ── Форма регистрации ──────────────────────────────────────── */
function RegisterForm({ onSuccess }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2)                          e.name = 'Введите имя'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))      e.email = 'Неверный email'
    if (form.password.length < 6)                             e.password = 'Минимум 6 символов'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await apiRegister(form)
      await onSuccess(data.token)
    } catch (err) {
      const msg = err.response?.data?.error || 'Ошибка регистрации'
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <DarkInput label="Имя" value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        error={errors.name} autoComplete="name" />
      <DarkInput label="Email" type="email" value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email} autoComplete="email" />
      <DarkInput label="Пароль" type="password" value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        error={errors.password} autoComplete="new-password" />
      {errors.form && <ErrorBanner>{errors.form}</ErrorBanner>}
      <SubmitBtn loading={loading}>Создать аккаунт</SubmitBtn>
    </form>
  )
}

/* ── Переиспользуемые UI ────────────────────────────────────── */
function DarkInput({ label, type = 'text', error, value, onChange, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const active = focused || !!value
  return (
    <div className="relative">
      <input type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className={`w-full h-14 px-4 pt-5 pb-1 text-[15px] text-white rounded-xl outline-none transition-all duration-200 ${
          error
            ? 'bg-red-500/10 border border-red-500/50 focus:border-red-400'
            : 'bg-white/[0.08] border border-white/[0.22] hover:border-white/[0.38] focus:border-brand-400 focus:bg-white/[0.11]'
        }`}
      />
      <label className={`absolute left-4 pointer-events-none transition-all duration-200 ${
        active
          ? `top-1.5 text-[11px] font-medium ${error ? 'text-red-400' : 'text-brand-400'}`
          : 'top-1/2 -translate-y-1/2 text-[15px] text-slate-400'
      }`}>
        {label}
      </label>
      {error && <p className="mt-1.5 ml-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function ErrorBanner({ children }) {
  return (
    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
      {children}
    </div>
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full h-12 rounded-xl text-white font-medium btn-river hover:shadow-brand active:scale-[0.98] transition-shadow disabled:opacity-50 cursor-pointer mt-1">
      {loading
        ? <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Подождите…
          </span>
        : children}
    </button>
  )
}
