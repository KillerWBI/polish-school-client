// Обёртка над sonner — единая точка для уведомлений.
import { toast as sonner } from 'sonner'

const opts = {
  duration: 3500,
  className: 'rounded-xl',
}

export const toast = {
  success: (msg, o = {}) => sonner.success(msg, { ...opts, ...o }),
  error:   (msg, o = {}) => sonner.error(msg,   { ...opts, duration: 5000, ...o }),
  info:    (msg, o = {}) => sonner(msg,         { ...opts, ...o }),
  loading: (msg, o = {}) => sonner.loading(msg, { ...opts, ...o }),
  dismiss: (id)          => sonner.dismiss(id),
}

// Извлекает понятную ошибку из axios-ошибки
export function errMsg(e, fallback = 'Что-то пошло не так') {
  return e?.response?.data?.error || e?.message || fallback
}
