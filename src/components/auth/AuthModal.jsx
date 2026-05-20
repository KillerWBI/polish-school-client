import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import useAuth from '../../hooks/useAuth'
import { login as apiLogin, register as apiRegister, fetchMe } from '../../api/auth.api'
import { setToken } from '../../utils/token'

// Модалка с табами «Вход» и «Регистрация»
// initialTab — какой таб открыт при mount
export default function AuthModal({ open, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const tabsRef = useRef(null)
  const indicatorRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Сброс состояния при открытии
  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setForm({ name: '', email: '', password: '' })
      setErrors({})
      setSuccess(false)
    }
  }, [open, initialTab])

  // Анимация индикатора табов
  useEffect(() => {
    if (!tabsRef.current || !indicatorRef.current) return
    const activeBtn = tabsRef.current.querySelector(`[data-tab="${tab}"]`)
    if (!activeBtn) return
    gsap.to(indicatorRef.current, {
      x: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      duration: 0.4,
      ease: 'power3.out',
    })
  }, [tab, open])

  const validate = () => {
    const e = {}
    if (tab === 'register' && form.name.trim().length < 2) e.name = 'Введите имя'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Неверный email'
    if (form.password.length < 6) e.password = 'Минимум 6 символов'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      let token
      if (tab === 'register') {
        const data = await apiRegister(form)
        token = data.token
      } else {
        const data = await apiLogin({ email: form.email, password: form.password })
        token = data.token
      }
      // Сохраняем токен, читаем профиль
      setToken(token)
      const me = await fetchMe()
      login(token, me)

      setSuccess(true)
      // Дать анимации проиграться → редирект на /welcome
      setTimeout(() => {
        onClose?.()
        navigate('/welcome')
      }, 1300)
    } catch (err) {
      const msg = err.response?.data?.error || 'Что-то пошло не так'
      setErrors({ form: msg })
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={submitting ? () => {} : onClose} maxWidth="max-w-md">
      {/* Кнопка закрытия */}
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/[0.10] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Закрыть"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="p-8 sm:p-10">
        {/* Состояние успеха */}
        {success ? (
          <SuccessState tab={tab} />
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-ink mb-1">
              {tab === 'login' ? 'С возвращением' : 'Привет, давай знакомиться'}
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              {tab === 'login'
                ? 'Войди, чтобы продолжить обучение'
                : 'Создай аккаунт за 30 секунд'}
            </p>

            {/* Табы */}
            <div
              ref={tabsRef}
              className="relative flex p-1 bg-white/[0.06] rounded-xl mb-6"
            >
              <div
                ref={indicatorRef}
                className="absolute top-1 bottom-1 left-0 bg-white/[0.12] rounded-lg border border-white/[0.10]"
              />
              <button
                type="button"
                data-tab="login"
                onClick={() => setTab('login')}
                className={`relative z-10 flex-1 h-10 text-sm font-medium transition-colors cursor-pointer ${
                  tab === 'login' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                data-tab="register"
                onClick={() => setTab('register')}
                className={`relative z-10 flex-1 h-10 text-sm font-medium transition-colors cursor-pointer ${
                  tab === 'register' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'register' && (
                <Input
                  label="Имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  autoComplete="name"
                />
              )}
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Пароль"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />

              {errors.form && (
                <div className="text-sm text-red-400 bg-red-500/[0.10] border border-red-500/[0.20] rounded-lg px-3 py-2">
                  {errors.form}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                className="w-full mt-2"
              >
                {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
              </Button>
            </form>

            <p className="mt-5 text-xs text-center text-ink-muted">
              {tab === 'login' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
              <button
                type="button"
                onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                className="text-brand-400 hover:text-brand-300 font-medium cursor-pointer"
              >
                {tab === 'login' ? 'Создать' : 'Войти'}
              </button>
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}

// Состояние успеха — галочка и сообщение
function SuccessState({ tab }) {
  const checkRef = useRef(null)
  useEffect(() => {
    if (!checkRef.current) return
    const path = checkRef.current
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(path, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 })
  }, [])

  return (
    <div className="py-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-pink-accent flex items-center justify-center shadow-brand mb-5">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            ref={checkRef}
            d="M10 20 L17 27 L30 13"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-ink mb-1">
        {tab === 'register' ? 'Аккаунт создан!' : 'Добро пожаловать!'}
      </h3>
      <p className="text-sm text-ink-muted">Сейчас перенаправим тебя дальше…</p>
    </div>
  )
}
