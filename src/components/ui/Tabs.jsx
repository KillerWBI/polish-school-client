import Tooltip from './Tooltip'

// Переключатель вкладок — одна реализация на всё приложение.
//   items: [{ key, label, count?, tip?, icon? }]
//   <Tabs items={items} value={tab} onChange={setTab} />
export default function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 p-1 bg-slate-50 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-none ${className}`}>
      {items.map(({ key, label, count, tip, icon: Icon }) => {
        const active = value === key
        return (
          <Tooltip key={key} text={tip} side="bottom">
            <button
              onClick={() => onChange(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}>
              {Icon && <Icon size={15} />}
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
