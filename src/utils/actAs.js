// Режим админа: в каком кабинете он работает — учителя или ученика (для тестирования).
// Хранится в браузере и уходит на сервер заголовком X-Act-As; сервер учитывает его только у админа.
const KEY = 'lf_act_as'

export const getActAs = () => {
  try { return localStorage.getItem(KEY) === 'student' ? 'student' : 'teacher' } catch { return 'teacher' }
}

// Смена режима — с полной перезагрузкой: так весь кэш запросов гарантированно уходит,
// и ни одна страница не покажет данные прежнего кабинета.
export const switchActAs = (mode) => {
  try { localStorage.setItem(KEY, mode) } catch { /* ignore */ }
  window.location.assign('/dashboard')
}
