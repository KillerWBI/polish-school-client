import {
  IconNotifications, IconHomework, IconSuccess, IconDeadline,
  IconInvite, IconMoney, IconError,
} from './icons'

// Иконка + цвет по типу уведомления. Общее для колокольчика и страницы «История событий».
export const NOTIF_META = {
  homework_assigned:  { Icon: IconHomework, cls: 'bg-amber-50 text-amber-600' },
  homework_graded:    { Icon: IconSuccess,  cls: 'bg-emerald-50 text-emerald-600' },
  attendance_pending: { Icon: IconDeadline, cls: 'bg-teal-50 text-teal-600' },
  invitation_received:{ Icon: IconInvite,   cls: 'bg-teal-50 text-teal-600' },
  payment_recorded:   { Icon: IconMoney,    cls: 'bg-emerald-50 text-emerald-600' },
  payment_submitted:  { Icon: IconMoney,    cls: 'bg-amber-50 text-amber-600' },
  payment_approved:   { Icon: IconSuccess,  cls: 'bg-emerald-50 text-emerald-600' },
  payment_rejected:   { Icon: IconError,    cls: 'bg-red-50 text-red-600' },
  invoice_issued:     { Icon: IconMoney,    cls: 'bg-teal-50 text-teal-600' },
  review_due:         { Icon: IconDeadline, cls: 'bg-teal-50 text-teal-600' },
  _default:           { Icon: IconNotifications, cls: 'bg-slate-100 text-slate-500' },
}

export const notifMeta = (type) => NOTIF_META[type] ?? NOTIF_META._default
