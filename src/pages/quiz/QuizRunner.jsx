import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X, Copy, RotateCcw } from 'lucide-react'
import Button from '../../components/ui/Button'

const isObjective = (type) => type !== 'open'
// равенство множеств индексов (для «несколько ответов»)
const sameSet = (a = [], b = []) =>
  a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',')

// Интерактивный тест: выбираешь ответы → «Проверить» → результат + подсветка.
// Плюс «Показать ключ», «Копировать» и (если передан onSave) «Сохранить результат».
// savedAnswers — открыть уже пройденным (история): показываем ответы + результат, а не с нуля.
export default function QuizRunner({ quiz, savedAnswers, onCheck }) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : []
  const type = quiz?.type
  // Хуки вызываются до любых ранних возвратов (правило хуков)
  const [sel, setSel] = useState(() => savedAnswers || {}) // qi → выбор (число | число[] | строка)
  const [checked, setChecked] = useState(() => !!savedAnswers)
  const [showKey, setShowKey] = useState(false)
  const [attemptSaved, setAttemptSaved] = useState(false) // прохождение сохранено (один раз)
  const reveal = checked || showKey

  if (!quiz) return <p className="text-sm text-slate-400">Тест не загружен.</p>
  if (!questions.length) return <p className="text-sm text-slate-400">В этом тесте нет вопросов.</p>

  const pick = (qi, oi) => {
    if (checked) return
    setSel((s) => {
      if (type === 'multiple') {
        const cur = Array.isArray(s[qi]) ? s[qi] : []
        return { ...s, [qi]: cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi] }
      }
      return { ...s, [qi]: oi }
    })
  }
  const setOpen = (qi, val) => { if (!checked) setSel((s) => ({ ...s, [qi]: val })) }
  const reset = () => { setSel({}); setChecked(false); setShowKey(false) }

  const total = isObjective(type) ? questions.length : 0
  const correctCount = questions.reduce((n, q, qi) => {
    if (!isObjective(type)) return n
    const ans = Array.isArray(q.answer) ? q.answer : []
    if (type === 'multiple') return n + (sameSet(sel[qi], ans) ? 1 : 0)
    return n + (sel[qi] === ans[0] ? 1 : 0)
  }, 0)

  const copy = async () => {
    try { await navigator.clipboard.writeText(quizToText(quiz)); toast.success('Скопировано') }
    catch { toast.error('Не удалось скопировать') }
  }

  // «Проверить»: показываем результат и (если задан onCheck) сохраняем прохождение в историю — один раз.
  const check = () => {
    setChecked(true)
    if (onCheck && !attemptSaved) {
      setAttemptSaved(true)
      const obj = isObjective(type)
      onCheck(sel, obj ? correctCount : null, obj ? total : null)
    }
  }

  return (
    <div>
      {/* Панель управления */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {!checked ? (
          <>
            <Button size="sm" onClick={check}>Проверить</Button>
            <button onClick={() => setShowKey((v) => !v)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {showKey ? 'Скрыть ключ' : 'Показать ключ'}
            </button>
          </>
        ) : (
          <>
            {isObjective(type) ? (
              <span className="inline-flex items-center h-9 px-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                Результат: {correctCount} / {total}
              </span>
            ) : (
              <span className="inline-flex items-center h-9 px-3 rounded-lg bg-slate-100 text-slate-600 text-sm">
                Открытые вопросы — сверьте с образцом
              </span>
            )}
            <button onClick={reset}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-4 h-4" /> Пройти заново
            </button>
          </>
        )}
        <button onClick={copy}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors ml-auto">
          <Copy className="w-4 h-4" /> Копировать
        </button>
      </div>

      {/* Вопросы */}
      <div className="space-y-3">
        {questions.map((q, qi) => (
          <QuestionItem key={qi} q={q} qi={qi} type={type} sel={sel[qi]} reveal={reveal}
            onPick={pick} onOpen={setOpen} />
        ))}
      </div>
    </div>
  )
}

function QuestionItem({ q, qi, type, sel, reveal, onPick, onOpen }) {
  const answer = Array.isArray(q.answer) ? q.answer : []
  const multiple = type === 'multiple'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-900 mb-2.5">{qi + 1}. {q.question}</div>

      {type === 'open' ? (
        <>
          <textarea rows={2} value={typeof sel === 'string' ? sel : ''} onChange={(e) => onOpen(qi, e.target.value)}
            placeholder="Ваш ответ…"
            className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15" />
          {reveal && q.sampleAnswer && (
            <div className="mt-2 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">
              <span className="text-xs text-emerald-600">Образец: </span>{q.sampleAnswer}
            </div>
          )}
        </>
      ) : (
        <ul className="space-y-1.5">
          {(q.options || []).map((opt, oi) => {
            const selected = multiple ? (Array.isArray(sel) && sel.includes(oi)) : sel === oi
            const correct = answer.includes(oi)
            let cls = 'border-slate-200 hover:border-slate-300'
            if (reveal) {
              if (correct) cls = 'border-emerald-300 bg-emerald-50 text-emerald-800'
              else if (selected) cls = 'border-red-300 bg-red-50 text-red-700'
              else cls = 'border-slate-200'
            } else if (selected) {
              cls = 'border-blue-500 bg-blue-50 text-blue-700'
            }
            return (
              <li key={oi}>
                <button type="button" onClick={() => onPick(qi, oi)} disabled={reveal}
                  className={`w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-lg border transition-colors ${cls} ${reveal ? 'cursor-default' : 'cursor-pointer'}`}>
                  <span className={`w-4 h-4 shrink-0 flex items-center justify-center ${multiple ? 'rounded' : 'rounded-full'} border ${
                    reveal && correct ? 'border-emerald-500 bg-emerald-500 text-white'
                      : reveal && selected ? 'border-red-400 bg-red-400 text-white'
                        : selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'
                  }`}>
                    {reveal && correct ? <Check className="w-3 h-3" />
                      : reveal && selected && !correct ? <X className="w-3 h-3" />
                        : selected ? <Check className="w-3 h-3" /> : null}
                  </span>
                  {opt}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {reveal && q.explanation && (
        <div className="text-xs text-slate-500 mt-2.5 border-t border-slate-100 pt-2">💡 {q.explanation}</div>
      )}
    </div>
  )
}

// Текстовая версия для копирования (вопросы + отмеченные ответы + пояснения)
function quizToText(quiz) {
  const lines = [quiz.topic, '']
  quiz.questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.question}`)
    const answer = Array.isArray(q.answer) ? q.answer : []
    if (quiz.type === 'open') {
      if (q.sampleAnswer) lines.push(`   Ответ: ${q.sampleAnswer}`)
    } else {
      (q.options || []).forEach((opt, j) => lines.push(`   ${answer.includes(j) ? '✓' : '·'} ${opt}`))
    }
    if (q.explanation) lines.push(`   (${q.explanation})`)
    lines.push('')
  })
  return lines.join('\n')
}
