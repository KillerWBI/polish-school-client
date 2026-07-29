// Обёртка над sonner — единая точка для уведомлений.
import { toast as sonner } from 'sonner'

const opts = {
  duration: 3500,
  className: 'rounded-xl',
}

// Одинаковый текст не должен показываться дважды: сам текст служит идентификатором,
// поэтому повторное сообщение обновляет уже висящее, а не встаёт вторым в стопку.
const base = (msg, o) => ({ ...opts, ...(typeof msg === 'string' ? { id: msg } : null), ...o })

export const toast = {
  success: (msg, o = {}) => sonner.success(msg, base(msg, o)),
  error:   (msg, o = {}) => sonner.error(msg,   base(msg, { duration: 5000, ...o })),
  info:    (msg, o = {}) => sonner(msg,         base(msg, o)),
  loading: (msg, o = {}) => sonner.loading(msg, base(msg, o)),
  dismiss: (id)          => sonner.dismiss(id),
}

// Извлекает понятную ошибку из axios-ошибки
export function errMsg(e, fallback = 'Что-то пошло не так') {
  return e?.response?.data?.error || e?.message || fallback
}
