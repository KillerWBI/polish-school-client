// Поддерживаемые языки. native — самоназвание для отображения.
// При добавлении языка тут — он сразу появится в LanguagesEditor.
export const LANGUAGES = [
  { code: 'pl', native: 'Polski' },
  { code: 'en', native: 'English' },
  { code: 'de', native: 'Deutsch' },
  { code: 'fr', native: 'Français' },
  { code: 'es', native: 'Español' },
  { code: 'it', native: 'Italiano' },
  { code: 'pt', native: 'Português' },
  { code: 'ru', native: 'Русский' },
  { code: 'uk', native: 'Українська' },
  { code: 'zh', native: '中文' },
  { code: 'ja', native: '日本語' },
  { code: 'ko', native: '한국어' },
  { code: 'ar', native: 'العربية' },
]

// Стандарт CEFR — уровни владения языком для студентов
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Утилита: найти native по code (для отображения)
export const getLanguageName = (code) =>
  LANGUAGES.find(l => l.code === code)?.native ?? code
