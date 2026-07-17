import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

// Примеры того, что можно оформить как учебный трек — вдохновение для ученика.
const IDEAS = [
  { emoji: '📚', title: 'Школьные предметы', text: 'Дроби, фотосинтез, теорема Пифагора, Вторая мировая' },
  { emoji: '🗣️', title: 'Языки', text: 'Present Perfect, польские падежи, испанские глаголы' },
  { emoji: '💻', title: 'Навыки и профессии', text: 'Основы React, SQL-запросы, Excel-формулы, копирайтинг' },
  { emoji: '📖', title: 'Книги и материалы', text: 'Разбор главы учебника, конспект статьи, термины лекции' },
  { emoji: '🎓', title: 'Подготовка к экзамену', text: 'ЕГЭ, IELTS, вступительные — по темам' },
  { emoji: '🧠', title: 'Что угодно интересное', text: 'Астрономия, шахматные дебюты, история искусства' },
]

export default function IdeasModal({ onClose }) {
  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Что можно изучать?</h3>
        <p className="text-sm text-slate-500 mb-4">
          Создайте трек по любой теме — платформа сама разобьёт её на шаги и будет генерировать тесты,
          подстраиваясь под ваш уровень. Преподаватель не нужен.
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {IDEAS.map((i) => (
            <div key={i.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="text-sm font-medium text-slate-900">{i.emoji} {i.title}</div>
              <div className="text-xs text-slate-500 mt-1">{i.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Button className="w-full" onClick={onClose}>Понятно</Button>
        </div>
      </div>
    </Modal>
  )
}
