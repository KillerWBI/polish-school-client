import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { SUPPORTED, FALLBACK } from './countryToLang'
import { geoDetector } from './detectLocale'

// Ресурсы (namespaces). Пока — common; остальные namespace добавляются по фазам.
import ruCommon from './locales/ru/common.json'
import plCommon from './locales/pl/common.json'
import ukCommon from './locales/uk/common.json'
import enCommon from './locales/en/common.json'
import esCommon from './locales/es/common.json'
import frCommon from './locales/fr/common.json'
import deCommon from './locales/de/common.json'
// landing: ru + en (источник + fallback) + pl/uk (рыночные); es/fr/de пока фолбэк на en
import ruLanding from './locales/ru/landing.json'
import enLanding from './locales/en/landing.json'
import plLanding from './locales/pl/landing.json'
import ukLanding from './locales/uk/landing.json'
// app: оболочка/auth/дашборд — ru/en/pl/uk; es/fr/de пока фолбэк на en
import ruApp from './locales/ru/app.json'
import enApp from './locales/en/app.json'
import plApp from './locales/pl/app.json'
import ukApp from './locales/uk/app.json'
// teacher: страницы учителя — ru/en/pl/uk; es/fr/de пока фолбэк на en
import ruTeacher from './locales/ru/teacher.json'
import enTeacher from './locales/en/teacher.json'
import plTeacher from './locales/pl/teacher.json'
import ukTeacher from './locales/uk/teacher.json'
// student: страницы ученика (треки/словарь/сессия/заметки/прогресс…) — ru/en/pl/uk; es/fr/de фолбэк на en
import ruStudent from './locales/ru/student.json'
import enStudent from './locales/en/student.json'
import plStudent from './locales/pl/student.json'
import ukStudent from './locales/uk/student.json'

const resources = {
  ru: { common: ruCommon, landing: ruLanding, app: ruApp, teacher: ruTeacher, student: ruStudent },
  pl: { common: plCommon, landing: plLanding, app: plApp, teacher: plTeacher, student: plStudent },
  uk: { common: ukCommon, landing: ukLanding, app: ukApp, teacher: ukTeacher, student: ukStudent },
  en: { common: enCommon, landing: enLanding, app: enApp, teacher: enTeacher, student: enStudent },
  es: { common: esCommon },
  fr: { common: frCommon },
  de: { common: deCommon },
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
    ns: ['common', 'landing', 'app', 'teacher', 'student'],
    defaultNS: 'common',
    load: 'languageOnly', // 'pl-PL' → 'pl'
    interpolation: { escapeValue: false },
    detection: {
      // Порядок: явный выбор → гео (кэш) → язык браузера
      order: ['localStorage', 'geo', 'navigator'],
      lookupLocalStorage: 'lf_lang',
      caches: [], // выбор пишем сами (LanguageSwitcher) в lf_lang
    },
    react: { useSuspense: false },
  })

export default i18n
