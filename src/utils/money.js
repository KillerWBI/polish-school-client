import { useState, useEffect } from 'react'

// Мультивалютность ДЛЯ ЦЕН ПОДПИСКИ: показываем цену в валюте пользователя по его IP.
// Базовая валюта цен — USD. Реальное списание всё равно делает Paddle (это «≈» ориентир).
// Оплату уроков учитель↔ученик НЕ трогаем — там реальная валюта преподавателя.

const CUR_KEY = 'lf_currency' // кэш валюты { code }
const FX_KEY  = 'lf_fx_usd'   // кэш курсов к USD { ts, rates }
const DAY = 24 * 60 * 60 * 1000

// Страна (ISO-2) → код валюты (ISO-4217). ipwho.is отдаёт country_code, но не валюту,
// поэтому маппим сами. Символ и формат потом делает Intl по коду. Неизвестная страна → USD.
const EURO = ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES']
const COUNTRY_CURRENCY = {
  US:'USD', GB:'GBP', PL:'PLN', UA:'UAH', RU:'RUB', BY:'BYN', KZ:'KZT',
  CH:'CHF', SE:'SEK', NO:'NOK', DK:'DKK', CZ:'CZK', HU:'HUF', RO:'RON', BG:'BGN',
  CA:'CAD', AU:'AUD', NZ:'NZD', TR:'TRY', RS:'RSD', MD:'MDL', GE:'GEL', AM:'AMD', AZ:'AZN',
  IL:'ILS', AE:'AED', SA:'SAR', QA:'QAR', KW:'KWD', IN:'INR', CN:'CNY', JP:'JPY', KR:'KRW',
  ID:'IDR', TH:'THB', VN:'VND', PH:'PHP', MY:'MYR', SG:'SGD', HK:'HKD', TW:'TWD',
  BR:'BRL', MX:'MXN', AR:'ARS', CL:'CLP', CO:'COP', PE:'PEN', ZA:'ZAR', EG:'EGP',
  NG:'NGN', MA:'MAD', KE:'KES', PK:'PKR', BD:'BDT', LK:'LKR', UZ:'UZS',
  ...Object.fromEntries(EURO.map((c) => [c, 'EUR'])),
}
const currencyForCountry = (code) => COUNTRY_CURRENCY[code] || 'USD'

// Валюта из кэша (её кладёт ensureCurrency). Дефолт — USD, если ещё не определяли.
export function cachedCurrency() {
  try {
    const c = JSON.parse(localStorage.getItem(CUR_KEY) || 'null')
    if (c?.code) return c
  } catch { /* битый кэш — игнор */ }
  return { code: 'USD' }
}

// Определить валюту по IP один раз (ipwho.is → страна → валюта) и закэшировать.
export async function ensureCurrency() {
  if (localStorage.getItem(CUR_KEY)) return cachedCurrency() // уже знаем
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) })
    const data = await res.json()
    const country = data?.country_code
    if (country) {
      const cur = { code: currencyForCountry(country) }
      localStorage.setItem(CUR_KEY, JSON.stringify(cur))
      return cur
    }
  } catch { /* сеть/таймаут — остаёмся на дефолте */ }
  return cachedCurrency()
}

// Курсы валют к USD (USD = 1). Кэш на сутки. Возвращает объект { PLN: 3.8, ... } или null.
export async function getRates() {
  // свежий кэш?
  try {
    const c = JSON.parse(localStorage.getItem(FX_KEY) || 'null')
    if (c?.rates && Date.now() - c.ts < DAY) return c.rates
  } catch { /* игнор */ }
  // тянем живой курс (бесплатный API без ключа)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    if (data?.rates) {
      localStorage.setItem(FX_KEY, JSON.stringify({ ts: Date.now(), rates: data.rates }))
      return data.rates
    }
  } catch { /* сеть — попробуем протухший кэш ниже */ }
  // не удалось — вернём даже устаревший кэш, если он есть
  try {
    const c = JSON.parse(localStorage.getItem(FX_KEY) || 'null')
    if (c?.rates) return c.rates
  } catch { /* игнор */ }
  return null
}

// Красивое форматирование суммы в валюте: Intl сам подставит символ и разряды под локаль.
export function formatMoney(amount, code, locale) {
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: 'currency', currency: code, maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${code}` // неизвестный код валюты — запасной вид
  }
}

// Перевод суммы между валютами. Курсы от open.er-api.com даны к USD, поэтому
// кросс-курс считаем через доллар: сумма → USD → целевая валюта.
// Нет курса (сеть не ответила) → null, и вызывающий просто не покажет «≈».
export function convert(amount, from, to, rates) {
  if (!rates || !from || !to) return null
  if (from === to) return amount
  const fromRate = rates[from]
  const toRate   = rates[to]
  if (!fromRate || !toRate) return null
  return (amount / fromRate) * toRate
}

// Свести долг, разложенный по валютам ({ PLN: 500, EUR: 40 }), к одной цифре.
// Бэкенд намеренно не складывает валюты сам — сложение имеет смысл только по курсу,
// а курс это уже показ. Возвращает { value, code, approx }:
//   approx=false — валюта была одна, цифра точная;
//   approx=true  — считали по курсу, показываем со знаком «≈».
export function sumByCurrency(byCurrency, viewerCode, rates) {
  const entries = Object.entries(byCurrency || {}).filter(([, amt]) => amt > 0)
  if (!entries.length) return { value: 0, code: viewerCode || 'PLN', approx: false }
  if (entries.length === 1) {
    const [code, value] = entries[0]
    return { value, code, approx: false } // одна валюта — не пересчитываем и не врём «≈»
  }
  // Несколько валют: приводим к валюте смотрящего. Если курса нет — показываем
  // самую крупную корзину как есть, чтобы цифра осталась правдивой.
  const target = viewerCode || entries[0][0]
  let total = 0
  for (const [code, amount] of entries) {
    const c = convert(amount, code, target, rates)
    if (c == null) {
      const biggest = entries.sort((a, b) => b[1] - a[1])[0]
      return { value: biggest[1], code: biggest[0], approx: false }
    }
    total += c
  }
  return { value: total, code: target, approx: true }
}

// Хук: локальная валюта + курсы. Пока грузятся — cur из кэша (или USD), rates=null.
export function useCurrency() {
  const [state, setState] = useState({ cur: cachedCurrency(), rates: null })
  useEffect(() => {
    let alive = true
    ensureCurrency().then((cur) => getRates().then((rates) => {
      if (alive) setState({ cur, rates })
    }))
    return () => { alive = false } // не обновляем состояние после размонтирования
  }, [])
  return state
}
