import { useTranslation } from 'react-i18next'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

// Примеры того, что можно оформить как учебный трек — вдохновение для ученика.
// Тексты берутся из i18n (student.ideas.*); здесь только эмодзи + ключ.
const IDEA_KEYS = [
  ['📚', 'school'],
  ['🗣️', 'lang'],
  ['💻', 'skills'],
  ['📖', 'books'],
  ['🎓', 'exam'],
  ['🧠', 'any'],
]

export default function IdeasModal({ onClose }) {
  const { t } = useTranslation('student')
  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{t('ideas.title')}</h3>
        <p className="text-sm text-slate-500 mb-4">{t('ideas.intro')}</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {IDEA_KEYS.map(([emoji, k]) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="text-sm font-medium text-slate-900">{emoji} {t(`ideas.${k}Title`)}</div>
              <div className="text-xs text-slate-500 mt-1">{t(`ideas.${k}Text`)}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Button className="w-full" onClick={onClose}>{t('ideas.gotIt')}</Button>
        </div>
      </div>
    </Modal>
  )
}
