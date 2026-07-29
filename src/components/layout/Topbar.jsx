import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications.api'
import { safeUrl } from '../../utils/safeUrl'
import { SUPPORTED, LANG_NAMES } from '../../i18n/countryToLang'
import Tooltip from '../ui/Tooltip'
import {
  IconNotifications, IconHomework, IconSuccess, IconDeadline, IconInvite,
  IconMoney, IconError, IconExpand, IconSettings, IconHelp, IconSupport,
  IconLanguage, IconInstall, IconLogout, IconCheck,
} from '../ui/icons'

// Иконка + цвет по типу уведомления
const NOTIF_META = {
  homework_assigned:  { Icon: IconHomework, cls: 'bg-amber-50 text-amber-600' },
  homework_graded:    { Icon: IconSuccess,  cls: 'bg-emerald-50 text-emerald-600' },
  attendance_pending: { Icon: IconDeadline, cls: 'bg-blue-50 text-blue-600' },
  invitation_received:{ Icon: IconInvite,   cls: 'bg-blue-50 text-blue-600' },
  payment_recorded:   { Icon: IconMoney,    cls: 'bg-emerald-50 text-emerald-600' },
  payment_submitted:  { Icon: IconMoney,    cls: 'bg-amber-50 text-amber-600' },
  payment_approved:   { Icon: IconSuccess,  cls: 'bg-emerald-50 text-emerald-600' },
  payment_rejected:   { Icon: IconError,    cls: 'bg-red-50 text-red-600' },
  review_due:         { Icon: IconDeadline, cls: 'bg-blue-50 text-blue-600' },
  _default:           { Icon: IconNotifications, cls: 'bg-slate-100 text-slate-500' },
}

// Левая часть шапки намеренно пустая: развёрнутый сайдбар накрывает её краем,
// поэтому ничего интерактивного слева не держим.
export default function Topbar() {
  const navigate = useNavigate()
  return (
    <header className="hidden lg:flex items-center h-16 px-6 bg-white border-b border-slate-200">
      <div className="ml-auto flex items-center gap-2">
        <NotifBell navigate={navigate} />
        <ProfileMenu navigate={navigate} />
      </div>
    </header>
  )
}

/* ── Меню профиля: единственное место, где показаны имя и роль ── */
export function ProfileMenu({ navigate, onNavigate }) {
  const { t } = useTranslation('app')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const { user, isTeacher, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setLangOpen(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const currentLang = (i18n.language || 'en').split('-')[0]
  const needsPaymentDetails = isTeacher && !user?.paymentDetails

  const go = (to) => { setOpen(false); onNavigate?.(); navigate(to) }
  const chooseLang = (lng) => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lf_lang', lng) } catch { /* ignore */ }
    setLangOpen(false)
  }

  const rowCls = 'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left'

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="flex items-center gap-2.5 h-10 pl-1 pr-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
        <span className="relative w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
          {user?.avatar
            ? <img src={safeUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
            : (user?.name?.[0]?.toUpperCase() ?? '?')}
        </span>
        <span className="text-xs font-medium text-slate-900 max-w-[110px] truncate">{user?.name?.split(' ')[0] ?? '—'}</span>
        {needsPaymentDetails && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        <IconExpand size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? '—'}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role ? t(`role.${user.role}`) : t('sidebar.user')}{user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>

          <div className="py-1">
            <button onClick={() => go('/settings')} className={rowCls}>
              <IconSettings size={16} className="text-slate-400" />
              <span className="flex-1">{t('sidebar.settings')}</span>
              {needsPaymentDetails && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">!</span>
              )}
            </button>
            <button onClick={() => go('/help')} className={rowCls}>
              <IconHelp size={16} className="text-slate-400" /> {t('sidebar.help')}
            </button>
            <button onClick={() => go('/support')} className={rowCls}>
              <IconSupport size={16} className="text-slate-400" /> {t('sidebar.support')}
            </button>
          </div>

          <div className="py-1 border-t border-slate-100">
            <button onClick={() => setLangOpen(v => !v)} className={rowCls} aria-expanded={langOpen}>
              <IconLanguage size={16} className="text-slate-400" />
              <span className="flex-1">{tc('language')}</span>
              <span className="text-xs text-slate-400 uppercase">{currentLang}</span>
              <IconExpand size={14} className={`text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="max-h-56 overflow-y-auto bg-slate-50/60">
                {SUPPORTED.map((lng) => (
                  <button key={lng} onClick={() => chooseLang(lng)}
                    className={`w-full flex items-center justify-between pl-10 pr-3 py-1.5 text-sm text-left transition-colors ${
                      currentLang === lng ? 'text-blue-700 font-medium' : 'text-slate-600 hover:text-slate-900'
                    }`}>
                    {LANG_NAMES[lng]}
                    {currentLang === lng && <IconCheck size={14} />}
                  </button>
                ))}
              </div>
            )}
            {installPrompt && (
              <button onClick={() => { installPrompt.prompt(); setInstallPrompt(null); setOpen(false) }}
                className={`${rowCls} text-blue-600`}>
                <IconInstall size={16} /> {t('sidebar.install')}
              </button>
            )}
          </div>

          <div className="py-1 border-t border-slate-100">
            <button onClick={() => { setOpen(false); logout(); navigate('/') }}
              className={`${rowCls} text-slate-500 hover:text-red-600 hover:bg-red-50`}>
              <IconLogout size={16} /> {t('sidebar.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Рабочие уведомления (реальные, из /notifications) ── */
export function NotifBell({ navigate }) {
  const { t } = useTranslation('app')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const load = () => {
    getNotifications({ }).then((res) => {
      setItems(res.data || [])
      setUnread(res.meta?.unreadCount ?? 0)
    }).catch(() => {})
  }

  // Загрузка при монтировании + опрос раз в 60с
  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  const openItem = async (n) => {
    setOpen(false)
    if (!n.readAt) {
      setUnread(u => Math.max(0, u - 1))
      setItems(list => list.map(x => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      markNotificationRead(n.id).catch(() => {})
    }
    if (n.link) navigate(n.link)
  }

  const readAll = async () => {
    setUnread(0)
    setItems(list => list.map(x => ({ ...x, readAt: x.readAt || new Date().toISOString() })))
    markAllNotificationsRead().catch(() => {})
  }

  return (
    <div ref={ref} className="relative">
      <Tooltip text={t('topbar.notificationsTooltip')} side="bottom">
        <button onClick={() => setOpen(v => !v)} aria-label={t('topbar.notifications')}
          className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <IconNotifications size={18} strokeWidth={1.9} />
          {unread > 0 && <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">{unread}</span>}
        </button>
      </Tooltip>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{t('topbar.notifications')}</span>
            {unread > 0 && (
              <button onClick={readAll} className="text-[11px] text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                {t('topbar.markAllRead')}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <span className="inline-flex w-10 h-10 rounded-xl bg-slate-100 text-slate-400 items-center justify-center mb-2"><IconNotifications size={20} /></span>
              <p className="text-sm text-slate-400">{t('topbar.noNotifications')}</p>
            </div>
          ) : (
            <div className="py-1 max-h-[380px] overflow-y-auto">
              {items.map((n) => {
                const meta = NOTIF_META[n.type] ?? NOTIF_META._default
                return (
                  <button key={n.id} onClick={() => openItem(n)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-left ${!n.readAt ? 'bg-blue-50/40' : ''}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.cls}`}><meta.Icon size={16} /></span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                      {n.body && <span className="block text-xs text-slate-500 truncate">{n.body}</span>}
                    </span>
                    {!n.readAt && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
