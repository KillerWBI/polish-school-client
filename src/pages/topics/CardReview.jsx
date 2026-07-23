import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, X, RotateCcw } from 'lucide-react'
import Button from '../../components/ui/Button'

// Обзор флеш-карточек: flip по клику → «Знаю/Не знаю» → SR-обновление (onReview).
// cards — массив { id, front, back, context? }; onReview(card, correct) → Promise; onDone() — выход.
export default function CardReview({ cards, onReview, onDone, hint }) {
  const { t } = useTranslation('student')
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [done, setDone]       = useState(0)
  const [finished, setFinished] = useState(false)

  if (finished) {
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <div className="text-4xl mb-3">🎉</div>
        <div className="text-lg font-semibold text-slate-900 mb-1">{t('cards.reviewed', { count: done })}</div>
        <p className="text-sm text-slate-500 mb-5">{t('cards.cardsReturn')}</p>
        <Button onClick={onDone}>{t('common:done')}</Button>
      </div>
    )
  }

  const card = cards[idx]
  if (!card) return null

  const answer = async (correct) => {
    setBusy(true)
    try {
      await onReview(card, correct)
      setDone(d => d + 1)
      setFlipped(false)
      if (idx + 1 < cards.length) setIdx(idx + 1)
      else setFinished(true)
    } catch (e) {
      toast.error(e.response?.data?.error || t('common:error'))
    } finally { setBusy(false) }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
        <span>{t('cards.progress', { current: idx + 1, total: cards.length })}</span>
        <span>{t('cards.reviewed', { count: done })}</span>
      </div>

      <button onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center hover:border-slate-300 transition-colors cursor-pointer">
        {card.context && <div className="text-[11px] text-slate-400 mb-2 truncate max-w-full">{card.context}</div>}
        <div className="text-xl font-semibold text-slate-900">{card.front}</div>
        {flipped ? (
          <>
            <div className="w-full border-t border-slate-100 my-4" />
            <div className="text-base text-blue-700 whitespace-pre-wrap">{card.back}</div>
          </>
        ) : (
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> {t('cards.flipHint')}</div>
        )}
      </button>

      {flipped ? (
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => answer(false)} loading={busy}>
            <X className="w-4 h-4 mr-1" /> {t('cards.dontKnow')}
          </Button>
          <Button className="flex-1" onClick={() => answer(true)} loading={busy}>
            <Check className="w-4 h-4 mr-1" /> {t('cards.know')}
          </Button>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 mt-4">{hint || t('study.cardHint')}</p>
      )}

      <div className="text-center mt-4">
        <button onClick={onDone} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">{t('cards.exit')}</button>
      </div>
    </div>
  )
}
