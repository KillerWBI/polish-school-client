// Проверка точного ответа («впишите ответ») — для мгновенной подсветки «верно/неверно».
// ⚠️ Копия серверной polish-school/src/utils/quizScore.js: балл, который идёт в освоение и оценки,
// считает сервер. Правила должны совпадать, иначе подсветка разойдётся с засчитанным баллом.
export const normAnswer = (s) => String(s ?? '')
  .toLowerCase()
  .normalize('NFD').replace(/́/g, '').normalize('NFC') // знак ударения: «ньюто́н» → «ньютон»
  .replace(/ё/g, 'е')
  .replace(/(\d)\s+(?=\d)/g, '$1')        // «1 000» → «1000»
  .replace(/(\d),(\d)/g, '$1.$2')         // «0,25» → «0.25»
  .replace(/(\d)\s+(?=[^\d\s])/g, '$1')    // «30 Н» → «30н», «25 %» → «25%»
  .replace(/^["'«»\s]+|["'«».!?;:,\s]+$/g, '') // кавычки по краям и концевая пунктуация
  .replace(/\s+/g, ' ')
  .trim()

const NUMBER = /^-?\d+(\.\d+)?$/
const sameAnswer = (a, b) => (NUMBER.test(a) && NUMBER.test(b) ? Number(a) === Number(b) : a === b)

export const exactMatch = (given, accepted) => {
  if (typeof given !== 'string') return false
  const g = normAnswer(given)
  return !!g && (Array.isArray(accepted) ? accepted : []).some((a) => sameAnswer(g, normAnswer(a)))
}
