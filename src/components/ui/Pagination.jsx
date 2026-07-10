import { ChevronLeft, ChevronRight } from 'lucide-react'

// Простая пагинация: prev/next + номера страниц.
// page — текущая (1-based), pages — всего, onChange(n) — коллбэк.
export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null

  // Показываем не более 5 номеров; скрываем крайние с многоточием
  const getPageNums = () => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, null, pages]
    if (page >= pages - 2) return [1, null, pages - 3, pages - 2, pages - 1, pages]
    return [1, null, page - 1, page, page + 1, null, pages]
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <NavBtn disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Назад">
        <ChevronLeft className="w-4 h-4" />
      </NavBtn>

      {getPageNums().map((n, i) =>
        n === null
          ? <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm select-none">…</span>
          : <PageBtn key={n} active={n === page} onClick={() => onChange(n)}>{n}</PageBtn>
      )}

      <NavBtn disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Вперёд">
        <ChevronRight className="w-4 h-4" />
      </NavBtn>
    </div>
  )
}

function NavBtn({ disabled, onClick, children, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      {...rest}
    >
      {children}
    </button>
  )
}

function PageBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
