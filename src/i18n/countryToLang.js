// Маппинг кода страны (ISO-2) на язык интерфейса.
// Поддерживаемые языки: pl, uk, ru, en, es, fr, de. Всё остальное → en.
const MAP = {
  // польский
  PL: 'pl',
  // украинский
  UA: 'uk',
  // русский (постсоветское русскоязычное пространство)
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // испанский
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // французский
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  // немецкий
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // английский
  GB: 'en', US: 'en', IE: 'en', CA: 'en', AU: 'en', NZ: 'en',
}

export const SUPPORTED = ['pl', 'uk', 'ru', 'en', 'es', 'fr', 'de']
export const FALLBACK = 'en'

// Нативные названия языков — для переключателя
export const LANG_NAMES = {
  pl: 'Polski',
  uk: 'Українська',
  ru: 'Русский',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

export function countryToLang(code) {
  if (!code) return FALLBACK
  return MAP[code.toUpperCase()] || FALLBACK
}
