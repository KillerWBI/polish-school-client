import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { SUPPORTED, FALLBACK } from './countryToLang'
import { geoDetector } from './detectLocale'

// Ресурсы (namespaces) собираются из locales/<язык>/<namespace>.json автоматически.
// Раньше каждый файл ещё и вручную импортировался сюда — перевод легко было написать
// и забыть подключить, тогда язык молча оставался на английском фолбэке.
// ⚠️ НЕ eager: 7 языков × 7 словарей = 1.2 МБ, и все они сидели в главном бандле —
// первый заход на сайт тянул ~1.9 МБ JS (5–7 сек). Теперь каждый словарь — свой чанк,
// грузится только язык посетителя (+ фолбэк); смена языка сначала догружает словари.
const modules = import.meta.glob('./locales/*/*.json', { import: 'default' })

const lazyBackend = {
  type: 'backend',
  read(lang, ns, callback) {
    const load = modules[`./locales/${lang}/${ns}.json`]
    if (!load) return callback(null, {})
    load().then((dict) => callback(null, dict), (err) => callback(err, null))
  },
}

// Регистрируем кастомный гео-детектор (читает кэш lf_geo_lang)
const detector = new LanguageDetector()
detector.addDetector(geoDetector)

// Промис инициализации: main.jsx ждёт его перед первым рендером, иначе мелькнули бы ключи.
export const i18nReady = i18n
  .use(lazyBackend)
  .use(detector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED,
    fallbackLng: FALLBACK,
    ns: ['common', 'landing', 'app', 'teacher', 'student', 'legal', 'help'],
    defaultNS: 'common',
    load: 'languageOnly', // 'pl-PL' → 'pl'
    interpolation: { escapeValue: false },
    detection: {
      // Порядок: ?lang= в адресе → явный выбор → гео (кэш) → язык браузера.
      // querystring первым: на эти адреса ведут hreflang-ссылки для Google и ими же
      // делятся ссылкой «открой на польском» — явный параметр должен побеждать.
      order: ['querystring', 'localStorage', 'geo', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'lf_lang',
      caches: [], // выбор пишем сами (LanguageSwitcher) в lf_lang
    },
    react: { useSuspense: false },
  })

export default i18n
