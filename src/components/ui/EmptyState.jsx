import { IconEmpty } from './icons'

// Пустой список: иконка, заголовок, пояснение и кнопка следующего шага.
// Иконку берём из общего реестра — эмодзи в интерфейсе не используем.
export default function EmptyState({ icon: Icon = IconEmpty, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {text && <p className="text-sm text-slate-500 max-w-xs mb-5">{text}</p>}
      {action}
    </div>
  )
}
