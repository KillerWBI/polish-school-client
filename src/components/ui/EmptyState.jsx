export default function EmptyState({ emoji = '📭', title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">{emoji}</div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {text && <p className="text-sm text-slate-400 max-w-xs mb-5">{text}</p>}
      {action}
    </div>
  )
}
