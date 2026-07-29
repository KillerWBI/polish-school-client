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
  // Пустое сообщение = показывать нечего (ошибку уже показал перехватчик запросов)
  error:   (msg, o = {}) => (msg ? sonner.error(msg, base(msg, { duration: 5000, ...o })) : undefined),
  info:    (msg, o = {}) => sonner(msg,         base(msg, o)),
  loading: (msg, o = {}) => sonner.loading(msg, base(msg, o)),
  dismiss: (id)          => sonner.dismiss(id),
}

// Извлекает понятную ошибку из axios-ошибки.
// Упор в лимит тарифа перехватчик уже показал отдельным тостом с кнопкой — здесь молчим.
export function errMsg(e, fallback = 'Что-то пошло не так') {
  if (e?.planLimitShown) return ''
  return e?.response?.data?.error || e?.message || fallback
}
