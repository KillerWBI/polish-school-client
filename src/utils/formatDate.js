const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const DAYS_RU   = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

// '2026-05-19' → '19 мая 2026'
export const formatDate = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-').map(Number)
  return `${d} ${MONTHS_RU[m - 1]} ${y}`
}

// '2026-05-19' → '19 мая'
export const formatDateShort = (str) => {
  if (!str) return ''
  const [, m, d] = str.split('-').map(Number)
  return `${d} ${MONTHS_SHORT[m - 1]}`
}

// '2026-05-19' → 'Вт'
export const formatDayName = (str) => {
  if (!str) return ''
  return DAYS_RU[new Date(str + 'T12:00:00').getDay()]
}

// day index 0-6 → 'Пн'
export const dayLabel = (day) => DAYS_RU[day] ?? ''

// '2026-05' → 'Май 2026'
export const formatMonth = (str) => {
  if (!str) return ''
  const [y, m] = str.split('-').map(Number)
  return `${MONTHS_SHORT[m - 1]} ${y}`
}

// Current month as 'YYYY-MM'
export const currentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// First/last day of a month given 'YYYY-MM'
export const monthRange = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const from = `${y}-${String(m).padStart(2, '0')}-01`
  const to   = new Date(y, m, 0).toISOString().slice(0, 10)
  return { from, to }
}
