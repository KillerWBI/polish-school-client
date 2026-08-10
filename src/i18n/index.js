import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { SUPPORTED, FALLBACK } from './countryToLang'
import { geoDetector } from './detectLocale'

// Ресурсы (namespaces) собираются из locales/<язык>/<namespace>.json автоматически.
// Раньше каждый файл ещё и вручную импортировался сюда — перевод легко было написать
// и забыть подключить, тогда язык молча оставался на английском фолбэке.
const modules = import.meta.glob('./locales/*/*.json', { eager: true, import: 'default' })

const resources = {}
for (const [path, dict] of Object.entries(modules)) {
  const [, lang, ns] = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)
  ;(resources[lang] ||= {})[ns] = dict
}

// Регистрируем кастомный гео-детектор (читает кэш lf_geo_lang)
const detector = new LanguageDetector()
detector.addDetector(geoDetector)

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
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
