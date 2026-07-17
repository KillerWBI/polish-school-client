import { countryToLang, SUPPORTED } from './countryToLang'

// Гео-определение языка по IP (клиентский, без ключа).
// Кэшируем результат, чтобы не дёргать API на каждый заход.
const GEO_CACHE_KEY = 'lf_geo_lang'

// Кастомный детектор для i18next-browser-languagedetector.
// Возвращает язык из кэша гео (если уже определяли) — синхронно.
// Само гео-определение запускается один раз в фоне (см. runGeoDetect) и,
// если пользователь ещё не выбирал язык вручную, переключает интерфейс.
export const geoDetector = {
  name: 'geo',
  lookup() {
    try {
      const cached = localStorage.getItem(GEO_CACHE_KEY)
      return SUPPORTED.includes(cached) ? cached : undefined
    } catch {
      return undefined
    }
  },
}

// Один раз спрашиваем страну по IP и, если язык ещё не выбран вручную,
// применяем язык страны. Вызывается из main после init i18n.
export async function runGeoDetect(i18n) {
  try {
    // Пользователь уже выбрал язык вручную — не трогаем
    if (localStorage.getItem('lf_lang')) return
    // Уже определяли гео — применили при init, повторно не нужно
    if (localStorage.getItem(GEO_CACHE_KEY)) return

    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) })
    const data = await res.json()
    const code = data?.country_code
    if (!code) return

    const lang = countryToLang(code)
    localStorage.setItem(GEO_CACHE_KEY, lang)
    // Меняем язык только если пользователь так и не выбрал вручную
    if (!localStorage.getItem('lf_lang') && i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  } catch {
    // сеть/таймаут — молча остаёмся на текущем (navigator/fallback)
  }
}
