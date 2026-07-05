// Переключатель табов с подчёркиванием активной вкладки.
// items: [{ id: 'profile', label: 'Профиль' }, ...]
export default function Tabs({ items, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {items.map(it => {
        const isActive = it.id === active
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            {it.label}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
