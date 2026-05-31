import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { resendVerification } from '../../api/auth.api'
import { toast, errMsg } from '../../utils/toast'

// Баннер «Подтвердите email» — показывается в AppLayout если !emailVerified
export default function EmailVerificationBanner() {
  const { user } = useAuth()
  const [busy, setBusy]       = useState(false)
  const [hidden, setHidden]   = useState(false)

  if (!user || user.emailVerified || hidden) return null

  const handleResend = async () => {
    setBusy(true)
    try {
      await resendVerification()
      toast.success(`Письмо отправлено на ${user.email}`)
    } catch (e) {
      toast.error(errMsg(e, 'Не удалось отправить письмо'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-start sm:items-center gap-3 px-4 sm:px-6 py-2.5 bg-amber-500/[0.08] border-b border-amber-500/20 text-[13px]">
      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgb(251 191 36)" strokeWidth="2">
          <path d="M3 8l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="flex-1 text-amber-200 leading-snug">
        <span className="font-medium">Подтвердите email.</span>{' '}
        <span className="text-amber-300/70 hidden sm:inline">Мы отправили письмо на {user.email}.</span>
      </p>
      <button
        onClick={handleResend}
        disabled={busy}
        className="text-amber-300 hover:text-amber-200 underline text-[12px] cursor-pointer disabled:opacity-50 shrink-0"
      >
        {busy ? 'Отправляется…' : 'Отправить снова'}
      </button>
      <button
        onClick={() => setHidden(true)}
        className="text-amber-400/50 hover:text-amber-300 transition-colors shrink-0 cursor-pointer"
        aria-label="Скрыть"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
