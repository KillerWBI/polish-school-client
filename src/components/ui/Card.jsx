// Карточка — базовый блок контента кабинета.
// title/subtitle/actions рисуют шапку; без них карточка просто оборачивает содержимое.
//   padded={false} — если внутри таблица или список во всю ширину
export default function Card({ title, subtitle, actions, icon: Icon, padded = true, className = '', children }) {
  const hasHead = title || actions
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>
      {hasHead && (
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0 flex items-start gap-2.5">
            {Icon && <span className="mt-0.5 text-slate-400"><Icon size={17} /></span>}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={padded ? (hasHead ? 'px-5 pb-5' : 'p-5') : ''}>{children}</div>
    </div>
  )
}
